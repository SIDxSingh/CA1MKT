'use strict';

(function initChatbot() {
	if (document.getElementById('chatbotToggle')) return;

	const socialDockId = 'floatingSocialDock';

	function injectSocialDock() {
		if (document.getElementById(socialDockId)) return;
		const dock = document.createElement('aside');
		dock.id = socialDockId;
		dock.className = 'social-dock';
		dock.setAttribute('aria-label', 'Follow us');
		dock.innerHTML = `
			<a href="https://www.instagram.com/sid_sez/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="social-dock-link instagram">
				<span class="social-icon" aria-hidden="true">📸</span>
				<span class="social-label">Instagram</span>
			</a>
			<a href="https://www.youtube.com/@siddharthsingh4550" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="social-dock-link youtube">
				<span class="social-icon" aria-hidden="true">▶️</span>
				<span class="social-label">YouTube</span>
			</a>
			<a href="https://www.linkedin.com/in/siddharth-singh-sez" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="social-dock-link linkedin">
				<span class="social-icon" aria-hidden="true">💼</span>
				<span class="social-label">LinkedIn</span>
			</a>
		`;
		document.body.appendChild(dock);
	}

	injectSocialDock();

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
	const contactState = {
		step: 'phone',
		phone: '',
		email: '',
		completed: false,
		isSending: false,
	};

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

	function extractPhone(text) {
		const digits = text.replace(/[^\d+]/g, '');
		if (digits.length >= 10) return digits;
		return null;
	}

	function isValidEmail(text) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
	}

	function sendContactDetails() {
		if (contactState.isSending) return;
		contactState.isSending = true;
		addMsg('Thanks! Sending your contact details securely...', 'bot');
		fetch('https://formsubmit.co/ajax/siddharthwizard123@gmail.com', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify({
				_subject: 'New chatbot lead from Sportify Shop',
				source: 'Chatbot Contact Capture',
				phone: contactState.phone,
				email: contactState.email,
				timestamp: new Date().toISOString(),
			}),
		}).then((res) => {
			if (!res.ok) throw new Error('Network response was not ok');
			return res.json();
		}).then(() => {
			contactState.completed = true;
			addMsg('All set! I shared those details with the team. Let me know if you need anything else.', 'bot');
		}).catch(() => {
			addMsg('Hmm, I could not send that just now. Please try sharing your details again in a moment.', 'bot');
		}).finally(() => {
			contactState.isSending = false;
		});
	}

	// Welcome message
	addMsg("Hi! I'm your shopping assistant. Ask me about shipping, returns, products, or the cart.", 'bot');
	addMsg("Before we start, could you share your phone number so we can reach you?", 'bot');

	formEl.addEventListener('submit', (e) => {
		e.preventDefault();
		const q = inputEl.value;
		if (!q.trim()) return;
		addMsg(q, 'user');
		inputEl.value = '';

		if (!contactState.completed) {
			if (contactState.step === 'phone') {
				const phone = extractPhone(q);
				if (phone) {
					contactState.phone = phone;
					contactState.step = 'email';
					addMsg("Great, thanks! Now please share your email address so we can send you updates.", 'bot');
				} else {
					addMsg("I didn't catch a valid phone number. Please share a 10-digit number (you can include country code).", 'bot');
				}
				return;
			}
			if (contactState.step === 'email') {
				if (isValidEmail(q)) {
					contactState.email = q.trim();
					contactState.step = 'done';
					sendContactDetails();
				} else {
					addMsg("Hmm, that email doesn't look right. Could you type it again?", 'bot');
				}
				return;
			}
		}

		setTimeout(() => addMsg(getAnswer(q), 'bot'), 200);
	});
})();


