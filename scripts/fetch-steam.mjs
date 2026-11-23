import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PROFILES = ['javops', 'javierping'];
const OUT = path.join('public', 'data', 'steam-live.json');
const APP_CACHE_FILE = path.join('scripts', 'appcache.json');

const APP_NAMES = {
  4000: "Garry's Mod",
  730: 'Counter-Strike 2',
  440: 'Team Fortress 2',
  1174180: 'Red Dead Redemption 2',
  1938090: 'Call of Duty HQ',
  1962663: 'Call of Duty: Warzone',
  553850: 'HELLDIVERS 2',
  1874880: 'Arma Reforger',
  3595270: 'Modern Warfare III',
  3595230: 'Modern Warfare II',
  3354750: 'skate.',
  3419430: 'Bongo Cat',
  239140: 'Dying Light',
  1144200: 'Ready or Not',
  1808500: 'ARC Raiders',
  1238840: 'Battlefield 1',
  578080: 'PUBG: Battlegrounds',
  3241660: 'R.E.P.O.',
  477160: 'Human Fall Flat',
  4435490: 'Modern Warfare 4',
  4131730: 'VHOLUME',
};
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const MONTHS = {
  January: 'января',
  February: 'февраля',
  March: 'марта',
  April: 'апреля',
  May: 'мая',
  June: 'июня',
  July: 'июля',
  August: 'августа',
  September: 'сентября',
  October: 'октября',
  November: 'ноября',
  December: 'декабря',
  Jan: 'января',
  Feb: 'февраля',
  Mar: 'марта',
  Apr: 'апреля',
  Jun: 'июня',
  Jul: 'июля',
  Aug: 'августа',
  Sep: 'сентября',
  Oct: 'октября',
  Nov: 'ноября',
  Dec: 'декабря',
};

async function get(url, { retries = 3 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
      });
      if (res.ok) return res.text();
      lastError = new Error(`${res.status} ${url}`);
      if (res.status !== 429 && res.status < 500) throw lastError;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
  }
  throw lastError;
}

const PROFILE_REFRESH_MS = 60_000; // XML + HTML профиля
const BACKOFF_MS = 60_000; // пауза, если Steam отдал мусор или сеть упала
const NEG_TTL_MS = 5 * 60_000; // память об ошибке appdetails

function decode(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function xmlValue(xml, tag) {
  const match = xml.match(
    new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`),
  );
  return match ? decode(match[1].trim()) : '';
}

function parseShortDate(raw) {
  if (!raw) return null;
  let match = raw.match(/(\d{1,2})\s+([A-Za-z]{3})/);
  if (match) return { day: Number(match[1]), mon: match[2] };
  match = raw.match(/([A-Za-z]{3})[a-z]*\s+(\d{1,2})/);
  if (match) return { day: Number(match[2]), mon: match[1] };
  return null;
}

function ruDate(raw) {
  if (!raw) return '';
  let match = raw.match(/^([A-Za-z]+)\s+(\d{1,2}),?(?:\s+(\d{4}))?$/);
  if (match) {
    const month = MONTHS[match[1]];
    if (month) return `${match[2]} ${month}${match[3] ? ` ${match[3]}` : ''}`;
  }
  match = raw.match(/^(\d{1,2})\s+([A-Za-z]+),?(?:\s+(\d{4}))?$/);
  if (match) {
    const month = MONTHS[match[2]];
    if (month) return `${match[1]} ${month}${match[3] ? ` ${match[3]}` : ''}`;
  }
  return raw;
}

function ruShortDate(raw) {
  if (!raw) return '';
  const parsed = parseShortDate(raw);
  if (!parsed) return raw;
  const month = MONTHS[parsed.mon];
  return month ? `${parsed.day} ${month}` : raw;
}

const MONTH_INDEX = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function shortDateISO(raw, now = new Date()) {
  const parsed = parseShortDate(raw);
  if (!parsed) return undefined;
  const month = MONTH_INDEX[parsed.mon];
  if (month === undefined) return undefined;
  const date = new Date(now.getFullYear(), month, parsed.day);
  if (date.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
    date.setFullYear(date.getFullYear() - 1);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

let appStore = {};
let appStoreDirty = false;
const APP_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

async function loadAppCache() {
  try {
    appStore = JSON.parse(await readFile(APP_CACHE_FILE, 'utf8'));
  } catch {
    appStore = {};
  }
}

async function saveAppCache() {
  if (!appStoreDirty) return;
  try {
    await mkdir(path.dirname(APP_CACHE_FILE), { recursive: true });
    await writeFile(APP_CACHE_FILE, JSON.stringify(appStore), 'utf8');
  } catch {
  }
}

async function resolveApp(appid) {
  const cached = appStore[appid];
  if (cached) {
    const ttl = cached.miss ? NEG_TTL_MS : APP_CACHE_TTL_MS;
    if (Date.now() - cached.at <= ttl) return cached.miss ? null : cached;
  }

  let result = null;
  try {
    const body = await get(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&filters=basic`,
      { retries: 1 },
    );
    const entry = JSON.parse(body)?.[appid];
    if (entry?.success && entry.data?.name) {
      result = {
        title: entry.data.name,
        type: entry.data.type ?? 'game',
        capsule: entry.data.capsule_image ?? null,
        header: entry.data.header_image ?? null,
        at: Date.now(),
      };
    }
  } catch {
    result = null;
  }

  if (!result) {
    if (cached && !cached.miss) return cached;
    if (APP_NAMES[appid]) {
      const fallback = {
        title: APP_NAMES[appid],
        type: 'game',
        capsule: cached?.capsule ?? null,
        header: cached?.header ?? null,
        at: Date.now(),
      };
      appStore[appid] = fallback;
      appStoreDirty = true;
      return fallback;
    }
    if (!cached) {
      appStore[appid] = { miss: true, at: Date.now() };
      appStoreDirty = true;
    }
    return null;
  }

  appStore[appid] = result;
  appStoreDirty = true;
  return result;
}

