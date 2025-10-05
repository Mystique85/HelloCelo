// === Contract configuration ===
const CONTRACT_ADDRESS = "0x88Fd392bC4d948DaD1d27B73cad89fF34507EA9B";
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "sender", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "content", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "MessageSent",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getAllMessages",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "sender", "type": "address" },
          { "internalType": "string", "name": "content", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct HelloCelo.Message[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMessageCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_content", "type": "string" }],
    "name": "sendMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const kit = new ContractKit.newKit("https://forno.celo.org"); // Celo Mainnet
let currentWallet = null;
const statusDiv = document.getElementById("status");

// Connect wallet
document.getElementById("connectBtn").addEventListener("click", async () => {
  console.log("Connect wallet clicked");
  if (!window.ethereum) {
    alert("Install MetaMask or Rabby and set Celo Mainnet.");
    return;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const web3 = new Web3(window.ethereum);
    kit.web3 = web3;

    const accounts = await web3.eth.getAccounts();
    currentWallet = accounts[0];
    document.getElementById("walletStatus").innerText = `Connected: ${currentWallet}`;

    const chainId = await web3.eth.getChainId();
    console.log("Chain ID:", chainId);
    if (chainId !== 42220) {
      alert("Please switch your wallet to Celo Mainnet!");
      currentWallet = null;
      document.getElementById("walletStatus").innerText = "Wallet not connected";
    }

    await loadMessages(); // Load messages on connect

  } catch (err) {
    console.error("Wallet connection canceled:", err);
    document.getElementById("walletStatus").innerText = "Wallet connection canceled";
  }
});

// Send message
document.getElementById("sendBtn").addEventListener("click", async () => {
  console.log("Send button clicked, currentWallet:", currentWallet);
  if (!currentWallet) {
    alert("Please connect your wallet first!");
    return;
  }

  const message = document.getElementById("messageInput").value.trim();
  if (!message) {
    alert("Please enter a message!");
    return;
  }

  statusDiv.innerText = "Sending message...";

  try {
    const contract = new kit.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    await contract.methods.sendMessage(message).send({ from: currentWallet });

    statusDiv.innerText = "Message sent!";
    document.getElementById("messageInput").value = "";

    await loadMessages(); // Refresh messages

  } catch (err) {
    console.error("Error sending message:", err);
    statusDiv.innerText = "Error sending message. Check console.";
  }
});

// Load messages from contract
async function loadMessages() {
  const contract = new kit.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  try {
    const messages = await contract.methods.getAllMessages().call();
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    messages.forEach((msg, index) => {
      const date = new Date(msg.timestamp * 1000).toLocaleString();
      const div = document.createElement("div");
      div.innerText = `${index + 1}. [${date}] ${msg.sender}: ${msg.content}`;
      messagesDiv.appendChild(div);
    });

    const count = await contract.methods.getMessageCount().call();
    document.getElementById("msgCount").innerText = count;

  } catch (err) {
    console.error("Could not load messages:", err);
  }
}
