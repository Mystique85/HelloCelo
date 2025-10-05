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
let currentWallet = null;

// Connect Wallet button
document.getElementById("connectBtn").addEventListener("click", async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);
      kit.web3 = web3;

      const accounts = await web3.eth.getAccounts();
      currentWallet = accounts[0];
      document.getElementById("walletStatus").innerText = `Connected: ${currentWallet}`;

      // Check network
      const chainId = await web3.eth.getChainId();
      if (chainId !== 42220) {
        alert("Please switch your wallet to Celo Mainnet!");
        currentWallet = null;
        document.getElementById("walletStatus").innerText = "Wallet not connected";
      }

    } catch (err) {
      console.error("Wallet connection canceled:", err);
      document.getElementById("walletStatus").innerText = "Wallet connection canceled";
    }
  } else {
    alert("Install MetaMask or Rabby and set Celo Mainnet.");
  }
});

// Send Message button
document.getElementById("sendBtn").addEventListener("click", async () => {
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

  } catch (err) {
    console.error("Error sending message:", err);
    statusDiv.innerText = "Error sending message. Check console.";
  }
});