async function webRecent(htmlRecent, prevRecent) {
  const prevByApp = new Map(
    (prevRecent ?? []).filter((g) => g.appid).map((g) => [g.appid, g]),
  );
  const recent = [];

  for (const game of htmlRecent) {
    if (!game.appid) continue;
    const app = (await resolveApp(game.appid)) ?? prevByApp.get(game.appid) ?? null;
    if (app && app.type && app.type !== 'game') continue;
    const prev = prevByApp.get(game.appid);

    recent.push({
      title: game.title,
      appid: game.appid,
      hours: game.hours || prev?.hours || 0,
      capsule: app?.capsule ?? prev?.capsule ?? null,
      header: app?.header ?? prev?.header ?? null,
      lastPlayed: game.lastPlayed || prev?.lastPlayed || '',
      lastPlayedISO: game.lastPlayedISO ?? prev?.lastPlayedISO ?? undefined,
    });
  }

  return recent;
}

async function maintainLibrary(prevLibrary, recent) {
  const library = prevLibrary
    ? {
        totalHours: prevLibrary.totalHours ?? 0,
        appsWithTime: prevLibrary.appsWithTime ?? 0,
        hoursByAppId: { ...(prevLibrary.hoursByAppId ?? {}) },
        titleByAppId: { ...(prevLibrary.titleByAppId ?? {}) },
      }
    : { totalHours: 0, appsWithTime: 0, hoursByAppId: {}, titleByAppId: {} };

  for (const game of recent ?? []) {
    if (game.appid == null) continue;
    if (game.title) library.titleByAppId[game.appid] = game.title;
    if (!game.hours || game.hours <= 0) continue;

    const prevHours = library.hoursByAppId[game.appid] ?? 0;
    if (prevHours === game.hours) continue;
    library.totalHours = Math.max(0, (library.totalHours ?? 0) - prevHours + game.hours);
    if (!prevHours) library.appsWithTime += 1;
    library.hoursByAppId[game.appid] = game.hours;
  }

  const top = await buildTop(library);
  return { ...library, top };
}

const COD_APPIDS = [1938090, 3595230, 3595270];
const COD_APPID = 1938090;
const COD_TITLE = 'Call of Duty®';

async function buildTop(library) {
  const entries = Object.entries(library.hoursByAppId)
    .map(([appid, hours]) => ({ appid: Number(appid), hours }))
    .filter((game) => game.hours > 0);

  const codHours = Math.round(
    entries
      .filter((game) => COD_APPIDS.includes(game.appid))
      .reduce((sum, game) => sum + game.hours, 0) * 10,
  ) / 10;
  const candidates = entries.filter((game) => !COD_APPIDS.includes(game.appid));
  if (codHours > 0) candidates.push({ appid: COD_APPID, hours: codHours });

  candidates.sort((a, b) => b.hours - a.hours);

  const top = [];
  for (const game of candidates.slice(0, 12)) {
    let title = library.titleByAppId[game.appid] ?? APP_NAMES[game.appid];
    if (!title) {
      const app = await resolveApp(game.appid);
      title = app?.title ?? null;
      if (title) library.titleByAppId[game.appid] = title;
    }
    if (title) top.push({ appid: game.appid, title, hours: game.hours });
  }

  return top.map((row) => (row.appid === COD_APPID ? { ...row, title: COD_TITLE } : row)).slice(0, 8);
}

function parseRecent(html) {
  const games = [];
  const chunks = html.split('<div class="recent_game">').slice(1);

  for (const chunk of chunks) {
    const info = chunk.split('<div class="game_info_stats">')[0];
    const title = info.match(/class="game_name"><a[^>]*>([\s\S]*?)<\/a>/);
    if (!title) continue;

    const appid = Number(info.match(/steamcommunity\.com\/app\/(\d+)/)?.[1] ?? 0);
    const hours = Number(
      info.match(/([\d.,]+)\s*(?:hrs|hours) on record/)?.[1]?.replace(/,/g, '') ?? 0,
    );
    const rawDate = info.match(/last played on ([^<]+)/)?.[1]?.trim() ?? '';

    const noDate = !rawDate;
    const now = new Date();
    const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')}`;

    games.push({
      title: decode(title[1]).trim(),
      appid,
      hours,
      lastPlayed: noDate ? 'сегодня' : ruShortDate(rawDate),
      lastPlayedISO: noDate ? todayISO : shortDateISO(rawDate),
    });
  }

  return games;
}

