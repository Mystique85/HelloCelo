// CONFIG
const CONTRACT_ADDRESS = "0x88Fd392bC4d948DaD1d27B73cad89fF34507EA9B";
const CONTRACT_ABI = [ /* wklej ABI Twojego kontraktu */ ];

let provider;
let signer;
let contract;
let currentAccount;

// UI
const connectBtn = document.getElementById("connectBtn");
const walletStatus = document.getElementById("walletStatus");
const statusDiv = document.getElementById("status");

// CONNECT WALLET
connectBtn.addEventListener("click", async () => {
  if (!window.ethereum && !window.celo) {
    alert("No injected wallet detected! Install MetaMask, Rabby or Celo extension.");
    return;
  }

  const injected = window.ethereum || window.celo;
  try {
    await injected.request ? injected.request({ method: 'eth_requestAccounts' }) : injected.enable();
    provider = new ethers.providers.Web3Provider(injected);
    signer = provider.getSigner();
    currentAccount = await signer.getAddress();
    walletStatus.innerText = `Connected: ${currentAccount}`;

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    await loadMessages();
    statusDiv.innerText = "Wallet connected!";
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
