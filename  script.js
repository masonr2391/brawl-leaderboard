const SUPABASE_URL = 'https://ymqtgsleywpsdfardrle.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcXRnc2xleXdwc2RmYXJkcmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzY2NzksImV4cCI6MjA2NjIxMjY3OX0.QzE_pTFsUwUQM-17QLIw5FGD_4hR2INCx0k_IYHDIfU';
const SEASON_LIST = ['2025-06']; // Add more seasons later

async function fetchData(season, brawlerId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/leaderboards?season=eq.${season}&brawler_id=eq.${brawlerId}&select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  return await res.json();
}

function loadTable(data) {
  const tbody = document.querySelector("#leaderboardTable tbody");
  tbody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${row.rank}</td><td>${row.player_name}</td><td>${row.trophies}</td>`;
    tbody.appendChild(tr);
  });
}

function setupDropdowns() {
  const seasonSelect = document.getElementById("seasonSelect");
  SEASON_LIST.forEach(season => {
    const opt = document.createElement("option");
    opt.value = season;
    opt.innerText = season;
    seasonSelect.appendChild(opt);
  });

  const brawlerSelect = document.getElementById("brawlerSelect");
  const brawlers = [
    { id: 16000000, name: "Shelly" },
    { id: 16000001, name: "Colt" },
    // Add more brawlers here later
  ];

  brawlers.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.innerText = b.name;
    brawlerSelect.appendChild(opt);
  });

  document.getElementById("seasonSelect").onchange = refresh;
  document.getElementById("brawlerSelect").onchange = refresh;
}

async function refresh() {
  const season = document.getElementById("seasonSelect").value;
  const brawlerId = document.getElementById("brawlerSelect").value;
  const data = await fetchData(season, brawlerId);
  loadTable(data);
}

setupDropdowns();
