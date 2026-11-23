import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const gamesDir = path.join(root, 'public', 'img', 'games');
const fontsDir = path.join(root, 'src', 'assets', 'fonts');
const stylesDir = path.join(root, 'src', 'styles');
await fs.mkdir(gamesDir, { recursive: true });
await fs.mkdir(fontsDir, { recursive: true });
await fs.mkdir(stylesDir, { recursive: true });

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function download(url, file) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(file, buf);
  return buf.length;
}

const steamApps = {
  'rdr2': 1174180,
  'ready-or-not': 1144200,
  'bf1': 1238840,
  'garrys-mod': 4000,
  'helldivers-2': 553850,
  'arma-reforger': 1874880,
  'pubg': 578080,
  'cs2': 730,
  'arc-raiders': 1808500,
};

const manifest = {};

for (const [slug, id] of Object.entries(steamApps)) {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${id}&l=english&cc=us`,
      { headers: { 'user-agent': UA } },
    );
    const json = await res.json();
    const data = json?.[id]?.data;
    if (!data) throw new Error('no data');

    const coverUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`;
    const headerUrl = data.header_image;
    const shot = data.screenshots?.[0]?.path_full ?? data.background_raw;

    manifest[slug] = {
      appid: id,
      name: data.name,
      genres: data.genres?.map((g) => g.description),
      cover: coverUrl,
      header: headerUrl,
      screenshot: shot,
    };

    let coverBytes = 0;
    try {
      coverBytes = await download(coverUrl, path.join(gamesDir, `${slug}-cover.jpg`));
    } catch {
      coverBytes = 0;
    }
    if (coverBytes < 15000) {
      try {
        await download(headerUrl, path.join(gamesDir, `${slug}-cover.jpg`));
        manifest[slug].coverFallback = true;
      } catch {}
    }

    await download(headerUrl, path.join(gamesDir, `${slug}-wide.jpg`));
    if (shot) await download(shot, path.join(gamesDir, `${slug}-shot.jpg`));
    console.log('ok', slug, data.name);
    await new Promise((r) => setTimeout(r, 400));
  } catch (err) {
    console.error('fail', slug, String(err));
  }
}

const external = {
  'gta-vi': {
    cover:
      'https://www.rockstargames.com/VI/_next/static/media/poster_full.0az_iud2g3y4j.jpg?akim=1&imdensity=1&imwidth=1024',
    wide: 'https://www.rockstargames.com/VI/_next/static/media/meta.0t8ty~nlmxq2s.jpg',
    screenshot:
      'https://www.rockstargames.com/VI/_next/static/media/meta.0t8ty~nlmxq2s.jpg',
  },
  'minecraft': {
    wide: 'https://store-images.s-microsoft.com/image/apps.17382.13510798887677013.afcc99fc-bdcc-4b9c-8261-4b2cd93b8845.49beb011-7271-4f15-a78b-422c511871e4',
    cover:
      'https://store-images.s-microsoft.com/image/apps.17382.13510798887677013.afcc99fc-bdcc-4b9c-8261-4b2cd93b8845.49beb011-7271-4f15-a78b-422c511871e4',
  },
  'ghost-recon-wildlands': {
    cover:
      'https://upload.wikimedia.org/wikipedia/en/b/b9/Ghost_Recon_Wildlands_cover_art.jpg',
    header:
      'https://upload.wikimedia.org/wikipedia/en/b/b9/Ghost_Recon_Wildlands_cover_art.jpg',
  },
};

for (const [slug, urls] of Object.entries(external)) {
  manifest[slug] = { ...(manifest[slug] ?? {}), ...urls, external: true };
  for (const [kind, url] of Object.entries(urls)) {
    const file = `${slug}-${kind === 'wide' ? 'wide' : kind === 'header' ? 'wide' : kind}.jpg`;
    try {
      await download(url, path.join(gamesDir, file));
      console.log('ok external', slug, kind);
    } catch (err) {
      console.error('fail external', slug, kind, String(err));
    }
  }
}

await fs.writeFile(path.join(gamesDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

const families = [
  ['Inter+Tight:wght@300..700', 'inter-tight', 'cyrillic,latin'],
  ['JetBrains+Mono:wght@400;500', 'jetbrains-mono', 'cyrillic,latin'],
  ['Cormorant:ital,wght@0,500;1,500', 'cormorant', 'cyrillic,latin'],
];

let css = '\n';
for (const [family, slug, subsets] of families) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  const text = await res.text();
  const blocks = text.split('/*').slice(1);
  for (const block of blocks) {
    const subset = block.slice(0, block.indexOf('*/')).trim();
    if (!subsets.split(',').includes(subset)) continue;
    const body = block.slice(block.indexOf('*/') + 2);
    const fm = body.match(/@font-face\s*{([\s\S]*?)}/);
    if (!fm) continue;
    const src = fm[1].match(/url\((https:[^)]+)\)/);
    if (!src) continue;
    const style = (fm[1].match(/font-style:\s*([^;]+);/) ?? [])[1]?.trim() ?? 'normal';
    const weight = (fm[1].match(/font-weight:\s*([^;]+);/) ?? [])[1]?.trim() ?? '400';
    const unicode = (fm[1].match(/unicode-range:\s*([^;]+);/) ?? [])[1]?.trim() ?? '';
    const cleanWeight = weight.replace(/\s+/g, '');
    const file = `${slug}-${cleanWeight}-${style}-${subset}.woff2`;
    try {
      await download(src[1], path.join(fontsDir, file));
    } catch (err) {
      console.error('font fail', file, String(err));
      continue;
    }
    css += `@font-face{font-family:"${slug}";font-style:${style};font-weight:${cleanWeight};font-display:swap;src:url("../assets/fonts/${file}") format("woff2");${unicode ? `unicode-range:${unicode};` : ''}}\n`;
    console.log('font ok', file);
  }
}
await fs.writeFile(path.join(stylesDir, 'fonts.css'), css);
console.log('done');