async function fetchProfileLight(id) {
  const [xml, html] = await Promise.all([
    get(`https://steamcommunity.com/id/${id}/?xml=1`),
    get(`https://steamcommunity.com/id/${id}/`),
  ]);

  if (!xmlValue(xml, 'steamID')) throw new Error('XML без steamID — мусорный ответ');
  if (!html.includes('profile_in_game')) throw new Error('HTML без данных профиля');

  return {
    nickname: xmlValue(xml, 'steamID') || id,
    avatar: xmlValue(xml, 'avatarFull') || null,
    memberSince: ruDate(xmlValue(xml, 'memberSince')) || null,
    level: Number(html.match(/friendPlayerLevelNum[^>]*>(\d+)</)?.[1] ?? 0) || null,
    libraryCount: Number(html.match(/(\d+)\s+games in library/)?.[1] ?? 0) || null,
    htmlRecent: parseRecent(html),
  };
}

async function main() {
  await loadAppCache();

  let previous = null;
  try {
    previous = JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    previous = null;
  }

  const now = Date.now();
  const profiles = {};
  let anyFresh = false;

  for (const id of PROFILES) {
    const prev = previous?.profiles?.[id] && !previous.profiles[id].error
      ? previous.profiles[id]
      : null;
    const profile = prev ? { ...prev } : { url: `https://steamcommunity.com/id/${id}/` };
    for (const legacy of [
      'online',
      'inGame',
      'playing',
      'state',
      'inGameSince',
      'xmlInGame',
      'xmlSeenAt',
      'statusAt',
      'htmlAt',
      'networkDegraded',
    ]) {
      delete profile[legacy];
    }
    const canNetwork = now >= (profile.nextNetworkAt ?? 0);

    const due =
      (!profile.refreshAt || now - profile.refreshAt >= PROFILE_REFRESH_MS) && canNetwork;
    if (due) {
      try {
        const light = await fetchProfileLight(id);
        profile.nickname = light.nickname || profile.nickname || id;
        profile.avatar = light.avatar ?? profile.avatar ?? null;
        profile.memberSince = light.memberSince ?? profile.memberSince ?? null;
        if (light.level != null) profile.level = light.level;
        if (light.libraryCount != null) profile.libraryCount = light.libraryCount;
        if (light.htmlRecent.length) profile.htmlRecent = light.htmlRecent;
        profile.refreshAt = now;
        profile.networkDegraded = false;
        delete profile.error;
        delete profile.nextNetworkAt;
        anyFresh = true;
      } catch (error) {
        if (prev) {
          profile.nextNetworkAt = now + BACKOFF_MS;
          console.warn(`${id}: профиль не получен (${error.message ?? error}) — данные прошлого снимка`);
        } else {
          profile.error = String(error.message ?? error);
          console.warn(`${id}: ${error.message ?? error}`);
        }
      }
    }

    if (profile.htmlRecent?.length) {
      const recent = await webRecent(profile.htmlRecent, prev?.recent);
      if (recent.length) profile.recent = recent;
    } else if (!profile.recent && prev?.recent) {
      profile.recent = prev.recent;
    }

    profile.library = await maintainLibrary(profile.library ?? prev?.library, profile.recent);

    if (profile.nickname) {
      console.log(
        `${id}: level ${profile.level ?? '?'}, ${profile.libraryCount ?? '?'} games, ` +
          `${profile.recent?.length ?? 0} recent, ` +
          `${profile.library ? `${profile.library.totalHours} h total` : 'no hours yet'}` +
          (profile.networkDegraded ? ' [кэш]' : ''),
      );
    }

    profiles[id] = profile;
  }

  const ready = Object.values(profiles).filter((p) => p.nickname).length;
  if (!ready) {
    throw new Error('Steam не отдал данные ни по одному профилю');
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    source: 'steamcommunity.com',
    profiles,
  };

  await mkdir(path.dirname(OUT), { recursive: true });
  const tmpOut = `${OUT}.tmp`;
  const body = JSON.stringify(payload, null, 2) + '\n';
  await writeFile(tmpOut, body);
  let renamed = false;
  for (let attempt = 0; attempt < 5 && !renamed; attempt += 1) {
    try {
      await rename(tmpOut, OUT);
      renamed = true;
    } catch (error) {
      if (error.code !== 'EBUSY' && error.code !== 'EPERM' && error.code !== 'EACCES') {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  if (!renamed) {
    await writeFile(OUT, body);
    console.warn('rename не прошёл — записал снимок напрямую');
  }
  await saveAppCache();
  console.log(`saved ${OUT}${anyFresh ? '' : ' (без сети — данные прошлого снимка)'}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
