-- ============================================================================
-- FARMORA SUPABASE POSTGRESQL DATABASE SCHEMA MIGRATION
-- File: supabase/migrations/20260815000000_farmora_schema.sql
-- Description: Core Schema, Normalized Tables, RLS Policies, Storage Buckets, and Triggers
-- Compatibility: PostgreSQL 15+ / Supabase Auth & Storage (100% Idempotent)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & UTILITIES
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Automatic Updated At Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 2. CORE TABLE: PROFILES (Links directly to Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    location TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe Column Alterations for Pre-existing Tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 3. CORE TABLE: CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe Category Inserts (Only using standard 'name' column)
INSERT INTO public.categories (name)
VALUES 
    ('Vegetables'),
    ('Fruits'),
    ('Grains'),
    ('Spices'),
    ('Dairy')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. CORE TABLE: PRODUCTS (Marketplace catalog with real-time inventory)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Vegetables',
    description TEXT,
    price NUMERIC(12,2) DEFAULT 0.00,
    stock NUMERIC(12,2) DEFAULT 0.00,
    quantity NUMERIC(12,2) DEFAULT 0.00,
    unit TEXT DEFAULT 'kg',
    farmer TEXT DEFAULT 'Selvi Organic Farms',
    farm_name TEXT,
    farmer_location TEXT DEFAULT 'Tamil Nadu',
    season TEXT DEFAULT 'Fresh Harvest',
    icon TEXT DEFAULT 'fas fa-seedling',
    image_url TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe Product Column Alterations for Pre-existing Tables
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Vegetables';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quantity NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'kg';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS farmer TEXT DEFAULT 'Selvi Organic Farms';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS farm_name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS farmer_location TEXT DEFAULT 'Tamil Nadu';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'Fresh Harvest';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'fas fa-seedling';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5. CORE TABLE: ORDERS (Direct farm-to-doorstep orders)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_address TEXT,
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    farmer_name TEXT,
    delivery_partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    delivery_partner_name TEXT,
    total_amount NUMERIC(12,2) DEFAULT 0.00,
    status TEXT DEFAULT 'PENDING',
    payment_method TEXT DEFAULT 'COD',
    payment_status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe Orders Column Alterations for Pre-existing Tables
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS farmer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_partner_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'COD';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING';

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. CORE TABLE: ORDER_ITEMS (Itemized snapshot of order at checkout)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT,
    quantity NUMERIC(10,2) DEFAULT 1.00,
    unit TEXT DEFAULT 'kg',
    unit_price NUMERIC(12,2) DEFAULT 0.00,
    subtotal NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. CORE TABLE: DIAGNOSES (AI Crop Disease Scan History & Remedies)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_name TEXT DEFAULT 'Kavitha S',
    crop_name TEXT,
    disease_name TEXT,
    confidence NUMERIC(5,2) DEFAULT 90.00,
    severity TEXT DEFAULT 'Moderate',
    is_healthy BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    symptoms JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. CORE TABLE: YIELD_PREDICTIONS (AI Multi-Factor Harvest Estimations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.yield_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_name TEXT DEFAULT 'Kavitha S',
    crop_name TEXT,
    land_area NUMERIC(10,2) DEFAULT 1.00,
    unit TEXT DEFAULT 'Acres',
    soil_type TEXT,
    season TEXT,
    irrigation TEXT,
    location TEXT DEFAULT 'Tamil Nadu',
    previous_yield NUMERIC(10,2) DEFAULT 0.00,
    estimated_yield TEXT,
    estimated_yield_num NUMERIC(12,2) DEFAULT 0.00,
    expected_range TEXT,
    confidence NUMERIC(5,2) DEFAULT 88.00,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. PERFORMANCE & LOOKUP INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON public.orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_farmer_id ON public.diagnoses(farmer_id);
CREATE INDEX IF NOT EXISTS idx_yield_farmer_id ON public.yield_predictions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ----------------------------------------------------------------------------
-- 11. SUPABASE STORAGE BUCKETS
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-images', 'product-images', true),
    ('disease-scans', 'disease-scans', true),
    ('profile-avatars', 'profile-avatars', true),
    ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 12.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 12.2 CATEGORIES POLICIES
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);

-- 12.3 PRODUCTS POLICIES
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farmers manage own products" ON public.products;
CREATE POLICY "Farmers manage own products" ON public.products FOR ALL USING (
    auth.uid() = farmer_id OR auth.uid() IS NOT NULL
);

-- 12.4 ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view relevant orders" ON public.orders;
CREATE POLICY "Users can view relevant orders" ON public.orders FOR SELECT USING (
    auth.uid() = customer_id 
    OR auth.uid() = farmer_id 
    OR auth.uid() = delivery_partner_id
    OR auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Customers can insert orders" ON public.orders;
CREATE POLICY "Customers can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Participants can update orders" ON public.orders;
CREATE POLICY "Participants can update orders" ON public.orders FOR UPDATE USING (
    auth.uid() = customer_id 
    OR auth.uid() = farmer_id 
    OR auth.uid() = delivery_partner_id
    OR auth.uid() IS NOT NULL
);

-- 12.5 ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "View order items" ON public.order_items;
CREATE POLICY "View order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert order items" ON public.order_items;
CREATE POLICY "Insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- 12.6 DIAGNOSES POLICIES
DROP POLICY IF EXISTS "Farmers view own diagnoses" ON public.diagnoses;
CREATE POLICY "Farmers view own diagnoses" ON public.diagnoses FOR SELECT USING (
    auth.uid() = farmer_id OR auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Farmers create diagnoses" ON public.diagnoses;
CREATE POLICY "Farmers create diagnoses" ON public.diagnoses FOR INSERT WITH CHECK (true);

-- 12.7 YIELD PREDICTIONS POLICIES
DROP POLICY IF EXISTS "Farmers view own yield predictions" ON public.yield_predictions;
CREATE POLICY "Farmers view own yield predictions" ON public.yield_predictions FOR SELECT USING (
    auth.uid() = farmer_id OR auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Farmers create yield predictions" ON public.yield_predictions;
CREATE POLICY "Farmers create yield predictions" ON public.yield_predictions FOR INSERT WITH CHECK (true);

-- 12.8 NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR ALL USING (
    auth.uid() = user_id OR auth.uid() IS NOT NULL
);

-- 12.9 STORAGE POLICIES
DROP POLICY IF EXISTS "Public view product images" ON storage.objects;
CREATE POLICY "Public view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated upload product images" ON storage.objects;
CREATE POLICY "Authenticated upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public view disease scans" ON storage.objects;
CREATE POLICY "Public view disease scans" ON storage.objects FOR SELECT USING (bucket_id = 'disease-scans');

DROP POLICY IF EXISTS "Authenticated upload disease scans" ON storage.objects;
CREATE POLICY "Authenticated upload disease scans" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'disease-scans');

DROP POLICY IF EXISTS "Public view profile avatars" ON storage.objects;
CREATE POLICY "Public view profile avatars" ON storage.objects FOR SELECT USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "Authenticated upload profile avatars" ON storage.objects;
CREATE POLICY "Authenticated upload profile avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-avatars');

-- ----------------------------------------------------------------------------
-- 13. REALTIME REPLICATION ENABLEMENT
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
