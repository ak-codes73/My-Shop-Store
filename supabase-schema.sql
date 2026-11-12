-- ==============================================================================
-- ATELIER & CO. - E-COMMERCE FULL STACK DATABASE SCHEMA
-- Posters, Wall Art & Die-Cast Model Cars
-- Compatible with PostgreSQL & Supabase
-- Includes: Tables, Triggers, RLS Security Policies, Storage & Realtime
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || substr(uuid_generate_v4()::text, 1, 8)),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('posters', 'diecast')),
    subcategory TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    variants JSONB DEFAULT '[]'::jsonb,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    tags JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '{}'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for high-performance searching and filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON public.products(is_best_seller);

-- ------------------------------------------------------------------------------
-- 2. CUSTOMER PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. ORDERS TABLE (Supports both registered customers and guest checkout)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ord-' || substr(uuid_generate_v4()::text, 1, 8)),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guest checkout
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    order_status TEXT NOT NULL DEFAULT 'Pending' 
        CHECK (order_status IN ('Pending', 'Payment Verification', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. PAYMENTS TABLE (Manual UPI QR Workflow)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT ('pay-' || substr(uuid_generate_v4()::text, 1, 8)),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL DEFAULT 'UPI_QR',
    upi_reference_id TEXT,
    screenshot_url TEXT,
    payment_status TEXT NOT NULL DEFAULT 'Awaiting Payment'
        CHECK (payment_status IN ('Awaiting Payment', 'Pending Verification', 'Verified', 'Rejected', 'Refunded')),
    submitted_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_upi_ref ON public.payments(upi_reference_id);

-- ------------------------------------------------------------------------------
-- 5. USER WISHLIST TABLE (Persisted in database for logged-in users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.user_wishlist(user_id);

-- ------------------------------------------------------------------------------
-- 6. STORE SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'store-settings-default',
    store_name TEXT NOT NULL DEFAULT 'ATELIER & CO.',
    tagline TEXT DEFAULT 'Curated Wall Art & Precision Die-Cast Collectibles',
    upi_id TEXT NOT NULL DEFAULT 'atelier.store@okaxis',
    upi_payee_name TEXT NOT NULL DEFAULT 'Atelier Art & Collectibles',
    upi_qr_url TEXT DEFAULT '',
    delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 99.00,
    free_delivery_threshold NUMERIC(10, 2) NOT NULL DEFAULT 999.00,
    payment_instructions TEXT,
    contact_email TEXT DEFAULT 'support@ateliercollectibles.com',
    contact_phone TEXT DEFAULT '+91 98765 43210',
    whatsapp_number TEXT DEFAULT '919876543210',
    instagram_handle TEXT DEFAULT '@atelier.art.cars',
    announcement_text TEXT DEFAULT 'Discover your next favourite collectible. Free Express Shipping on orders over ₹999!',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. CUSTOM POSTER & MODEL REQUESTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_requests (
    id TEXT PRIMARY KEY DEFAULT ('req-' || substr(uuid_generate_v4()::text, 1, 8)),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    request_type TEXT NOT NULL DEFAULT 'custom_poster' CHECK (request_type IN ('custom_poster', 'custom_diecast')),
    poster_size TEXT,
    design_description TEXT NOT NULL,
    reference_image_url TEXT,
    budget NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'In Review', 'Quoted', 'Approved', 'Rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. ADMIN USERS TABLE (Strictly controls who has admin dashboard access)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. AUTO-UPDATE TIMESTAMPS TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_custom_requests_updated_at BEFORE UPDATE ON public.custom_requests FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- Auto-create profile trigger on customer signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, phone, address, city, state, pincode)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'address', ''),
        COALESCE(NEW.raw_user_meta_data->>'city', ''),
        COALESCE(NEW.raw_user_meta_data->>'state', ''),
        COALESCE(NEW.raw_user_meta_data->>'pincode', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function: Strictly checks public.admin_users table!
-- Being logged in as a customer NEVER grants admin access.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
        OR (auth.jwt() ->> 'role') = 'service_role'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PRODUCTS POLICIES
CREATE POLICY "Public products view" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Admin insert products" ON public.products
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin update products" ON public.products
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin delete products" ON public.products
    FOR DELETE USING (public.is_admin());

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- USER WISHLIST POLICIES
CREATE POLICY "Users view own wishlist" ON public.user_wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own wishlist" ON public.user_wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own wishlist" ON public.user_wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- STORE SETTINGS POLICIES
CREATE POLICY "Public settings view" ON public.store_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin update settings" ON public.store_settings
    FOR UPDATE USING (public.is_admin());

-- ORDERS POLICIES (GUEST CHECKOUT + AUTHENTICATED CUSTOMER HISTORY)
CREATE POLICY "Public create order" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Customer view own order" ON public.orders
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (user_id IS NULL)
        OR public.is_admin()
    );

CREATE POLICY "Admin manage orders" ON public.orders
    FOR ALL USING (public.is_admin());

-- PAYMENTS POLICIES
CREATE POLICY "Public insert payment" ON public.payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Customer view payment for order" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id
            AND (
                (auth.uid() IS NOT NULL AND orders.user_id = auth.uid())
                OR orders.user_id IS NULL
                OR public.is_admin()
            )
        )
    );

CREATE POLICY "Customer update payment" ON public.payments
    FOR UPDATE USING (
        payment_status IN ('Awaiting Payment', 'Pending Verification', 'Rejected')
        AND EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id
            AND (
                (auth.uid() IS NOT NULL AND orders.user_id = auth.uid())
                OR orders.user_id IS NULL
                OR public.is_admin()
            )
        )
    );

CREATE POLICY "Admin manage payments" ON public.payments
    FOR ALL USING (public.is_admin());

-- CUSTOM REQUESTS POLICIES
CREATE POLICY "Public create custom request" ON public.custom_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Customer view own custom request" ON public.custom_requests
    FOR SELECT USING (true);

CREATE POLICY "Admin manage custom requests" ON public.custom_requests
    FOR ALL USING (public.is_admin());

-- ==============================================================================
-- 11. SUPABASE REALTIME CONFIGURATION
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_wishlist;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_requests;
