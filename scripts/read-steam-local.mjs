import fs from 'node:fs/promises';
import path from 'node:path';

const STEAM = 'C:\\Program Files (x86)\\Steam';
const userdata = path.join(STEAM, 'userdata');
const cacheDir = path.join(process.cwd(), 'scripts', '.cache');
await fs.mkdir(cacheDir, { recursive: true });

function parseVdf(text) {
  let i = 0;
  const n = text.length;

  function skip() {
    while (i < n) {
      const c = text[i];
      if (c === ' ' || c === '\t' || c === '\r' || c === '\n') i += 1;
      else if (c === '/' && text[i + 1] === '/') {
        while (i < n && text[i] !== '\n') i += 1;
      } else break;
    }
  }

  function readString() {
    if (text[i] !== '"') throw new Error(`expected quote at ${i}`);
    i += 1;
    let out = '';
    while (i < n) {
      const c = text[i];
      if (c === '\\') {
        i += 1;
        const esc = text[i];
        out += esc === 'n' ? '\n' : esc === 't' ? '\t' : esc;
        i += 1;
      } else if (c === '"') {
        i += 1;
        return out;
      } else {
        out += c;
        i += 1;
      }
    }
    throw new Error('unterminated string');
  }

  function readObject() {
    const obj = {};
    skip();
    if (text[i] === '{') i += 1;
    while (i < n) {
      skip();
      if (text[i] === '}') {
        i += 1;
        return obj;
      }
      const key = readString();
      skip();
      if (text[i] === '{') obj[key] = readObject();
      else obj[key] = readString();
    }
    return obj;
  }

  skip();
  const rootKey = readString();
  return { [rootKey]: readObject() };
}

