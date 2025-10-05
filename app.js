// CONFIG
const CONTRACT_ADDRESS = "0x88Fd392bC4d948DaD1d27B73cad89fF34507EA9B";
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"internalType": "address","name": "sender","type": "address"},
      {"indexed": false,"internalType": "string","name": "content","type": "string"},
      {"indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256"}
    ],
    "name": "MessageSent","type": "event"
  },
  {
    "inputs": [],"name": "getAllMessages",
    "outputs": [
      {"components": [
        {"internalType": "address","name": "sender","type": "address"},
        {"internalType": "string","name": "content","type": "string"},
        {"internalType": "uint256","name": "timestamp","type": "uint256"}
      ],"internalType": "struct HelloCelo.Message[]","name": "","type": "tuple[]"}
    ],
    "stateMutability": "view","type": "function"
  },
  {"inputs":[],"name":"getMessageCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"_content","type":"string"}],"name":"sendMessage","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

let provider, signer, contract, currentAccount;

// UI refs
const connectBtn = document.getElementById("connectBtn");
const walletStatus = document.getElementById("walletStatus");
const statusDiv = document.getElementById("status");

// SWITCH TO CELO MAINNET
async function switchToCelo() {
  if (!window.ethereum) return;

  const CELO_CHAIN_ID = "0xa4ec"; // Hex for 42220
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CELO_CHAIN_ID }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      // Network not added, add Celo Mainnet
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: CELO_CHAIN_ID,
            chainName: "Celo Mainnet",
            nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
            rpcUrls: ["https://forno.celo.org"],
            blockExplorerUrls: ["https://celo.blockscout.com"],
          }],
        });
      } catch (addError) {
        console.error("Could not add Celo Mainnet", addError);
      }
    } else {
      console.error("Failed to switch to Celo", switchError);
    }
  }
}

// CONNECT WALLET
connectBtn.addEventListener("click", async () => {
  if (!window.ethereum && !window.celo) {
    alert("No injected wallet detected! Install MetaMask, Rabby or Celo extension.");
    return;
  }

  const injected = window.ethereum || window.celo;
  try {
    await (injected.request ? injected.request({ method: 'eth_requestAccounts' }) : injected.enable());

    // 🔹 Switch to Celo Mainnet
    await switchToCelo();

    provider = new ethers.providers.Web3Provider(injected);
    signer = provider.getSigner();
    currentAccount = await signer.getAddress();
    walletStatus.innerText = `Connected: ${currentAccount}`;
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    await loadMessages();
    listenEvents();
    statusDiv.innerText = "Wallet connected and on Celo Mainnet!";
  } catch (err) {
    console.error("Wallet connect failed:", err);
    walletStatus.innerText = "Connection failed";
  }
});

// SEND MESSAGE
document.getElementById("sendBtn").addEventListener("click", async () => {
  if (!contract || !currentAccount) {
    alert("Connect wallet first!");
    return;
  }
  const message = document.getElementById("messageInput").value.trim();
  if (!message) { alert("Enter a message"); return; }

  try {
    statusDiv.innerText = "Sending...";
    const tx = await contract.sendMessage(message);
    await tx.wait();
    statusDiv.innerHTML = `Message sent! <a href="https://celo.blockscout.com/tx/${tx.hash}" target="_blank">View tx</a>`;
    document.getElementById("messageInput").value = "";
    await loadMessages();
  } catch (err) {
    console.error(err);
    statusDiv.innerText = "Error sending message. Check console.";
  }
});

// LOAD MESSAGES
async function loadMessages() {
  if (!contract) return;
  try {
    const messages = await contract.getAllMessages();
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    messages.forEach((m, i) => {
      const date = new Date(m.timestamp * 1000).toLocaleString();
      const div = document.createElement("div");
      div.innerText = `${i+1}. [${date}] ${m.sender}: ${m.content}`;
      messagesDiv.appendChild(div);
    });

    const count = await contract.getMessageCount();
    document.getElementById("msgCount").innerText = count;
  } catch (err) {
    console.error("Error loading messages:", err);
  }
}

// LISTEN TO EVENTS
function listenEvents() {
  if (!contract) return;
  contract.on("MessageSent", (sender, content, timestamp, event) => {
    console.log("New message event:", sender, content, timestamp);
    loadMessages();
  });
}
