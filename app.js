const contractAddress = '0x88Fd392bC4d948DaD1d27B73cad89fF34507EA9B';
const contractABI = [
	/* pełne ABI kontraktu */
	{
		inputs: [{ internalType: 'string', name: '_content', type: 'string' }],
		name: 'sendMessage',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getAllMessages',
		outputs: [
			{
				components: [
					{ internalType: 'address', name: 'sender', type: 'address' },
					{ internalType: 'string', name: 'content', type: 'string' },
					{ internalType: 'uint256', name: 'timestamp', type: 'uint256' },
				],
				internalType: 'struct HelloCelo.Message[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getMessageCount',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'sender', type: 'address' },
			{ indexed: false, internalType: 'string', name: 'content', type: 'string' },
			{ indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
		],
		name: 'MessageSent',
		type: 'event',
	},
];

let provider, signer, contract;

async function init() {
	if (!window.ethereum) {
		alert('Please install MetaMask or Celo Extension Wallet!');
		return;
	}

	await window.ethereum.request({ method: 'eth_requestAccounts' });
	provider = ethers.providers.Web3Provider(window.ethereum);

	signer = provider.getSigner();

	contract = new ethers.Contract(contractAddress, contractABI, signer);

	loadMessages();
	subscribeEvents();

	document.getElementById('sendBtn').addEventListener('click', sendMessage);
}

async function loadMessages() {
	const messagesDiv = document.getElementById('messages');
	const countSpan = document.getElementById('msgCount');
	messagesDiv.innerHTML = '<p>Loading messages...</p>';

	try {
		const messages = await contract.getAllMessages();
		messagesDiv.innerHTML = '';
		countSpan.textContent = messages.length;

		messages.forEach(msg => {
			const div = document.createElement('div');
			div.className = 'message';
			div.innerHTML = `<strong>${msg.sender}</strong>: ${msg.content} <em>${new Date(
				msg.timestamp * 1000
			).toLocaleString()}</em>`;
			messagesDiv.appendChild(div);
		});
	} catch (err) {
		console.error(err);
		messagesDiv.innerHTML = '<p>Error loading messages</p>';
	}
}

async function sendMessage() {
	const input = document.getElementById('messageInput');
	const text = input.value.trim();
	if (!text) return alert('Message cannot be empty');

	const status = document.getElementById('status');
	status.textContent = 'Sending message...';
	try {
		const tx = await contract.sendMessage(text);
		await tx.wait();
		input.value = '';
		status.textContent = 'Message sent!';
		loadMessages();
	} catch (err) {
		console.error(err);
		status.textContent = 'Transaction failed.';
	}
}

function subscribeEvents() {
	contract.on('MessageSent', (sender, content, timestamp) => {
		const messagesDiv = document.getElementById('messages');
		const countSpan = document.getElementById('msgCount');

		const div = document.createElement('div');
		div.className = 'message';
		div.innerHTML = `<strong>${sender}</strong>: ${content} <em>${new Date(
			timestamp * 1000
		).toLocaleString()}</em>`;
		messagesDiv.prepend(div);

		countSpan.textContent = parseInt(countSpan.textContent) + 1;
	});
}

window.addEventListener('load', init);
