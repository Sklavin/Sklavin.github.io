export type SteamProfile = {
  id: 'javops' | 'javierping';
  nickname: string;
  url: string;
  avatar: string;
  level: number;
  memberSince: string;
  libraryCount: number | null;
};

export const steamProfiles: SteamProfile[] = [
  {
    id: 'javops',
    nickname: 'javops',
    url: 'https://steamcommunity.com/id/javops/',
    avatar: 'steam/javops.jpg',
    level: 2,
    memberSince: '18 августа',
    libraryCount: 23,
  },
  {
    id: 'javierping',
    nickname: 'javierping',
    url: 'https://steamcommunity.com/id/javierping/',
    avatar: 'steam/javierping.jpg',
    level: 17,
    memberSince: '13 марта 2022',
    libraryCount: 116,
  },
];

export type AccountId = 'javops' | 'javierping';

export type RecentGame = {
  title: string;
  appid: number;
  capsule?: string;
  header?: string;
  playedAt: string;
  hours: number;
};

export type SteamAccountData = {
  id: AccountId;
  totalHours: number;
  appsWithTime: number;
  top: { title: string; appid?: number; hours: number }[];
  recent: RecentGame[];
};

export const steamData: Record<AccountId, SteamAccountData> = {
  javierping: {
    id: 'javierping',
    totalHours: 2599,
    appsWithTime: 288,
    top: [
      { title: "Garry's Mod", appid: 4000, hours: 842 },
      { title: 'Counter-Strike 2', appid: 730, hours: 220 },
      { title: 'Team Fortress 2', appid: 440, hours: 209 },
      { title: 'Red Dead Redemption 2', appid: 1174180, hours: 114 },
      { title: 'Call of Duty HQ', appid: 1938090, hours: 108 },
      { title: 'HELLDIVERS 2', appid: 553850, hours: 70 },
    ],
    recent: [
      { title: 'Ready or Not', appid: 1144200, playedAt: '2026-11-17', hours: 46 },
      { title: 'ARC Raiders', appid: 1808500, playedAt: '2026-11-16', hours: 54 },
      { title: 'HELLDIVERS 2', appid: 553850, playedAt: '2026-11-13', hours: 70 },
      { title: 'Team Fortress 2', appid: 440, playedAt: '2026-11-06', hours: 209 },
      { title: 'R.E.P.O.', appid: 3241660, playedAt: '2026-11-05', hours: 30 },
    ],
  },
  javops: {
    id: 'javops',
    totalHours: 195,
    appsWithTime: 49,
    top: [
      { title: 'Arma Reforger', appid: 1874880, hours: 40 },
      { title: 'Modern Warfare III', appid: 3595270, hours: 27 },
      { title: 'Call of Duty HQ', appid: 1938090, hours: 26 },
      { title: 'Modern Warfare II', hours: 9 },
      { title: 'skate.', hours: 8 },
      { title: 'Dying Light', appid: 239140, hours: 7 },
    ],
    recent: [
      {
        title: 'Modern Warfare III',
        appid: 3595270,
        capsule:
          'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/05b8f73493348dfa9b6662dc13a6740929ea195b/capsule_231x87.jpg?t=1778886604',
        header:
          'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/7d0f21912a075c33bbb5ea558100e187ceb234ac/header.jpg?t=1778886604',
        playedAt: '2026-11-17',
        hours: 27,
      },
      {
        title: 'Call of Duty HQ',
        appid: 1938090,
        header:
          'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1938090/23af6cf41e2d09620caa07700a4cb3288dbcbaa8/header.jpg?t=1794591176',
        playedAt: '2026-11-16',
        hours: 26,
      },
      { title: "Garry's Mod", appid: 4000, playedAt: '2026-11-12', hours: 4 },
      { title: 'Human Fall Flat', appid: 477160, playedAt: '2026-11-06', hours: 1 },
      { title: 'Arma Reforger', appid: 1874880, playedAt: '2026-11-03', hours: 40 },
    ],
  },
};

export const totalHoursBoth = Object.values(steamData).reduce(
  (sum, account) => sum + account.totalHours,
  0,
);

export const bestGame = Object.values(steamData)
  .flatMap((account) => account.top)
  .reduce((best, game) => (game.hours > best.hours ? game : best));
