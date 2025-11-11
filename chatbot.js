'use strict';

(function initChatbot() {
	if (document.getElementById('chatbotToggle')) return;

	const toggle = document.createElement('button');
	toggle.id = 'chatbotToggle';
	toggle.className = 'chatbot-toggle';
	toggle.title = 'Chat with us';
	toggle.setAttribute('aria-label', 'Open chat');
	toggle.innerHTML = '<span class="chatbot-icon" aria-hidden="true">💬</span><span class="chatbot-label">Chatbot</span>';

	const win = document.createElement('section');
	win.id = 'chatbotWindow';
	win.className = 'chatbot-window';
	win.setAttribute('aria-live', 'polite');
	win.innerHTML = `
		<header class="chatbot-header">
			<p class="chatbot-title">AI Assistant</p>
			<button class="icon-button" id="chatbotClose" aria-label="Close chat">✕</button>
		</header>
		<div class="chatbot-body" id="chatbotBody"></div>
		<form class="chatbot-input" id="chatbotForm" autocomplete="off">
			<input id="chatbotInput" type="text" placeholder="Ask me anything..." aria-label="Your message" />
			<button type="submit">Send</button>
		</form>
	`;

	document.body.appendChild(toggle);
	document.body.appendChild(win);

	const bodyEl = document.getElementById('chatbotBody');
	const formEl = document.getElementById('chatbotForm');
	const inputEl = document.getElementById('chatbotInput');
	const closeEl = document.getElementById('chatbotClose');

	function scrollToEnd() {
		bodyEl.scrollTop = bodyEl.scrollHeight;
	}
	function addMsg(text, who) {
		const div = document.createElement('div');
		div.className = `chat-msg ${who}`;
		div.textContent = text;
		bodyEl.appendChild(div);
		scrollToEnd();
	}

	function getAnswer(q) {
		const text = q.trim().toLowerCase();
		const now = new Date();
		const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		const date = now.toLocaleDateString();

		if (!text) return "Please type a message.";

		// Greetings
		if (/(^|\b)(hi|hello|hey|yo|sup)\b/.test(text)) return "Hello! How can I help you today?";
		// Time/date
		if (/time/.test(text)) return `It's ${time}.`;
		if (/date|day/.test(text)) return `Today is ${date}.`;
		// Cart
		if (/cart|basket/.test(text)) return "Use the cart icon to review items. You can change quantities or buy from the cart page.";
		// Shipping/returns/payments FAQs
		if (/ship|delivery/.test(text)) return "Standard shipping takes 3–5 business days. Express options are available at checkout.";
		if (/return|refund/.test(text)) return "You can return unused items within 30 days for a full refund.";
		if (/pay|payment|method|card|upi/.test(text)) return "We accept major cards and UPI-like methods in this demo.";
		// Prices/products
		if (/price|cost/.test(text)) return "Prices are shown on each product card. Add to cart to see totals.";
		if (/product|item|stock|available/.test(text)) return "Browse the homepage for our featured gear. Use search to filter.";
		// Contact
		if (/contact|support|help/.test(text)) return "I’m here to help. For more, email support@example.com.";

		// Generic fallback
		return "I'm a demo AI assistant. I don't know that yet, but I can help with shipping, returns, products, or cart questions.";
	}

	function open() {
		win.classList.add('is-open');
		inputEl.focus();
	}
	function close() {
		win.classList.remove('is-open');
	}
	toggle.addEventListener('click', () => {
		win.classList.toggle('is-open');
		if (win.classList.contains('is-open')) inputEl.focus();
	});
	closeEl.addEventListener('click', close);

	// Welcome message
	addMsg("Hi! I'm your shopping assistant. Ask me about shipping, returns, products, or the cart.", 'bot');

	formEl.addEventListener('submit', (e) => {
		e.preventDefault();
		const q = inputEl.value;
		if (!q.trim()) return;
		addMsg(q, 'user');
		inputEl.value = '';
		setTimeout(() => addMsg(getAnswer(q), 'bot'), 200);
	});
})();


