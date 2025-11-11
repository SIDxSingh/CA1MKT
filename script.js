'use strict';

// Utilities
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const formatCurrency = (n) => `₹${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

// Data: 15 sports items (prices in Indian Rupees, 1 USD = 83 INR)
const PRODUCTS = [
	{ id: 'ball-foot', name: 'Adidas Football', price: 2489.17, img: 'image/ball adidas.jpg' },
	{ id: 'ball-basket', name: 'Spalding Basketball', price: 2904.17, img: 'image/sparten ball.jpeg' },
	{ id: 'racket-tennis', name: 'Wilson Tennis Racket', price: 7387.00, img: 'image/Wilson Tennis Racket.jpeg' },
	{ id: 'shoes-run', name: 'Nike Running Shoes', price: 9959.17, img: 'image/nike shoes.jpeg' },
	{ id: 'gloves-gym', name: 'Gym Gloves', price: 1203.50, img: 'image/Gym Gloves.jpg' },
	{ id: 'rope-skip', name: 'Speed Skipping Rope', price: 829.17, img: 'image/Speed Skipping Rope.jpeg' },
	{ id: 'mat-yoga', name: 'Premium Yoga Mat', price: 2075.00, img: 'image/Premium Yoga Mat.webp' },
	{ id: 'bottle-sport', name: 'Insulated Water Bottle', price: 1493.17, img: 'image/Insulated Water Bottle.jpeg' },
	{ id: 'band-resist', name: 'Resistance Bands Set', price: 1783.67, img: 'image/Gym Gloves.jpg' },
	{ id: 'helmet-cycle', name: 'Cycling Helmet', price: 4149.17, img: 'image/Gym Duffel Bag.jpeg' },
	{ id: 'jersey-soc', name: 'Soccer Jersey', price: 3319.17, img: 'image/Running Shorts.jpeg' },
	{ id: 'shorts-run', name: 'Running Shorts', price: 1908.17, img: 'image/Running Shorts.jpeg' },
	{ id: 'bag-gym', name: 'Gym Duffel Bag', price: 3652.00, img: 'image/Gym Duffel Bag.jpeg' },
	{ id: 'watch-sport', name: 'Sports Watch', price: 12367.00, img: 'image/Sports Watch.jpeg' },
	{ id: 'socks-comp', name: 'Compression Socks', price: 1078.17, img: 'image/Compression Socks.jpg' }
];

// State
const CART_KEY = 'sportify_cart_v1';
let cart = loadCart();

function loadCart() {
	try {
		const raw = localStorage.getItem(CART_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function saveCart() {
	localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
	return cart.reduce((sum, item) => sum + item.qty, 0);
}
function getCartSubtotal() {
	return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

// Render Products
function renderProducts(list) {
	const grid = $('#productsGrid');
	grid.innerHTML = '';
	list.forEach(p => {
		const card = document.createElement('article');
		card.className = 'product-card';
		card.innerHTML = `
			<img class="product-image" src="${p.img}" alt="${p.name}">
			<div class="product-body">
				<h3 class="product-title">${p.name}</h3>
				<div class="product-meta">
					<span class="price">${formatCurrency(p.price)}</span>
					<button class="add-btn" data-id="${p.id}">Add to Cart</button>
				</div>
			</div>
		`;
		grid.appendChild(card);
	});
}

// Cart UI
function openCart() {
	const drawer = $('#cartDrawer');
	drawer.setAttribute('aria-hidden', 'false');
	document.body.style.overflow = 'hidden';
}
function closeCart() {
	const drawer = $('#cartDrawer');
	drawer.setAttribute('aria-hidden', 'true');
	document.body.style.overflow = '';
}

function renderCart() {
	const countEl = $('#cartCount');
	if (countEl) countEl.textContent = String(getCartCount());
	const itemsEl = $('#summaryItems');
	if (itemsEl) itemsEl.textContent = String(getCartCount());
	const subtotalEl = $('#summarySubtotal');
	if (subtotalEl) subtotalEl.textContent = formatCurrency(getCartSubtotal());

	const container = $('#cartItems');
	if (container) {
		container.innerHTML = '';
		if (cart.length === 0) {
			const empty = document.createElement('p');
			empty.textContent = 'Your cart is empty.';
			empty.style.color = '#94a3b8';
			container.appendChild(empty);
			return;
		}

		cart.forEach(item => {
			const row = document.createElement('div');
			row.className = 'cart-item';
			row.innerHTML = `
				<img src="${item.img}" alt="${item.name}">
				<div>
					<p class="cart-item-title">${item.name}</p>
					<div class="qty-controls" role="group" aria-label="Quantity controls">
						<button class="decrease" data-id="${item.id}" aria-label="Decrease">−</button>
						<span aria-live="polite">${item.qty}</span>
						<button class="increase" data-id="${item.id}" aria-label="Increase">+</button>
					</div>
				</div>
				<div style="text-align:right">
					<div style="margin-bottom:6px">${formatCurrency(item.price * item.qty)}</div>
					<button class="remove-btn" data-id="${item.id}">Remove</button>
				</div>
			`;
			container.appendChild(row);
		});
	}
}

// Cart Logic
function addToCart(productId) {
	const product = PRODUCTS.find(p => p.id === productId);
	if (!product) return;
	const existing = cart.find(i => i.id === productId);
	if (existing) {
		existing.qty += 1;
	} else {
		cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 });
	}
	saveCart();
	renderCart();
	showAddedDialog(product.name);
}
function changeQty(productId, delta) {
	const idx = cart.findIndex(i => i.id === productId);
	if (idx === -1) return;
	cart[idx].qty += delta;
	if (cart[idx].qty <= 0) {
		cart.splice(idx, 1);
	}
	saveCart();
	renderCart();
}
function removeFromCart(productId) {
	cart = cart.filter(i => i.id !== productId);
	saveCart();
	renderCart();
}

// Search
function applySearch() {
	const q = $('#searchInput').value.trim().toLowerCase();
	if (!q) {
		renderProducts(PRODUCTS);
		return;
	}
	const filtered = PRODUCTS.filter(p =>
		p.name.toLowerCase().includes(q)
	);
	renderProducts(filtered);
}

// Event Listeners
function bindEvents() {
	// Add to cart (event delegation)
	$('#productsGrid').addEventListener('click', (e) => {
		const btn = e.target.closest('.add-btn');
		if (!btn) return;
		addToCart(btn.getAttribute('data-id'));
	});

	// Cart drawer (only if drawer elements exist)
	const drawer = $('#cartDrawer');
	if (drawer) {
		const cartBtn = $('#cartButton');
		if (cartBtn && !cartBtn.getAttribute('href')) cartBtn.addEventListener('click', openCart);
		const closeBtn = $('#closeCart');
		const overlay = $('#cartOverlay');
		if (closeBtn) closeBtn.addEventListener('click', closeCart);
		if (overlay) overlay.addEventListener('click', closeCart);
	}

	// Cart item controls
	const cartItemsEl = $('#cartItems');
	if (cartItemsEl) {
		cartItemsEl.addEventListener('click', (e) => {
			const inc = e.target.closest('.increase');
			const dec = e.target.closest('.decrease');
			const rem = e.target.closest('.remove-btn');
			if (inc) changeQty(inc.getAttribute('data-id'), 1);
			if (dec) changeQty(dec.getAttribute('data-id'), -1);
			if (rem) removeFromCart(rem.getAttribute('data-id'));
		});
	}

	// Search
	$('#searchInput').addEventListener('input', applySearch);

	// Checkout
	const checkoutBtn = $('#checkoutBtn');
	if (checkoutBtn) {
		checkoutBtn.addEventListener('click', () => {
			if (cart.length === 0) {
				alert('Your cart is empty.');
				return;
			}
			const subtotal = formatCurrency(getCartSubtotal());
			alert(`Thank you! Your subtotal is ${subtotal}. This is a demo checkout.`);
			cart = [];
			saveCart();
			renderCart();
			closeCart();
		});
	}
}

// Theme Toggle
function initTheme() {
	const themeToggle = $('#themeToggle');
	const themeIcon = themeToggle?.querySelector('.theme-icon');
	const savedTheme = localStorage.getItem('theme') || 'dark';
	
	// Apply saved theme
	document.body.setAttribute('data-theme', savedTheme);
	updateThemeIcon(themeIcon, savedTheme);
	
	// Toggle theme on button click
	if (themeToggle) {
		themeToggle.addEventListener('click', () => {
			const currentTheme = document.body.getAttribute('data-theme');
			const newTheme = currentTheme === 'light' ? 'dark' : 'light';
			
			document.body.setAttribute('data-theme', newTheme);
			localStorage.setItem('theme', newTheme);
			updateThemeIcon(themeIcon, newTheme);
		});
	}
}

function updateThemeIcon(icon, theme) {
	if (!icon) return;
	icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Init
function init() {
	initTheme();
	renderProducts(PRODUCTS);
	renderCart();
	bindEvents();
	$('#year').textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', init);

// ===============================
// Homepage Slideshow (Full-screen)
// ===============================
(function setupHeroSlideshow() {
	const slidesWrap = document.getElementById('heroSlides');
	if (!slidesWrap) return; // guard if slideshow is not on page
	const slides = Array.from(slidesWrap.querySelectorAll('.slide'));
	const dotsWrap = document.getElementById('heroDots');
	const prevBtn = document.getElementById('heroPrev');
	const nextBtn = document.getElementById('heroNext');

	let index = 0;
	let timer = null;
	const INTERVAL_MS = 2000;

	function go(to) {
		const prev = index;
		index = (to + slides.length) % slides.length;
		if (slides[prev]) slides[prev].classList.remove('is-active');
		if (slides[index]) slides[index].classList.add('is-active');
		updateDots();
	}
	function next() { go(index + 1); }
	function prev() { go(index - 1); }
	function start() {
		stop();
		timer = setInterval(next, INTERVAL_MS);
	}
	function stop() {
		if (timer) clearInterval(timer);
		timer = null;
	}
	function updateDots() {
		if (!dotsWrap) return;
		Array.from(dotsWrap.children).forEach((dot, i) => {
			dot.classList.toggle('is-active', i === index);
		});
	}

	// Dots
	if (dotsWrap) {
		dotsWrap.innerHTML = '';
		slides.forEach((_, i) => {
			const btn = document.createElement('button');
			btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
			btn.addEventListener('click', () => {
				go(i);
				start();
			});
			dotsWrap.appendChild(btn);
		});
	}

	// Controls
	if (prevBtn) prevBtn.addEventListener('click', () => { prev(); start(); });
	if (nextBtn) nextBtn.addEventListener('click', () => { next(); start(); });

	// Pause on hover
	// Keep autoplay running even on hover (no pause on hover)

	// Pause when tab is hidden, resume when visible
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			stop();
		} else {
			start();
		}
	});

	// Kickoff
	go(0);
	start();
})();

// Toast utility
function showToast(message) {
	let toast = document.getElementById('toastNotice');
	if (!toast) {
		toast = document.createElement('div');
		toast.id = 'toastNotice';
		toast.className = 'toast';
		document.body.appendChild(toast);
	}
	toast.textContent = message;
	toast.classList.add('show');
	clearTimeout(showToast._t);
	showToast._t = setTimeout(() => toast.classList.remove('show'), 1600);
}

// Add-to-cart dialog (accessible)
function showAddedDialog(productName) {
	let overlay = document.getElementById('addedDialogOverlay');
	if (!overlay) {
		overlay = document.createElement('div');
		overlay.id = 'addedDialogOverlay';
		overlay.className = 'modal-overlay';
		overlay.innerHTML = `
			<div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="addedDialogTitle" aria-describedby="addedDialogDesc">
				<div class="modal-icon">✅</div>
				<h3 id="addedDialogTitle" class="modal-title">Item added to cart</h3>
				<p id="addedDialogDesc" class="modal-desc"></p>
				<div class="modal-actions">
					<button type="button" class="btn-primary" id="continueShoppingBtn">Continue Shopping</button>
					<a href="cart.html" class="btn-secondary" id="viewCartBtn">Go to Cart</a>
				</div>
			</div>
		`;
		document.body.appendChild(overlay);
		// Close handlers
		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) hideAddedDialog();
		});
		document.addEventListener('keydown', (e) => {
			if (overlay.classList.contains('is-open') && e.key === 'Escape') hideAddedDialog();
		});
		overlay.querySelector('#continueShoppingBtn').addEventListener('click', hideAddedDialog);
	}
	const desc = overlay.querySelector('.modal-desc');
	desc.textContent = productName ? `"${productName}" has been added to your cart.` : 'Your item has been added to cart.';
	requestAnimationFrame(() => {
		overlay.classList.add('is-open');
	});
}
function hideAddedDialog() {
	const overlay = document.getElementById('addedDialogOverlay');
	if (!overlay) return;
	overlay.classList.remove('is-open');
}

