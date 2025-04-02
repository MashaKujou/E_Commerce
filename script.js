// DOM Elements
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const cartIcon = document.querySelector('.cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const overlay = document.getElementById('overlay');
const productGrid = document.getElementById('product-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const loadMoreBtn = document.getElementById('load-more-btn');
const cartItems = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.querySelector('.cart-count');

// App State
let cart = [];
let currentFilter = 'all';
let visibleProducts = 8;

// Event Listeners
document.addEventListener('DOMContentLoaded', init);
menuToggle.addEventListener('click', toggleMenu);
cartIcon.addEventListener('click', toggleCart);
closeCart.addEventListener('click', toggleCart);
overlay.addEventListener('click', closeAll);

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        filterProducts(filter);
    });
});

loadMoreBtn.addEventListener('click', loadMoreProducts);

// Initialize App
function init() {
    renderProducts();
    updateCartUI();
}

// Render Products
function renderProducts() {
    let filteredProducts = productsData;
    
    if (currentFilter !== 'all') {
        filteredProducts = productsData.filter(product => product.tags.includes(currentFilter));
    }
    
    const productsToShow = filteredProducts.slice(0, visibleProducts);
    
    productGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
    
    if (visibleProducts >= filteredProducts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }
    
    // Add event listeners to newly created elements
    document.querySelectorAll('.add-to-cart').forEach(button => {
        const productId = parseInt(button.getAttribute('data-id'));
        button.addEventListener('click', () => addToCart(productId));
    });
    
    document.querySelectorAll('.action-btn.wishlist').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                this.innerHTML = '<i class="fas fa-heart"></i>';
                this.style.color = '#ff006e';
            } else {
                this.innerHTML = '<i class="far fa-heart"></i>';
                this.style.color = '';
            }
        });
    });
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    let badgeHTML = '';
    if (product.badge) {
        badgeHTML = `<div class="product-badge ${product.badge}">${product.badge === 'new' ? 'New' : 'Sale'}</div>`;
    }
    
    let priceHTML = '';
    if (product.oldPrice) {
        priceHTML = `<span class="old-price">P${product.oldPrice.toFixed(2)}</span> P${product.price.toFixed(2)}`;
    } else {
        priceHTML = `P${product.price.toFixed(2)}`;
    }
    
    card.innerHTML = `
        <div class="product-img">
            ${badgeHTML}
            <img src="${product.image}" alt="${product.name}">
            <div class="product-actions">
                <div class="action-btn quickview"><i class="fas fa-eye"></i></div>
                <div class="action-btn wishlist"><i class="far fa-heart"></i></div>
                <div class="action-btn compare"><i class="fas fa-sync-alt"></i></div>
            </div>
            <div class="add-to-cart" data-id="${product.id}">Add to Cart</div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-category">${product.category}</div>
            <div class="product-price">${priceHTML}</div>
        </div>
    `;
    
    return card;
}

// Filter Products
function filterProducts(filter) {
    currentFilter = filter;
    visibleProducts = 8;
    
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });
    
    renderProducts();
}

// Load More Products
function loadMoreProducts() {
    visibleProducts += 4;
    renderProducts();
}

// Add to Cart Function
function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCartUI();
    toggleCart(true);
}

// Remove from Cart Function
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

// Update Cart Item Quantity
function updateCartItemQuantity(productId, quantity) {
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        cartItem.quantity = Math.max(1, quantity);
        updateCartUI();
    }
}

// Update Cart UI
function updateCartUI() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotalPrice.textContent = '$0.00';
        cartCount.textContent = '0';
        return;
    }
    
    let total = 0;
    let itemCount = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemCount += item.quantity;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <div class="cart-item-price">P${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <div class="remove-item" data-id="${item.id}">
                <i class="fas fa-trash-alt"></i>
            </div>
        `;
        
        cartItems.appendChild(cartItemElement);
    });
    
    cartTotalPrice.textContent = `P${total.toFixed(2)}`;
    cartCount.textContent = itemCount.toString();
    
    // Add event listeners to cart items
    document.querySelectorAll('.remove-item').forEach(button => {
        const productId = parseInt(button.getAttribute('data-id'));
        button.addEventListener('click', () => removeFromCart(productId));
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        const productId = parseInt(button.getAttribute('data-id'));
        button.addEventListener('click', () => {
            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                updateCartItemQuantity(productId, cartItem.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        const productId = parseInt(button.getAttribute('data-id'));
        button.addEventListener('click', () => {
            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                updateCartItemQuantity(productId, cartItem.quantity + 1);
            }
        });
    });
}

// Toggle Menu
function toggleMenu() {
    navMenu.classList.toggle('active');
}

// Toggle Cart
function toggleCart(forceOpen = false) {
    if (forceOpen && cartSidebar.classList.contains('active')) {
        return;
    }
    
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (cartSidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Close All
function closeAll() {
    if (cartSidebar.classList.contains('active')) {
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
}