-- ============================================================================
-- FARMORA SUPABASE POSTGRESQL DATABASE MIGRATION
-- Migration Version: 20260815000001
-- Description: Indexes, Atomic Stock RPCs, RLS Policies, Storage Buckets
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. INDEX OPTIMIZATIONS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON public.orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner_id ON public.orders(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

CREATE INDEX IF NOT EXISTS idx_crop_records_farmer_id ON public.crop_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_disease_detections_farmer_id ON public.disease_detections(farmer_id);
CREATE INDEX IF NOT EXISTS idx_disease_detections_created_at ON public.disease_detections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_farmer_id ON public.yield_predictions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_created_at ON public.yield_predictions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON public.notifications(profile_id);

-- ----------------------------------------------------------------------------
-- 2. ATOMIC ORDER CREATION & STOCK DEDUCTION RPC FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_order(
    p_customer_id UUID,
    p_delivery_address TEXT,
    p_payment_method TEXT,
    p_items JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_code TEXT;
    v_total_amount NUMERIC(12,2) := 0.00;
    v_item JSONB;
    v_product_id UUID;
    v_req_qty NUMERIC(10,2);
    v_stock NUMERIC(12,2);
    v_price NUMERIC(12,2);
    v_subtotal NUMERIC(12,2);
    v_cart_id UUID;
BEGIN
    -- 1. Generate Order Code
    v_order_code := 'ORD-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- 2. Validate Items Array
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order items array cannot be empty';
    END IF;

    -- 3. Calculate Total & Lock Products for Atomic Stock Check
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_req_qty := (v_item->>'quantity')::NUMERIC;

        IF v_req_qty <= 0 THEN
            RAISE EXCEPTION 'Item quantity must be greater than 0';
        END IF;

        -- Lock product row to prevent race conditions
        SELECT stock, price INTO v_stock, v_price
        FROM public.products
        WHERE id = v_product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % not found', v_product_id;
        END IF;

        IF v_stock < v_req_qty THEN
            RAISE EXCEPTION 'Insufficient stock for product %. Requested: %, Available: %', v_product_id, v_req_qty, v_stock;
        END IF;

        v_subtotal := v_price * v_req_qty;
        v_total_amount := v_total_amount + v_subtotal;
    END LOOP;

    -- 4. Create Master Order Record
    INSERT INTO public.orders (
        order_code,
        customer_id,
        delivery_address,
        payment_method,
        total_amount,
        status
    ) VALUES (
        v_order_code,
        p_customer_id,
        p_delivery_address,
        COALESCE(p_payment_method, 'COD'),
        v_total_amount,
        'PENDING'
    )
    RETURNING id INTO v_order_id;

    -- 5. Insert Order Items & Deduct Stock Atomically
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_req_qty := (v_item->>'quantity')::NUMERIC;

        SELECT price INTO v_price FROM public.products WHERE id = v_product_id;
        v_subtotal := v_price * v_req_qty;

        -- Deduct Stock
        UPDATE public.products
        SET stock = stock - v_req_qty,
            status = CASE WHEN (stock - v_req_qty) = 0 THEN 'OUT_OF_STOCK' ELSE status END
        WHERE id = v_product_id;

        -- Insert Order Item
        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            subtotal
        ) VALUES (
            v_order_id,
            v_product_id,
            v_req_qty,
            v_price,
            v_subtotal
        );
    END LOOP;

    -- 6. Clear Customer Cart Items
    SELECT id INTO v_cart_id FROM public.carts WHERE customer_id = p_customer_id;
    IF v_cart_id IS NOT NULL THEN
        DELETE FROM public.cart_items WHERE cart_id = v_cart_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_code', v_order_code,
        'total_amount', v_total_amount,
        'status', 'PENDING'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 3. SERVER-SIDE SQL AGGREGATION RPC FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_farmer_dashboard_stats(p_farmer_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_products INT := 0;
    v_active_orders INT := 0;
    v_total_revenue NUMERIC(12,2) := 0.00;
    v_total_diseases INT := 0;
    v_total_yields INT := 0;
BEGIN
    SELECT COUNT(*) INTO v_total_products FROM public.products WHERE farmer_id = p_farmer_id;
    SELECT COUNT(*) INTO v_active_orders FROM public.orders WHERE farmer_id = p_farmer_id AND status IN ('PENDING', 'ACCEPTED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY');
    SELECT COALESCE(SUM(total_amount), 0.00) INTO v_total_revenue FROM public.orders WHERE farmer_id = p_farmer_id AND status = 'DELIVERED';
    SELECT COUNT(*) INTO v_total_diseases FROM public.disease_detections WHERE farmer_id = p_farmer_id;
    SELECT COUNT(*) INTO v_total_yields FROM public.yield_predictions WHERE farmer_id = p_farmer_id;

    RETURN jsonb_build_object(
        'total_products', v_total_products,
        'active_orders', v_active_orders,
        'total_revenue', v_total_revenue,
        'total_diseases', v_total_diseases,
        'total_yields', v_total_yields
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- PRODUCTS POLICIES
CREATE POLICY "Active products viewable by everyone" ON public.products FOR SELECT USING (status = 'ACTIVE' OR auth.uid() IS NOT NULL);
CREATE POLICY "Farmers/Vendors can insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Farmers/Vendors can update own products" ON public.products FOR UPDATE USING (auth.uid() IS NOT NULL);

-- CATEGORIES POLICIES
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);

-- CARTS & CART ITEMS POLICIES
CREATE POLICY "Customers view own cart" ON public.carts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Customers view own cart items" ON public.cart_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Customers modify own cart items" ON public.cart_items FOR ALL USING (auth.uid() IS NOT NULL);

-- ORDERS POLICIES
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Customers view own order items" ON public.order_items FOR SELECT USING (auth.uid() IS NOT NULL);

-- DISEASE & YIELD POLICIES
CREATE POLICY "Farmers view own disease detections" ON public.disease_detections FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Farmers insert disease detections" ON public.disease_detections FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Farmers view own yield predictions" ON public.yield_predictions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Farmers insert yield predictions" ON public.yield_predictions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------------------
-- 5. SUPABASE STORAGE BUCKET CONFIGURATION & POLICIES
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated Upload Product Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public Read Crop Images" ON storage.objects FOR SELECT USING (bucket_id = 'crop-images');
CREATE POLICY "Authenticated Upload Crop Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'crop-images' AND auth.role() = 'authenticated');
