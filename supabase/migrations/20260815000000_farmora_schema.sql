-- ============================================================================
-- FARMORA SUPABASE POSTGRESQL DATABASE SCHEMA MIGRATION
-- Migration Version: 20260815000000
-- Description: Core Schema, Normalized Tables, Constraints, and Triggers
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Automatic Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- TABLE: PROFILES (Links directly to Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'farmer', 'vendor', 'delivery_partner', 'admin')),
    location TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- TABLE: FARMERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    location TEXT NOT NULL,
    total_land_acres NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (total_land_acres >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_farmers_updated_at ON public.farmers;
CREATE TRIGGER trg_farmers_updated_at
    BEFORE UPDATE ON public.farmers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- TABLE: CUSTOMERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    default_delivery_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- TABLE: VENDORS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_vendors_updated_at ON public.vendors;
CREATE TRIGGER trg_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- TABLE: DELIVERY_PARTNERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_area TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_orders_count INT NOT NULL DEFAULT 0 CHECK (assigned_orders_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_delivery_partners_updated_at ON public.delivery_partners;
CREATE TRIGGER trg_delivery_partners_updated_at
    BEFORE UPDATE ON public.delivery_partners
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- TABLE: CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- TABLE: PRODUCTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    stock NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (stock >= 0),
    unit TEXT NOT NULL DEFAULT 'kg',
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- TABLE: PRODUCT_IMAGES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- TABLE: CARTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID UNIQUE NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_carts_updated_at ON public.carts;
CREATE TRIGGER trg_carts_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- TABLE: CART_ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1.00 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cart_product UNIQUE(cart_id, product_id)
);

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER trg_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- TABLE: ORDERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
    delivery_partner_id UUID REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL DEFAULT 'COD',
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- TABLE: ORDER_ITEMS (Stores historical price snapshot at purchase)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- TABLE: CROP_RECORDS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crop_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    land_area NUMERIC(10,2) NOT NULL CHECK (land_area > 0),
    season TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    planted_at DATE,
    harvest_expected_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_crop_records_updated_at ON public.crop_records;
CREATE TRIGGER trg_crop_records_updated_at
    BEFORE UPDATE ON public.crop_records
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- TABLE: DISEASE_DETECTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.disease_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crop_records(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    image_url TEXT,
    disease_name TEXT NOT NULL,
    confidence NUMERIC(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    severity TEXT NOT NULL DEFAULT 'Moderate',
    is_healthy BOOLEAN NOT NULL DEFAULT FALSE,
    recommendation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- TABLE: YIELD_PREDICTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.yield_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crop_records(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    land_area NUMERIC(10,2) NOT NULL CHECK (land_area > 0),
    predicted_yield NUMERIC(12,2) NOT NULL CHECK (predicted_yield >= 0),
    unit TEXT NOT NULL DEFAULT 'Tons',
    expected_range_min NUMERIC(12,2),
    expected_range_max NUMERIC(12,2),
    confidence NUMERIC(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    input_data JSONB,
    recommendations JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- TABLE: NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
