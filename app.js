// === Contract configuration ===
const CONTRACT_ADDRESS = "0x88Fd392bC4d948DaD1d27B73cad89fF34507EA9B";

// Paste your contract ABI here in JSON format
const CONTRACT_ABI = [
  // Example minimal:
  // {
  //   "inputs":[{"internalType":"string","name":"_message","type":"string"}],
  //   "name":"sendMessage",
  //   "outputs":[],
  //   "stateMutability":"nonpayable",
  //   "type":"function"
  // }
];

const kit = new ContractKit.newKit("https://forno.celo.org"); // Celo Mainnet
const statusDiv = document.getElementById("status");

// Connect wallet (MetaMask / Rabby)
async function connectWallet() {
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const web3 = new Web3(window.ethereum);
      kit.web3 = web3;

      // Check network
      const chainId = await web3.eth.getChainId();
      if (chainId !== 42220) { // 42220 = Celo Mainnet
        alert("Please switch your wallet to Celo Mainnet!");
        return null;
      }

      const accounts = await web3.eth.getAccounts();
      return accounts[0];

    } catch (err) {
      console.error("Wallet connection canceled:", err);
      statusDiv.innerText = "Wallet connection canceled.";
      return null;
    }
  } else {
    alert("Install MetaMask or Rabby and set Celo Mainnet.");
    return null;
  }
}

// Send message to the contract
async function sendMessage() {
  const walletAddress = await connectWallet();
  if (!walletAddress) return;

  const message = document.getElementById("messageInput").value.trim();
  if (!message) {
    alert("Please enter a message!");
    return;
  }

  statusDiv.innerText = "Sending message...";

  try {
    const contract = new kit.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    await contract.methods.sendMessage(message).send({ from: walletAddress });

    statusDiv.innerText = "Message sent!";
    document.getElementById("messageInput").value = "";
    console.log("Message sent from wallet:", walletAddress);

  } catch (err) {
    console.error("Error sending message:", err);
    statusDiv.innerText = "Error sending message. Check console.";
  }
}

// Handle Send button click
document.getElementById("sendBtn").addEventListener("click", sendMessage);
