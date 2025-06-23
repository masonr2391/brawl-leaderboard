const SUPABASE_URL = 'https://ymqtgsleywpsdfardrle.supabase.co';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjI4YmYxZTQ2LTEwN2YtNDg2OS1hNGYxLTRhNzlhYzM2NTljMSIsImlhdCI6MTc1MDYzODI2Mywic3ViIjoiZGV2ZWxvcGVyLzc4M2MwYjE2LTMwYjItZDA0Yy0zN2FhLWI4YmY5MmE4MjE0YyIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiNjYuMjIyLjI0MS4xIl0sInR5cGUiOiJjbGllbnQifV19.ZMlv8rPhQDWtpqSml49UccXpPxglji2EehpSrkfLTocrZpVD6LzVJOwxqzSDT62xkTJaUkaT7QtD8krUke75sw';

async function getSeasons() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/leaderboards?select=season_date&distinct=season_date`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  return data
    .map(r => new Date(r.season_date))
    .sort((a, b) => b - a)
    .map(d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
}

async function getBrawlers() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/brawlers?select=id,name&order=name.asc`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  return await res.json();
}

async function fetchData(seasonDateFormatted, brawlerId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/leaderboards?brawler_id=eq.${brawlerId}&select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const all = await res.json();

  // Find only entries that match the display label of the dropdown
  return all.filter(row => {
    const d = new Date(row.season_date);
    const label = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return label === seasonDateFormatted;
  });
}

function loadTable(data) {
  const tbody = document.querySelector("#leaderboardTable tbody");
  tbody.innerHTML = "";
  if (!data.length) {
    tbody.innerHTML = "<tr><td colspan='3'>No data available.</td></tr>";
    return;
  }
  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.rank}</td><td>${r.player_name}</td><td>${r.trophies}</td>`;
    tbody.appendChild(tr);
  });
}

async function setupDropdowns() {
  const seasonSelect = document.getElementById("seasonSelect");
  const brawlerSelect = document.getElementById("brawlerSelect");
  const [seasons, brawlers] = await Promise.all([getSeasons(), getBrawlers()]);
  
  seasons.forEach(season => {
    const opt = document.createElement("option");
    opt.value = season;
    opt.textContent = `Season started ${season}`;
    seasonSelect.appendChild(opt);
  });

  brawlers.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.name;
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

setupDropdowns().catch(console.error);
