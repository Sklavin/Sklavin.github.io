export type GameTag =
  | 'tactical'
  | 'shooter'
  | 'open-world'
  | 'co-op'
  | 'military'
  | 'sandbox'
  | 'battle-royale'
  | 'extraction';

export type GameShape = 'poster' | 'landscape' | 'medium' | 'wide' | 'feature' | 'full';

export type Game = {
  id: string;
  title: string;
  year: number;
  genre: string;
  blurb: string;
  tags: GameTag[];
  shape: GameShape;
  image: string;
  imageAlt: string;
  href: string;
  linkLabel: string;
  hours?: {
    value: number;
    account: 'javops' | 'javierping';
    appids?: number[];
    extra?: { account: 'javops' | 'javierping'; appids: number[] }[];
  };
  hoursNote?: string;
};

export const gameFilters: { id: GameTag | 'all'; label: string }[] = [
  { id: 'all', label: 'Всё' },
  { id: 'tactical', label: 'Тактические' },
  { id: 'shooter', label: 'Шутеры' },
  { id: 'open-world', label: 'Открытый мир' },
  { id: 'co-op', label: 'Кооператив' },
  { id: 'military', label: 'Военные' },
  { id: 'sandbox', label: 'Песочницы' },
  { id: 'battle-royale', label: 'Battle Royale' },
  { id: 'extraction', label: 'Экстракшн' },
];

