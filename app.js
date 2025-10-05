// === Konfiguracja kontraktu ===
const CONTRACT_ADDRESS = "0x88Fd392bC4d948DaD1d27B73cad89fF34507EA9B";

// Wklej ABI swojego kontraktu w formacie JSON
const CONTRACT_ABI = [
  // Przykład minimalny:
  // {
  //   "inputs":[{"internalType":"string","name":"_message","type":"string"}],
  //   "name":"sendMessage",
  //   "outputs":[],
  //   "stateMutability":"nonpayable",
  //   "type":"function"
  // }
];

const kit = new ContractKit.newKit("https://forno.celo.org");
const statusDiv = document.getElementById("status");

// Połączenie portfela Celo
async function connectWallet() {
  if (window.celo) {
    try {
      await window.celo.enable();
      const web3 = new Web3(window.celo);
      kit.web3 = web3;
      const accounts = await web3.eth.getAccounts();
      return accounts[0];
    } catch (error) {
      console.error("Połączenie portfela anulowane:", error);
      statusDiv.innerText = "Połączenie portfela anulowane.";
    }
  } else {
    alert("Zainstaluj portfel Celo, np. Valora.");
  }
}

// Wysyłanie wiadomości do kontraktu
async function sendMessage() {
  const walletAddress = await connectWallet();
  if (!walletAddress) return;

  const message = document.getElementById("messageInput").value.trim();
  if (!message) {
    alert("Wpisz wiadomość!");
    return;
  }

  statusDiv.innerText = "Wysyłanie wiadomości...";

  try {
    const contract = new kit.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    await contract.methods.sendMessage(message).send({ from: walletAddress });
    statusDiv.innerText = "Wiadomość wysłana!";
    document.getElementById("messageInput").value = "";
  } catch (err) {
    console.error("Błąd wysyłania:", err);
    statusDiv.innerText = "Błąd wysyłania wiadomości. Sprawdź konsolę.";
  }
}

// Obsługa kliknięcia przycisku
document.getElementById("sendBtn").addEventListener("click", sendMessage);
