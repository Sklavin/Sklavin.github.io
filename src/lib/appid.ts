export function steamAppId(href: string): number | null {
  const match = href.match(/store\.steampowered\.com\/app\/(\d+)/);
  return match ? Number(match[1]) : null;
}
