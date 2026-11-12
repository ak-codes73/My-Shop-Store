-- ==============================================================================
-- MIGRATION: CUSTOMER AUTHENTICATION, PROFILES & DATABASE WISHLIST
-- Run this script in the Supabase SQL Editor.
-- ==============================================================================

-- 1. ADD NULLABLE user_id COLUMN TO ORDERS TABLE (GUEST CHECKOUT PRESERVED)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

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

-- Trigger for auto-updating timestamps on profiles
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- Automatically create customer profile when a new user signs up in auth.users
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

-- ------------------------------------------------------------------------------
-- 3. USER WISHLIST TABLE (PERSISTED IN DATABASE FOR LOGGED-IN CUSTOMERS)
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
-- 4. STRICT ADMIN CHECK (PREVENTS CUSTOMERS FROM EVER GAINING ADMIN PRIVILEGES)
-- Admins must stay distinguishable from customers. Being logged in NEVER grants
-- admin access; access depends strictly on presence in public.admin_users table.
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- USER WISHLIST POLICIES
DROP POLICY IF EXISTS "Users view own wishlist" ON public.user_wishlist;
CREATE POLICY "Users view own wishlist" ON public.user_wishlist
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own wishlist" ON public.user_wishlist;
CREATE POLICY "Users insert own wishlist" ON public.user_wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own wishlist" ON public.user_wishlist;
CREATE POLICY "Users delete own wishlist" ON public.user_wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- ORDERS POLICIES (CUSTOMERS ONLY READ THEIR OWN ORDERS; GUEST LOOKUP PRESERVED)
DROP POLICY IF EXISTS "Public create order" ON public.orders;
CREATE POLICY "Public create order" ON public.orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Customer view own order" ON public.orders;
CREATE POLICY "Customer view own order" ON public.orders
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (user_id IS NULL)
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin manage orders" ON public.orders
    FOR ALL USING (public.is_admin());

-- PAYMENTS POLICIES (CUSTOMERS ONLY READ PAYMENTS FOR THEIR OWN ORDERS)
DROP POLICY IF EXISTS "Public insert payment" ON public.payments;
CREATE POLICY "Public insert payment" ON public.payments
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public view payment for order" ON public.payments;
DROP POLICY IF EXISTS "Customer view payment for order" ON public.payments;
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

DROP POLICY IF EXISTS "Customer update payment" ON public.payments;
CREATE POLICY "Customer update payment" ON public.payments
    FOR UPDATE USING (
        payment_status IN ('Awaiting Payment', 'Pending Verification', 'Rejected')
        AND (
            EXISTS (
                SELECT 1 FROM public.orders
                WHERE orders.id = payments.order_id
                AND (
                    (auth.uid() IS NOT NULL AND orders.user_id = auth.uid())
                    OR orders.user_id IS NULL
                    OR public.is_admin()
                )
            )
        )
    );

DROP POLICY IF EXISTS "Admin manage payments" ON public.payments;
CREATE POLICY "Admin manage payments" ON public.payments
    FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. SUPABASE REALTIME SUBSCRIPTIONS
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_wishlist;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