export const games: Game[] = [
  {
    id: 'arc-raiders',
    title: 'ARC Raiders',
    year: 2025,
    genre: 'Экстракшн-шутер',
    blurb:
      'Опустевшая Земля, механоиды ARC и рейды за лутом: собрал — уходи, пока не стало поздно.',
    tags: ['extraction', 'co-op', 'shooter'],
    shape: 'feature',
    image: 'arc-raiders-shot.jpg',
    imageAlt: 'Кадр из ARC Raiders',
    href: 'https://store.steampowered.com/app/1808500/',
    linkLabel: 'Steam',
    hours: { value: 54, account: 'javierping' },
  },
  {
    id: 'minecraft',
    title: 'Minecraft',
    year: 2011,
    genre: 'Песочница',
    blurb:
      'Игра, в которую хочется возвращаться снова и снова — блочный мир, крафт и бесконечная стройка.',
    tags: ['sandbox', 'open-world'],
    shape: 'poster',
    image: 'minecraft-cover.jpg',
    imageAlt: 'Официальный арт Minecraft',
    href: 'https://www.minecraft.net/',
    linkLabel: 'Сайт',
  },
  {
    id: 'ready-or-not',
    title: 'Ready or Not',
    year: 2023,
    genre: 'Тактический шутер',
    blurb:
      'SWAT без геройства: медленные зачистки, двери, газ и дисциплина.',
    tags: ['tactical', 'co-op'],
    shape: 'wide',
    image: 'ready-or-not-shot.jpg',
    imageAlt: 'Кадр из Ready or Not',
    href: 'https://store.steampowered.com/app/1144200/',
    linkLabel: 'Steam',
    hours: { value: 46, account: 'javierping' },
  },
  {
    id: 'rdr2',
    title: 'Red Dead Redemption 2',
    year: 2018,
    genre: 'Открытый мир',
    blurb:
      'Обожаю онлайн-режим, но сюжет не менее увлекательный — история банды Ван дер Линде на закате эпохи Дикого Запада.',
    tags: ['open-world'],
    shape: 'landscape',
    image: 'rdr2-wide.jpg',
    imageAlt: 'Кадр из Red Dead Redemption 2',
    href: 'https://store.steampowered.com/app/1174180/',
    linkLabel: 'Steam',
    hours: { value: 114, account: 'javierping' },
  },
  {
    id: 'helldivers-2',
    title: 'Helldivers 2',
    year: 2024,
    genre: 'Кооперативный шутер',
    blurb:
      'Управляемая демократия, орды жуков и дружественный огонь как часть плана.',
    tags: ['shooter', 'co-op'],
    shape: 'medium',
    image: 'helldivers-2-shot.jpg',
    imageAlt: 'Кадр из Helldivers 2',
    href: 'https://store.steampowered.com/app/553850/',
    linkLabel: 'Steam',
    hours: { value: 70, account: 'javierping' },
  },
  {
    id: 'arma-reforger',
    title: 'Arma Reforger',
    year: 2023,
    genre: 'Военный симулятор',
    blurb:
      'Холодная война, большие карты и редактор, в котором можно собрать собственный сценарий.',
    tags: ['military', 'tactical', 'sandbox'],
    shape: 'medium',
    image: 'arma-reforger-wide.jpg',
    imageAlt: 'Кадр из Arma Reforger',
    href: 'https://store.steampowered.com/app/1874880/',
    linkLabel: 'Steam',
    hours: { value: 40, account: 'javops' },
  },
  {
    id: 'bf1',
    title: 'Battlefield 1',
    year: 2016,
    genre: 'Шутер',
    blurb:
      'Absolute cinema — каждый раунд поставлен как сцена военного фильма: туман, газ, цеппелины и оркестр в финале.',
    tags: ['shooter', 'military'],
    shape: 'landscape',
    image: 'bf1-shot.jpg',
    imageAlt: 'Кадр из Battlefield 1',
    href: 'https://store.steampowered.com/app/1238840/',
    linkLabel: 'Steam',
    hours: { value: 59, account: 'javierping' },
  },
  {
    id: 'warzone',
    title: 'Call of Duty: Warzone',
    year: 2020,
    genre: 'Battle Royale',
    blurb:
      'Большая карта, контракты и вечное возвращение в бой. Та самая игра, в которую захожу без повода.',
    tags: ['battle-royale', 'shooter', 'military'],
    shape: 'wide',
    image: 'warzone-wide.jpg',
    imageAlt: 'Кадр из Call of Duty: Warzone',
    href: 'https://store.steampowered.com/app/1962663/',
    linkLabel: 'Steam',
    hours: {
      value: 169.9,
      account: 'javops',
      appids: [1938090, 3595270, 3595230],
      extra: [{ account: 'javierping', appids: [1938090] }],
    },
    hoursNote:
      'Сумма Call of Duty HQ, Modern Warfare II и Modern Warfare III по двум профилям.',
  },
  {
    id: 'pubg',
    title: 'PUBG: Battlegrounds',
    year: 2017,
    genre: 'Battle Royale',
    blurb:
      'Часов мало, а впечатлений много: побеждает не тот, кто стреляет первым, а тот, кто умирает последним.',
    tags: ['battle-royale', 'shooter'],
    shape: 'landscape',
    image: 'pubg-shot.jpg',
    imageAlt: 'Кадр из PUBG: Battlegrounds',
    href: 'https://store.steampowered.com/app/578080/',
    linkLabel: 'Steam',
    hours: { value: 12, account: 'javierping' },
  },
  {
    id: 'fortnite',
    title: 'Fortnite',
    year: 2017,
    genre: 'Battle Royale',
    blurb:
      'Сто игроков, падающий автобус и стройка под огнём: королевская битва, в которой проигрывать тоже бывает весело.',
    tags: ['battle-royale', 'shooter', 'co-op'],
    shape: 'landscape',
    image: 'fortnite-wide.jpg',
    imageAlt: 'Кадр из Fortnite',
    href: 'https://store.epicgames.com/en-US/p/fortnite',
    linkLabel: 'Epic Games',
  },
  {
    id: 'cs2',
    title: 'Counter-Strike 2',
    year: 2023,
    genre: 'Соревновательный шутер',
    blurb:
      'Классика на Source 2, в которую играю по-настоящему — так же, как и в Fortnite.',
    tags: ['shooter'],
    shape: 'landscape',
    image: 'cs2-shot.jpg',
    imageAlt: 'Кадр из Counter-Strike 2',
    href: 'https://store.steampowered.com/app/730/',
    linkLabel: 'Steam',
    hours: { value: 220, account: 'javierping' },
  },
  {
    id: 'garrys-mod',
    title: "Garry's Mod",
    year: 2006,
    genre: 'Песочница',
    blurb:
      'Моя самая любимая игра. Лучшее, во что я когда-либо играл — бесконечные режимы, моды и вечные вечеровки.',
    tags: ['sandbox'],
    shape: 'full',
    image: 'garrys-mod-shot.jpg',
    imageAlt: "Кадр из Garry's Mod",
    href: 'https://store.steampowered.com/app/4000/',
    linkLabel: 'Steam',
    hours: { value: 842, account: 'javierping' },
  },
];
