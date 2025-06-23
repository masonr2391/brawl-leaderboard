const fetch = require('node-fetch');

const BRAWL_API_KEY = process.env.BRAWL_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// 📅 Find first Thursday of this month (season start)
function getSeasonStart() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), 1);
  while (d.getDay() !== 4) d.setDate(d.getDate() + 1); // Thursday = 4
  return d.toISOString().slice(0, 10); // Format: YYYY-MM-DD
}

async function syncBrawlers() {
  const res = await fetch('https://api.brawlstars.com/v1/brawlers', {
    headers: { Authorization: `Bearer ${BRAWL_API_KEY}` }
  });
  const data = await res.json();

  for (const b of data.items) {
    await fetch(`${SUPABASE_URL}/rest/v1/brawlers`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: b.id,
        name: b.name,
        imageUrl: b.imageUrl,
        released: true
      })
    });
  }
}

async function uploadLeaderboard() {
  const season_date = getSeasonStart();

  await syncBrawlers();

  const res = await fetch(`${SUPABASE_URL}/rest/v1/brawlers?select=id,name`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const brawlers = await res.json();

  for (const brawler of brawlers) {
    console.log(`Fetching ${brawler.name}...`);
    const res = await fetch(`https://api.brawlstars.com/v1/rankings/global/brawlers/${brawler.id}?limit=200`, {
      headers: { Authorization: `Bearer ${BRAWL_API_KEY}` }
    });
    const data = await res.json();

    for (let i = 0; i < data.items.length; i++) {
      const player = data.items[i];
      await fetch(`${SUPABASE_URL}/rest/v1/leaderboards`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          season_date: season_date,
          brawler_id: brawler.id,
          brawler_name: brawler.name,
          player_tag: player.tag,
          player_name: player.name,
          trophies: player.trophies,
          rank: i + 1
        })
      });
    }
  }

  console.log('✅ Upload complete!');
}

uploadLeaderboard().catch(console.error);
