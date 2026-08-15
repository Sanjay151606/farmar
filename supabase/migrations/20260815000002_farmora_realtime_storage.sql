-- ============================================================================
-- FARMORA SUPABASE POSTGRESQL DATABASE MIGRATION
-- Migration Version: 20260815000002
-- Description: Realtime Publications, Storage Buckets, Additional Indexes, RLS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADDITIONAL QUERY INDEXES (Idempotent)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON public.carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_crop_records_status ON public.crop_records(status);
CREATE INDEX IF NOT EXISTS idx_crop_records_created_at ON public.crop_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disease_detections_crop_id ON public.disease_detections(crop_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_crop_id ON public.yield_predictions(crop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ----------------------------------------------------------------------------
-- 2. DEDICATED ATOMIC STOCK RESERVATION RPC FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reserve_product_stock(
    p_product_id UUID,
    p_quantity NUMERIC
)
RETURNS JSONB AS $$
DECLARE
    v_current_stock NUMERIC(12,2);
    v_new_stock NUMERIC(12,2);
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity to reserve must be greater than 0';
    END IF;

    -- Lock row to prevent simultaneous purchase race conditions
    SELECT stock INTO v_current_stock
    FROM public.products
    WHERE id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product with ID % not found', p_product_id;
    END IF;

    IF v_current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Requested: %, Available: %', p_quantity, v_current_stock;
    END IF;

    v_new_stock := v_current_stock - p_quantity;

    UPDATE public.products
    SET stock = v_new_stock,
        status = CASE WHEN v_new_stock = 0 THEN 'OUT_OF_STOCK' ELSE status END
    WHERE id = p_product_id;

    RETURN jsonb_build_object(
        'success', true,
        'product_id', p_product_id,
        'previous_stock', v_current_stock,
        'reserved_quantity', p_quantity,
        'remaining_stock', v_new_stock
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 3. VENDOR DASHBOARD STATS AGGREGATION RPC
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_vendor_dashboard_stats(p_vendor_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_products INT := 0;
    v_active_orders INT := 0;
    v_total_sales NUMERIC(12,2) := 0.00;
BEGIN
    SELECT COUNT(*) INTO v_total_products FROM public.products WHERE vendor_id = p_vendor_id;
    SELECT COUNT(*) INTO v_active_orders FROM public.orders WHERE vendor_id = p_vendor_id AND status IN ('PENDING', 'ACCEPTED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY');
    SELECT COALESCE(SUM(total_amount), 0.00) INTO v_total_sales FROM public.orders WHERE vendor_id = p_vendor_id AND status = 'DELIVERED';

    RETURN jsonb_build_object(
        'total_products', v_total_products,
        'active_orders', v_active_orders,
        'total_sales', v_total_sales
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 4. SUPABASE REALTIME CONFIGURATION
-- Enable live event broadcasting for orders, notifications, and products
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if table is already in publication
    NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 5. SUPABASE STORAGE BUCKETS (All 5 Application Buckets)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-images', 'product-images', true),
    ('profile-images', 'profile-images', true),
    ('crop-images', 'crop-images', true),
    ('disease-images', 'disease-images', true),
    ('vendor-images', 'vendor-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Read Profile Images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Auth Upload Profile Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public Read Disease Images" ON storage.objects FOR SELECT USING (bucket_id = 'disease-images');
CREATE POLICY "Auth Upload Disease Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'disease-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public Read Vendor Images" ON storage.objects FOR SELECT USING (bucket_id = 'vendor-images');
CREATE POLICY "Auth Upload Vendor Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vendor-images' AND auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 6. EXTENDED RLS POLICIES FOR ALL TABLES
-- ----------------------------------------------------------------------------
-- Farmers, Customers, Vendors, Delivery Partners Policy
CREATE POLICY "Users read own farmer row" ON public.farmers FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users read own customer row" ON public.customers FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users read own vendor row" ON public.vendors FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users read own delivery partner row" ON public.delivery_partners FOR SELECT USING (auth.uid() = profile_id);

-- Crop Records Policy
CREATE POLICY "Farmers access own crop records" ON public.crop_records FOR ALL USING (auth.uid() IS NOT NULL);

-- Notifications Policy
CREATE POLICY "Users access own notifications" ON public.notifications FOR ALL USING (auth.uid() IS NOT NULL);
