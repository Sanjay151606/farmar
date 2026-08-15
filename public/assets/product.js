// Farmora Database-Driven Product Module
let allProducts = [];
let currentProducts = [];
let userLocation = localStorage.getItem('userLocation');

window.allProducts = allProducts;

const districtSelect = document.getElementById("districtSelect");
const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("searchInput");
const totalProductsEl = document.getElementById("totalProducts");
const cartContainer = document.getElementById("cartContainer");
const cartCountEl = document.getElementById("cartCount");

// Main API Fetch function to load real products from backend API /api/products
async function fetchProductsFromAPI() {
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--primary);">
                <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; margin-bottom: 1rem; display: block;"></i>
                <h3>Loading real products...</h3>
            </div>
        `;
    }

    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const resData = await response.json();
        const data = Array.isArray(resData) ? resData : (resData.products || []);

        allProducts = data.map(p => {
            let imageSrc = null;
            if (p.image || p.image_url || p.imageUrl) {
                const raw = p.image || p.image_url || p.imageUrl;
                imageSrc = raw.startsWith('http') || raw.startsWith('/') ? raw : `/${raw}`;
            }

            return {
                id: p.id,
                name: p.name || 'Farm Product',
                price: Number(p.price) || 0,
                unit: p.unit || 'kg',
                quantity: Number(p.quantity) || 0,
                farmer: p.farmer || p.farmerName || 'Verified Farmer',
                farmerLocation: p.farmerLocation || p.location || 'Location not available',
                farmerPhoto: p.farmerPhoto || p.farmer_image || p.avatar || null,
                icon: p.icon || 'fas fa-seedling',
                image: imageSrc,
                season: p.season || 'Fresh Harvest',
                availability: p.quantity > 0 ? 'In Stock' : 'Out of Stock'
            };
        });

        window.allProducts = allProducts;
        currentProducts = [...allProducts];

        populateDistrictFilter();
        renderProducts(currentProducts);
        updateStats();
        updateCartDisplay();

        return allProducts;
    } catch (error) {
        console.error('Error fetching products from API:', error);
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--danger, #ef4444);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <h3>Unable to load products. Please try again.</h3>
                    <button class="btn btn-primary" onclick="fetchProductsFromAPI()" style="margin-top: 1rem;">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
        return [];
    }
}
window.fetchProductsFromAPI = fetchProductsFromAPI;
window.initializeProducts = fetchProductsFromAPI;

function populateDistrictFilter() {
    const districts = [...new Set(allProducts.map(p => p.farmerLocation).filter(loc => loc && loc !== 'Location not available'))];
    
    [districtSelect, document.getElementById('districtFilter')].forEach(selectEl => {
        if (selectEl) {
            selectEl.innerHTML = '<option value="">All Districts</option>';
            districts.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                selectEl.appendChild(opt);
            });
        }
    });
}

function updateStats() {
    if (totalProductsEl) {
        totalProductsEl.textContent = currentProducts.length;
    }
}

function renderProducts(list) {
    if (!productsContainer) return;

    if (list.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--slate-400);">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem; display: block;"></i>
                <h3>No products available</h3>
                <p>Try adjusting your search or select a different district</p>
            </div>
        `;
        return;
    }

    productsContainer.innerHTML = "";
    list.forEach((product) => {
        const card = document.createElement("div");
        card.className = "product-card";

        const imageHtml = product.image 
            ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.parentNode.innerHTML='<i class=\\'${product.icon}\\'></i>';" />`
            : `<i class="${product.icon}"></i>`;

        const farmerPhotoHtml = product.farmerPhoto
            ? `<img src="${product.farmerPhoto}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;margin-right:6px;" />`
            : `<i class="fas fa-user" style="margin-right:6px;"></i>`;

        card.innerHTML = `
            <div class="availability-badge">${product.availability}</div>
            <div class="product-image">
                ${imageHtml}
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>${product.season}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-boxes"></i>
                        <span>${product.quantity} ${product.unit} available</span>
                    </div>
                    <div class="detail-item">
                        ${farmerPhotoHtml}
                        <span>${product.farmer}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${product.farmerLocation}</span>
                    </div>
                </div>
                <div class="price-tag">₹${product.price} / ${product.unit}</div>
                <div class="add-to-cart-container" style="display:flex;gap:8px;margin-top:12px;">
                    <input type="number" class="quantity-input" value="1" min="1" data-product-id="${product.id}" style="width:60px;padding:6px;border:1px solid var(--border);border-radius:var(--radius-sm);text-align:center;" />
                    <button class="add-to-cart-btn btn btn-primary btn-sm" data-product-id="${product.id}" style="flex:1;">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        productsContainer.appendChild(card);
    });
    addCartEventListeners();
}
window.renderProducts = renderProducts;

function addCartEventListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart-btn');
            if (!btn) return;
            const productId = btn.dataset.productId;
            const quantityInput = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
            const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;
            
            if (quantity > 0) {
                const product = allProducts.find(p => p.id === productId);
                if (product) {
                    addToCart({ ...product, quantity });
                } else {
                    console.error('Product not found for ID:', productId);
                }
            } else {
                alert('Please enter a valid quantity.');
            }
        });
    });
}

async function addToCart(product) {
    if (!product || !product.id) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += product.quantity;
    } else {
        cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();

    // Sync with Backend API
    try {
        await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
    } catch (e) {
        console.error('API cart error', e);
    }

    if (window.showToast) {
        window.showToast(`Added ${product.quantity} ${product.name} to cart!`, 'success');
    }
}
window.addToCart = addToCart;

function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const badgeEls = document.querySelectorAll('#cartCount, #cartCountBadge');
    badgeEls.forEach(el => el.textContent = totalItems);

    if (cartContainer) {
        cartContainer.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}
window.updateCartDisplay = updateCartDisplay;

// Event listeners for filters and search if present
if (districtSelect) {
    districtSelect.addEventListener("change", (e) => {
        const district = e.target.value;
        currentProducts = district === "" ? [...allProducts] : allProducts.filter(p => p.farmerLocation === district);
        renderProducts(currentProducts);
        updateStats();
    });
}

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        const district = districtSelect ? districtSelect.value : "";
        
        let searchBase = district === "" ? allProducts : allProducts.filter(p => p.farmerLocation === district);
        
        const filtered = searchBase.filter((product) =>
            product.name.toLowerCase().includes(keyword) ||
            product.farmer.toLowerCase().includes(keyword) ||
            product.farmerLocation.toLowerCase().includes(keyword)
        );
        
        currentProducts = filtered;
        renderProducts(filtered);
        if (totalProductsEl) totalProductsEl.textContent = filtered.length;
    });
}

// Auto-initialize from API on DOMReady
document.addEventListener('DOMContentLoaded', () => {
    fetchProductsFromAPI();
});