const nameCachePath = path.join(cacheDir, 'app-names.json');
let nameCache = {};
try {
  nameCache = JSON.parse(await fs.readFile(nameCachePath, 'utf8'));
} catch {}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function resolveNames(ids) {
  let fetched = 0;
  for (const id of ids) {
    if (nameCache[id]) continue;
    try {
      const res = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${id}&filters=basic&l=english&cc=us`,
        { headers: { 'user-agent': UA } },
      );
      const json = await res.json();
      const data = json?.[id]?.data;
      nameCache[id] = data?.name ?? null;
      fetched += 1;
      await new Promise((r) => setTimeout(r, 160));
    } catch {
      nameCache[id] = null;
    }
  }
  if (fetched) await fs.writeFile(nameCachePath, JSON.stringify(nameCache, null, 2));
}

const accounts = {
  javops: { accountId: '693406322', steamId: '76561198653672050' },
  javierping: { accountId: '1291676335', steamId: '76561199251942063' },
};

const curated = {
  271590: 'GTA V',
  1174180: 'Red Dead Redemption 2',
  1144200: 'Ready or Not',
  1238840: 'Battlefield 1',
  1238850: 'Battlefield 1 (доп.)',
  393380: 'Squad',
  4000: "Garry's Mod",
  553850: 'HELLDIVERS 2',
  1874880: 'Arma Reforger',
  4435490: 'CoD MW4',
  3595270: 'CoD MW3',
  578080: 'PUBG',
  730: 'CS2',
  581320: 'Insurgency Sandstorm',
  447040: 'Watch Dogs 2',
  1808500: 'ARC Raiders',
  1091500: 'Cyberpunk 2077',
  2807960: 'Battlefield 6',
  238960: 'Path of Exile',
  108600: 'Project Zomboid',
  3241660: 'R.E.P.O.',
  945360: 'Among Us',
  477160: 'Human Fall Flat',
  440: 'Team Fortress 2',
  10: 'Counter-Strike',
  70: 'Half-Life',
  220: 'Half-Life 2',
  320: 'Half-Life 2: Deathmatch',
  300: 'Day of Defeat: Source',
  240: 'Counter-Strike: Source',
  550: 'Left 4 Dead 2',
  620: 'Portal 2',
  105600: 'Terraria',
  292030: 'The Witcher 3',
  1172470: 'Apex Legends',
  359550: 'Rainbow Six Siege',
  236390: 'War Thunder',
  252490: 'Rust',
  304930: 'Unturned',
  244210: 'Assetto Corsa',
  1551360: 'Forza Horizon 5',
  1599340: 'Lost Ark',
  1938090: 'Call of Duty HQ',
  1966720: 'Lethal Company',
  739630: 'Phasmophobia',
};

const parsed = {};

for (const [nick, acc] of Object.entries(accounts)) {
  const file = path.join(userdata, acc.accountId, 'config', 'localconfig.vdf');
  const root = parseVdf(await fs.readFile(file, 'utf8'));
  const apps =
    root.UserLocalConfigStore?.Software?.Valve?.Steam?.apps ??
    root.UserLocalConfigStore?.Software?.Valve?.Steam?.Apps ??
    {};

  const rows = [];
  for (const [id, entry] of Object.entries(apps)) {
    if (typeof entry !== 'object') continue;
    const minutes = Number(entry.Playtime ?? 0);
    const recent = Number(entry.Playtime2wks ?? 0);
    const lastPlayed = Number(entry.LastPlayed ?? 0);
    if (!minutes && !lastPlayed) continue;
    rows.push({
      appid: Number(id),
      hours: Math.round((minutes / 60) * 10) / 10,
      recentHours: Math.round((recent / 60) * 10) / 10,
      lastPlayed,
    });
  }
  parsed[nick] = { acc, rows };
}

const need = new Set();
for (const { rows } of Object.values(parsed)) {
  rows
    .filter((r) => r.hours > 0)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 45)
    .forEach((r) => need.add(r.appid));
  rows
    .filter((r) => r.lastPlayed > 0)
    .sort((a, b) => b.lastPlayed - a.lastPlayed)
    .slice(0, 30)
    .forEach((r) => need.add(r.appid));
}
Object.keys(curated).forEach((id) => need.add(Number(id)));
await resolveNames([...need]);

const nameOf = (id) => nameCache[id] ?? curated[id] ?? `app ${id}`;

const report = {};

for (const [nick, { acc, rows }] of Object.entries(parsed)) {
  rows.forEach((r) => {
    r.name = nameOf(r.appid);
  });

  const played = rows.filter((r) => r.hours > 0).sort((a, b) => b.hours - a.hours);
  const totalHours = played.reduce((sum, r) => sum + r.hours, 0);
  const lastPlayed = rows
    .filter((r) => r.lastPlayed > 0)
    .sort((a, b) => b.lastPlayed - a.lastPlayed);

  console.log(`\n================ ${nick} (${acc.steamId}) ================`);
  console.log(`apps with playtime: ${played.length}`);
  console.log(`apps launched: ${rows.length}`);
  console.log(`total hours: ${totalHours.toFixed(1)}`);

  console.log('\n--- top 35 by hours ---');
  played.slice(0, 35).forEach((r, idx) => {
    const d = r.lastPlayed
      ? new Date(r.lastPlayed * 1000).toISOString().slice(0, 10)
      : '—';
    console.log(
      `${String(idx + 1).padStart(2)}. ${r.hours.toFixed(1).padStart(7)} h  ${d}  ${r.name} [${r.appid}]`,
    );
  });

  console.log('\n--- last 20 launched ---');
  lastPlayed.slice(0, 20).forEach((r) => {
    const d = new Date(r.lastPlayed * 1000).toISOString().slice(0, 10);
    console.log(`${d}  ${r.hours.toFixed(1).padStart(7)} h  ${r.name} [${r.appid}]`);
  });

  console.log('\n--- curated ---');
  for (const [id, label] of Object.entries(curated)) {
    const row = rows.find((r) => r.appid === Number(id));
    const d = row?.lastPlayed
      ? new Date(row.lastPlayed * 1000).toISOString().slice(0, 10)
      : '—';
    console.log(
      `${label.padEnd(28)} ${row ? `${row.hours.toFixed(1)} h  ${d}` : 'нет в локальных данных'}  [${id}]`,
    );
  }

  report[nick] = { accountId: acc.accountId, totalHours, apps: rows };
}

await fs.writeFile(
  path.join(cacheDir, 'steam-local-report.json'),
  JSON.stringify(report, null, 2),
);
console.log('\nsaved scripts/.cache/steam-local-report.json');
