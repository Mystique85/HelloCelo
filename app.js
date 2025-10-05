// === Konfiguracja kontraktu ===
const CONTRACT_ADDRESS = "0x88Fd392bC4d948DaD1d27B73cad89fF34507EA9B";

// Wklej tutaj ABI swojego kontraktu w formacie JSON
const CONTRACT_ABI = [
  // przykład minimalny: 
  // {
  //   "inputs": [{"internalType":"string","name":"_message","type":"string"}],
  //   "name":"sendMessage",
  //   "outputs":[],
  //   "stateMutability":"nonpayable",
  //   "type":"function"
  // }
];

// === Inicjalizacja ContractKit dla mainnet ===
const kit = new ContractKit.newKit("https://forno.celo.org");

// Status wyświetlany użytkownikowi
const statusDiv = document.getElementById("status");

// Funkcja do połączenia portfela
async function connectWallet() {
  if (window.celo) {
    try {
      await window.celo.enable(); // wywołanie portfela
      const web3 = new Web3(window.celo);
      kit.web3 = web3;
      const accounts = await web3.eth.getAccounts();
      return accounts[0]; // pierwszy adres portfela
    } catch (error) {
      console.error("Połączenie portfela anulowane:", error);
      statusDiv.innerText = "Połączenie portfela anulowane.";
    }
  } else {
    alert("Zainstaluj portfel Celo, np. Valora.");
  }
}

// Funkcja wysyłania wiadomości
async function sendMessage() {
  const walletAddress = await connectWallet();
  if (!walletAddress) return;

  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();
  if (message.length === 0) {
    alert("Wpisz wiadomość przed wysłaniem!");
    return;
  }

  statusDiv.innerText = "Wysyłanie wiadomości...";

  try {
    const contract = new kit.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    // Wywołanie funkcji kontraktu
    await contract.methods.sendMessage(message).send({ from: walletAddress });

    statusDiv.innerText = "Wiadomość wysłana!";
    console.log("Wiadomość wysłana z portfela:", walletAddress);

    // Czyścimy input po wysłaniu
    messageInput.value = "";

  } catch (err) {
    console.error("Błąd wysyłania wiadomości:", err);
    statusDiv.innerText = "Błąd wysyłania wiadomości. Sprawdź konsolę.";
  }
}

// Obsługa kliknięcia przycisku
document.getElementById("sendBtn").addEventListener("click", sendMessage);
