/**
 * FARMORA - Universal Supabase Client & Real-time Synchronization Module
 * Connects Supabase Auth, Carts, Products, Orders, and Live GPS Tracking
 */

const SUPABASE_CONFIG = {
    url: 'https://vwgmxetvvufcrasysqlm.supabase.co',
    anonKey: 'sb_publishable_gxRkZ_OCSAtB-ek9TqYcCA_ipHnL7YW'
};

// Initialize Supabase Client
let _supabase = null;
if (typeof supabase !== 'undefined' && supabase.createClient) {
    _supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    window.supabaseClient = _supabase;
    console.log('⚡ Supabase Client initialized successfully');
} else {
    // Dynamically load Supabase CDN if not already in DOM
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            _supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            window.supabaseClient = _supabase;
            console.log('⚡ Supabase Client loaded & initialized');
            document.dispatchEvent(new CustomEvent('supabase:ready', { detail: _supabase }));
        }
    };
    document.head.appendChild(script);
}

// ─── SUPABASE AUTH WRAPPER ──────────────────────────────────────────────
window.supabaseAuth = {
    async signUp({ email, password, fullName, phone, role, location }) {
        if (!_supabase) return { error: 'Supabase client not ready' };
        try {
            const { data, error } = await _supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone || '',
                        role: role || 'customer',
                        location: location || 'Tamil Nadu'
                    }
                }
            });

            if (error) return { error: error.message };

            if (data && data.user) {
                // Upsert profile in public.profiles table
                await _supabase.from('profiles').upsert({
                    id: data.user.id,
                    full_name: fullName,
                    email: email,
                    phone: phone || '',
                    role: role || 'customer',
                    location: location || 'Tamil Nadu',
                    updated_at: new Date().toISOString()
                });

                const userSession = {
                    id: data.user.id,
                    name: fullName,
                    email: email,
                    role: role || 'customer',
                    location: location || 'Tamil Nadu',
                    token: data.session ? data.session.access_token : ''
                };
                localStorage.setItem('userSession', JSON.stringify(userSession));
                return { success: true, user: data.user, session: data.session };
            }
            return { success: true, data };
        } catch (err) {
            return { error: err.message };
        }
    },

    async signIn({ email, password }) {
        if (!_supabase) return { error: 'Supabase client not ready' };
        try {
            const { data, error } = await _supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) return { error: error.message };

            if (data && data.user) {
                // Fetch profile
                const { data: profile } = await _supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                const userSession = {
                    id: data.user.id,
                    name: (profile && profile.full_name) || data.user.user_metadata.full_name || 'Farmora User',
                    email: data.user.email,
                    role: (profile && profile.role) || data.user.user_metadata.role || 'customer',
                    location: (profile && profile.location) || data.user.user_metadata.location || 'Tamil Nadu',
                    token: data.session.access_token
                };
                localStorage.setItem('userSession', JSON.stringify(userSession));
                return { success: true, user: data.user, session: data.session, profile };
            }
            return { success: true, data };
        } catch (err) {
            return { error: err.message };
        }
    },

    async signOut() {
        if (_supabase) {
            await _supabase.auth.signOut();
        }
        localStorage.removeItem('userSession');
        localStorage.removeItem('customerProfile');
        localStorage.removeItem('farmerProfile');
        localStorage.removeItem('userRole');
        return { success: true };
    },

    async getCurrentUser() {
        if (!_supabase) return null;
        const { data: { user } } = await _supabase.auth.getUser();
        return user;
    }
};

// ─── SUPABASE CARTS & CART ITEMS ────────────────────────────────────────
window.supabaseCart = {
    async getOrCreateCart(customerId) {
        if (!_supabase || !customerId) return null;
        try {
            // Find existing cart
            let { data: cart } = await _supabase
                .from('carts')
                .select('*')
                .eq('customer_id', customerId)
                .maybeSingle();

            if (!cart) {
                const { data: newCart, error } = await _supabase
                    .from('carts')
                    .insert({ customer_id: customerId })
                    .select()
                    .single();
                cart = newCart;
            }
            return cart;
        } catch (err) {
            console.warn('getOrCreateCart error:', err);
            return null;
        }
    },

    async fetchCartItems(customerId) {
        if (!_supabase || !customerId) return [];
        try {
            const cart = await this.getOrCreateCart(customerId);
            if (!cart) return [];

            const { data: items, error } = await _supabase
                .from('cart_items')
                .select(`
                    id,
                    cart_id,
                    product_id,
                    quantity,
                    created_at,
                    products:product_id (
                        id, name, price, unit, farmer, farmer_location, image_url, icon
                    )
                `)
                .eq('cart_id', cart.id);

            if (error) {
                console.warn('fetchCartItems note:', error.message);
                return [];
            }

            return (items || []).map(item => ({
                id: item.product_id,
                cartItemId: item.id,
                name: item.products ? item.products.name : 'Harvest Product',
                price: item.products ? Number(item.products.price) : 0,
                unit: item.products ? item.products.unit : 'kg',
                quantity: item.quantity,
                farmer: item.products ? item.products.farmer : '',
                image: item.products ? item.products.image_url : null,
                icon: item.products ? item.products.icon : 'fas fa-seedling'
            }));
        } catch (err) {
            console.warn('fetchCartItems exception:', err);
            return [];
        }
    },

    async addItem(customerId, product, quantity = 1) {
        if (!_supabase || !customerId) return false;
        try {
            const cart = await this.getOrCreateCart(customerId);
            if (!cart) return false;

            // Check if item already exists in cart
            const { data: existing } = await _supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('cart_id', cart.id)
                .eq('product_id', product.id)
                .maybeSingle();

            if (existing) {
                await _supabase
                    .from('cart_items')
                    .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
                    .eq('id', existing.id);
            } else {
                await _supabase
                    .from('cart_items')
                    .insert({
                        cart_id: cart.id,
                        product_id: product.id,
                        quantity: quantity
                    });
            }
            return true;
        } catch (err) {
            console.warn('addItem error:', err);
            return false;
        }
    },

    async removeItem(customerId, productId) {
        if (!_supabase || !customerId) return false;
        try {
            const cart = await this.getOrCreateCart(customerId);
            if (!cart) return false;

            await _supabase
                .from('cart_items')
                .delete()
                .eq('cart_id', cart.id)
                .eq('product_id', productId);
            return true;
        } catch (err) {
            return false;
        }
    },

    async clearCart(customerId) {
        if (!_supabase || !customerId) return false;
        try {
            const cart = await this.getOrCreateCart(customerId);
            if (!cart) return false;

            await _supabase
                .from('cart_items')
                .delete()
                .eq('cart_id', cart.id);
            return true;
        } catch (err) {
            return false;
        }
    }
};
