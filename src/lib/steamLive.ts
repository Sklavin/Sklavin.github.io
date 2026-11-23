import { useEffect, useState } from 'react';
import type { AccountId } from '../data/steam';
import { timeAgo } from './time';

export type LiveRecentGame = {
  title: string;
  appid: number;
  hours: number;
  capsule?: string | null;
  header?: string | null;
  lastPlayed?: string;
  lastPlayedISO?: string;
  lastPlayedTs?: number;
};

export type LiveLibrary = {
  totalHours: number;
  appsWithTime: number;
  hoursByAppId: Record<string, number>;
  top: { appid: number; title: string; hours: number }[];
};

export type LiveProfile = {
  nickname?: string;
  url?: string;
  avatar?: string;
  privacy?: string;
  level?: number | null;
  libraryCount?: number | null;
  memberSince?: string;
  recent?: LiveRecentGame[];
  library?: LiveLibrary | null;
  error?: string;
};

export type SteamLive = {
  updatedAt: string;
  source?: string;
  profiles: Partial<Record<AccountId, LiveProfile>>;
};

const REFRESH_MS = 5 * 1000;
const CACHE_MS = 0;
const LIVE_URL = `${import.meta.env.BASE_URL}data/steam-live.json`;

let cache: { at: number; data: SteamLive } | null = null;
let inflight: Promise<SteamLive | null> | null = null;

async function load(): Promise<SteamLive | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;

  if (!inflight) {
    inflight = fetch(LIVE_URL, { cache: 'no-store' })
      .then((response) => (response.ok ? (response.json() as Promise<SteamLive>) : null))
      .then((data) => {
        if (data) cache = { at: Date.now(), data };
        return data;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

export function useSteamLive() {
  const [data, setData] = useState<SteamLive | null>(cache?.data ?? null);

  useEffect(() => {
    let alive = true;

    const refresh = () => {
      void load().then((next) => {
        if (alive && next) setData(next);
      });
    };

    refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return data;
}

export function formatLiveTime(updatedAt?: string) {
  return timeAgo(updatedAt);
}
