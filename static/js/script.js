let trades = [];
const API_URL = "/api/trades/";
const tradeForm = document.getElementById("tradeForm");
const tradeTable = document.getElementById("tradeTable").querySelector("tbody");
const summaryDiv = document.getElementById("summary");

let visibleCount = 5; // initially show 5 trades
let loading = false;

function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":");
  let hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

async function fetchTrades() {
  const res = await fetch(API_URL);
  trades = await res.json();
  trades.sort((a, b) => new Date(b.date) - new Date(a.date)); // show newest first
  visibleCount = 5;
  renderTrades();
}

function renderTrades() {
  tradeTable.innerHTML = "";
  const visibleTrades = trades.slice(0, visibleCount);

  visibleTrades.forEach((trade, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${trade.date}</td>
      <td>${formatTime(trade.entry_time)}</td>
      <td>${formatTime(trade.exit_time)}</td>
      <td>${trade.index}</td>
      <td>${trade.type}</td>
      <td>${trade.trend}</td>
      <td>${trade.plan}</td>
      <td>${trade.pl.toFixed(2)}</td>
      <td>${trade.brokerage.toFixed(2)}</td>
      <td>${trade.charges.toFixed(2)}</td>
      <td class="${trade.net_pl >= 0 ? "profit" : "loss"}">${trade.net_pl.toFixed(2)}</td>
      <td><button onclick="deleteTrade(${index})" class="btn-danger" style="padding:6px 10px;font-size:0.8rem;">Delete</button></td>
    `;
    tradeTable.appendChild(row);
  });
  calculateSummary();
}

tradeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newTrade = {
    date: document.getElementById("date").value,
    entry_time: document.getElementById("entryTime").value,
    exit_time: document.getElementById("exitTime").value,
    index: document.getElementById("index").value,
    type: document.getElementById("type").value,
    trend: document.getElementById("trend").value,
    plan: document.getElementById("plan").value,
    pl: parseFloat(document.getElementById("pl").value),
    brokerage: parseFloat(document.getElementById("brokerage").value),
    charges: parseFloat(document.getElementById("charges").value),
  };
  newTrade.net_pl = newTrade.pl - newTrade.brokerage - newTrade.charges;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTrade),
  });

  await fetchTrades();
  tradeForm.reset();
});

async function deleteTrade(index) {
  const tradeId = trades[index].id;
  await fetch(`${API_URL}${tradeId}/`, { method: "DELETE" });
  fetchTrades();
}

async function clearTrades() {
  if (confirm("Clear all trades?")) {
    for (const t of trades) {
      await fetch(`${API_URL}${t.id}/`, { method: "DELETE" });
    }
    fetchTrades();
  }
}

function calculateSummary() {
  let totalProfit = 0,
    totalLoss = 0;
  trades.forEach((t) => {
    if (t.net_pl >= 0) totalProfit += t.net_pl;
    else totalLoss += Math.abs(t.net_pl);
  });
  const net = totalProfit - totalLoss;
  summaryDiv.innerHTML = `
    <p style="color:#16a34a;">Total Profit: ₹${totalProfit.toFixed(2)}</p>
    <p style="color:#dc2626;">Total Loss: ₹${totalLoss.toFixed(2)}</p>
    <p style="color:${net >= 0 ? "#16a34a" : "#dc2626"};">Net: ₹${net.toFixed(2)}</p>
  `;
}

// Infinite scroll effect
document.querySelector(".table-container").addEventListener("scroll", () => {
  const container = document.querySelector(".table-container");
  if (!loading && container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
    loading = true;
    setTimeout(() => {
      if (visibleCount < trades.length) {
        visibleCount += 5;
        renderTrades();
      }
      loading = false;
    }, 400);
  }
});

function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(trades);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Trades");
  XLSX.writeFile(wb, "TradeJournal.xlsx");
}

// Init
fetchTrades();
