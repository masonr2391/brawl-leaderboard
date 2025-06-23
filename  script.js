const SUPABASE_URL = 'https://ymqtgsleywpsdfardrle.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcXRnc2xleXdwc2RmYXJkcmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzY2NzksImV4cCI6MjA2NjIxMjY3OX0.QzE_pTFsUwUQM-17QLIw5FGD_4hR2INCx0k_IYHDIfU';

// You can replace this hardcoded season list later
const SEASON_LIST = ['2025-06'];

async function getBrawlers() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/brawlers?select=id,name&order=name.asc`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  return await res.json();
}

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
  if (data.length === 0) {
    tbody.innerHTML = "<tr><td colspan='3'>No data available.</td></tr>";
    return;
  }
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${row.rank}</td><td>${row.player_name}</td><td>${row.trophies}</td>`;
    tbody.appendChild(tr);
  });
}

async function setupDropdowns() {
  const seasonSelect = document.getElementById("seasonSelect");
  SEASON_LIST.forEach(season => {
    const opt = document.createElement("option");
    opt.value = season;
    opt.innerText = season;
    seasonSelect.appendChild(opt);
  });

  const brawlerSelect = document.getElementById("brawlerSelect");
  const brawlers = await getBrawlers();

  brawlers.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.innerText = b.name;
    brawlerSelect.appendChild(opt);
  });

  seasonSelect.onchange = refresh;
  brawlerSelect.onchange = refresh;
}

async function refresh() {
  const season = document.getElementById("seasonSelect").value;
  const brawlerId = document.getElementById("brawlerSelect").value;
  const data = await fetchData(season, brawlerId);
  loadTable(data);
}

setupDropdowns();
