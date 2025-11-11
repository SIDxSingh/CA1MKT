'use strict';

const CART_KEY = 'sportify_cart_v1';
const $ = (s, scope = document) => scope.querySelector(s);
const formatCurrency = (n) => `₹${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

function loadCart() {
	try {
		const raw = localStorage.getItem(CART_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
let cart = loadCart();

function getCartCount() {
	return cart.reduce((sum, i) => sum + i.qty, 0);
}
function getCartSubtotal() {
	return cart.reduce((sum, i) => sum + i.qty * i.price, 0);
}
function saveCart() {
	localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderCartPage() {
	const countEl = $('#cartCount');
	if (countEl) countEl.textContent = String(getCartCount());
	const itemsEl = $('#pageSummaryItems');
	if (itemsEl) itemsEl.textContent = String(getCartCount());
	const subtotalEl = $('#pageSummarySubtotal');
	if (subtotalEl) subtotalEl.textContent = formatCurrency(getCartSubtotal());

	const container = $('#pageCartItems');
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

function changeQty(productId, delta) {
	const idx = cart.findIndex(i => i.id === productId);
	if (idx === -1) return;
	cart[idx].qty += delta;
	if (cart[idx].qty <= 0) cart.splice(idx, 1);
	saveCart();
	renderCartPage();
}
function removeFromCart(productId) {
	cart = cart.filter(i => i.id !== productId);
	saveCart();
	renderCartPage();
}

function bindCartPageEvents() {
	document.addEventListener('click', (e) => {
		const inc = e.target.closest('.increase');
		const dec = e.target.closest('.decrease');
		const rem = e.target.closest('.remove-btn');
		if (inc) changeQty(inc.getAttribute('data-id'), 1);
		if (dec) changeQty(dec.getAttribute('data-id'), -1);
		if (rem) removeFromCart(rem.getAttribute('data-id'));
	});

	const buyBtn = $('#pageCheckoutBtn');
	if (buyBtn) {
		buyBtn.addEventListener('click', () => {
			if (cart.length === 0) {
				alert('Your cart is empty.');
				return;
			}
			showOrderDialog();
		});
	}
}

function initCartPage() {
	renderCartPage();
	bindCartPageEvents();
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', initCartPage);

// Order confirmation dialog
function showOrderDialog() {
	let overlay = document.getElementById('orderDialogOverlay');
	if (!overlay) {
		overlay = document.createElement('div');
		overlay.id = 'orderDialogOverlay';
		overlay.className = 'modal-overlay';
		overlay.innerHTML = `
			<div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="orderDialogTitle" aria-describedby="orderDialogDesc">
				<div class="modal-icon">📦</div>
				<h3 id="orderDialogTitle" class="modal-title">Order Placed</h3>
				<p id="orderDialogDesc" class="modal-desc">Your order will reach you within 10–15 days.</p>
				<div class="modal-actions">
					<button type="button" class="btn-primary" id="orderOkBtn">OK</button>
					<a href="index.html" class="btn-secondary">Continue Shopping</a>
				</div>
			</div>
		`;
		document.body.appendChild(overlay);
		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) hideOrderDialog();
		});
		document.addEventListener('keydown', (e) => {
			if (overlay.classList.contains('is-open') && e.key === 'Escape') hideOrderDialog();
		});
		overlay.querySelector('#orderOkBtn').addEventListener('click', () => {
			// Clear cart after acknowledgment to mirror prior behavior
			cart = [];
			saveCart();
			renderCartPage();
			hideOrderDialog();
		});
	}
	requestAnimationFrame(() => {
		overlay.classList.add('is-open');
	});
}
function hideOrderDialog() {
	const overlay = document.getElementById('orderDialogOverlay');
	if (!overlay) return;
	overlay.classList.remove('is-open');
}


