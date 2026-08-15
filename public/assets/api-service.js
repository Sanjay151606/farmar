// Farmora Centralized API Service Client with Caching, Debouncing, and Error Toasts

(function(window) {
    const API_CACHE = new Map();
    const CACHE_TTL_MS = 10000; // 10s short cache to eliminate redundant requests

    function getSessionHeaders() {
        const session = window.getUserSession ? window.getUserSession() : {};
        const headers = {
            'Content-Type': 'application/json'
        };
        if (session.token) {
            headers['Authorization'] = `Bearer ${session.token}`;
        }
        if (session.role) {
            headers['x-user-role'] = session.role;
        }
        return headers;
    }

    async function apiFetch(endpoint, options = {}, useCache = false) {
        const cacheKey = `${options.method || 'GET'}:${endpoint}`;

        if (useCache && (options.method || 'GET') === 'GET') {
            const cached = API_CACHE.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
                return cached.data;
            }
        }

        const config = {
            method: options.method || 'GET',
            headers: { ...getSessionHeaders(), ...(options.headers || {}) },
            ...options
        };

        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(endpoint, config);
            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || `HTTP error! Status: ${response.status}`;
                if (window.showToast) window.showToast(errorMsg, 'error');
                throw new Error(errorMsg);
            }

            if (useCache && config.method === 'GET') {
                API_CACHE.set(cacheKey, { timestamp: Date.now(), data });
            }

            return data;
        } catch (err) {
            console.error(`API Error [${endpoint}]:`, err);
            throw err;
        }
    }

    function clearCache(pattern) {
        if (!pattern) {
            API_CACHE.clear();
            return;
        }
        for (const key of API_CACHE.keys()) {
            if (key.includes(pattern)) API_CACHE.delete(key);
        }
    }

    // Debounce Helper Function
    function debounce(func, delay = 300) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    const ApiService = {
        // Products API
        async getProducts(params = {}, useCache = true) {
            const query = new URLSearchParams(params).toString();
            const url = `/api/products${query ? '?' + query : ''}`;
            return apiFetch(url, { method: 'GET' }, useCache);
        },

        async getProductById(id) {
            return apiFetch(`/api/products/${id}`, { method: 'GET' });
        },

        async createProduct(productData) {
            clearCache('/api/products');
            return apiFetch('/api/products', { method: 'POST', body: productData });
        },

        async updateProduct(id, productData) {
            clearCache('/api/products');
            return apiFetch(`/api/products/${id}`, { method: 'PUT', body: productData });
        },

        async deleteProduct(id) {
            clearCache('/api/products');
            return apiFetch(`/api/products/${id}`, { method: 'DELETE' });
        },

        // Orders API
        async getOrders(params = {}, useCache = false) {
            const query = new URLSearchParams(params).toString();
            return apiFetch(`/api/orders${query ? '?' + query : ''}`, { method: 'GET' }, useCache);
        },

        async createOrder(orderData) {
            clearCache('/api/products');
            clearCache('/api/orders');
            return apiFetch('/api/orders', { method: 'POST', body: orderData });
        },

        async updateOrderStatus(orderId, status, extraData = {}) {
            clearCache('/api/orders');
            return apiFetch(`/api/orders/${orderId}/status`, { method: 'PUT', body: { status, ...extraData } });
        },

        // Cart API
        async getCart() {
            return apiFetch('/api/cart', { method: 'GET' });
        },

        async saveCart(items) {
            return apiFetch('/api/cart', { method: 'POST', body: { items } });
        },

        // Delivery API
        async getDeliveryBoys() {
            return apiFetch('/api/delivery-boys', { method: 'GET' });
        },

        async assignDelivery(orderId, deliveryBoyId) {
            clearCache('/api/orders');
            return apiFetch('/api/delivery/assign', { method: 'POST', body: { orderId, deliveryBoyId } });
        },

        // Disease Detection API
        async getDiseaseHistory(farmerId) {
            const param = farmerId ? `?farmerId=${encodeURIComponent(farmerId)}` : '';
            return apiFetch(`/api/farmer/disease-detection/history${param}`, { method: 'GET' });
        },

        async analyzeDisease(imageData, cropHint) {
            const session = window.getUserSession ? window.getUserSession() : {};
            return apiFetch('/api/farmer/disease-detection', {
                method: 'POST',
                body: { image: imageData, farmerName: session.name, cropHint }
            });
        },

        // Yield Prediction API
        async getYieldHistory(farmerId) {
            const param = farmerId ? `?farmerId=${encodeURIComponent(farmerId)}` : '';
            return apiFetch(`/api/farmer/yield-prediction/history${param}`, { method: 'GET' });
        },

        async predictYield(formData) {
            const session = window.getUserSession ? window.getUserSession() : {};
            return apiFetch('/api/farmer/yield-prediction', {
                method: 'POST',
                body: { ...formData, farmerName: session.name }
            });
        },

        debounce,
        clearCache
    };

    window.ApiService = ApiService;
})(window);
