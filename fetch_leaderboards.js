require('dotenv').config();
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const BRAWL_API_KEY = process.env.BRAWL_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BRAWLERS = [
  "Kaze", "Jae-Yong", "Finx", "Lumi", "Ollie", "Meeple", "Buzz Lightyear", "Juju", "Shade", "Kenji",
  "Moe", "Clancy", "Berry", "Lily", "Draco", "Angelo", "Melodie", "Larry & Lawrie", "Kit", "Mico",
  "Charlie", "Chuck", "Pearl", "Doug", "Cordelius", "Hank", "Maisie", "Willow", "R-T", "Mandy",
  "Gray", "Chester", "Buster", "Gus", "Sam", "Otis", "Bonnie", "Janet", "Eve", "Fang", "Lola",
  "Meg", "Ash", "Griff", "Buzz", "Grom", "Squeak", "Belle", "Stu", "Ruffs", "Edgar", "Byron", "Lou",
  "Amber", "Colette", "Surge", "Sprout", "Nani", "Gale", "Jacky", "Max", "Mr. P", "Emz", "Bea",
  "Sandy", "8-Bit", "Bibi", "Carl", "Rosa", "Leon", "Tick", "Gene", "Frank", "Penny", "Darryl", "Tara",
  "Pam", "Piper", "Bo", "Poco", "Crow", "Mortis", "El Primo", "Dynamike", "Nita", "Jessie", "Barley",
  "Spike", "Rico", "Brock", "Bull", "Colt", "Shelly"
];

async function fetchTop200(brawler) {
  const url = `https://api.brawlstars.com/v1/rankings/global/brawlers/${encodeURIComponent(brawler)}?limit=200`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${BRAWL_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch ${brawler}: ${error}`);
  }

  const data = await response.json();

  console.log(`Data for ${brawler}:`, JSON.stringify(data, null, 2)); // DEBUG

  if (!data.items || !Array.isArray(data.items)) {
    throw new Error(`Unexpected response for ${brawler}: ${JSON.stringify(data)}`);
  }

  return data.items.map(player => ({
    brawler,
    name: player.name,
    tag: player.tag,
    trophies: player.trophies,
    rank: player.rank,
    timestamp: new Date().toISOString()
  }));
}

async function uploadLeaderboard() {
  const allData = [];

  for (const brawler of BRAWLERS) {
    try {
      console.log(`Fetching ${brawler}...`);
      const players = await fetchTop200(brawler);
      allData.push(...players);
    } catch (error) {
      console.error(`❌ Error fetching ${brawler}:`, error.message);
    }
  }

  console.log("Uploading to Supabase...");
  const { error } = await supabase.from('leaderboards').insert(allData);

  if (error) {
    console.error("❌ Supabase upload failed:", error.message);
  } else {
    console.log("✅ Upload complete!");
  }
}

uploadLeaderboard();
