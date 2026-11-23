export const site = {
  name: 'Владислав',
  nicknames: ['javops', 'javierping'],
  location: 'Москва',
  url: 'https://javops.github.io',
  title: 'javops — игры, железо и Steam',
  description:
    'Личная страница Владислава: игры, железо и два Steam-профиля. Warzone и Garry’s Mod — две любимые игры.',
  email: '',
};

export type NavItem = {
  id: string;
  label: string;
  href?: string;
};

export const nav: NavItem[] = [
  { id: 'gallery', label: 'Галерея', href: 'gallery.html' },
  { id: 'games', label: 'Игры' },
  { id: 'pc', label: 'ПК' },
  { id: 'steam', label: 'Steam' },
  { id: 'projects', label: 'Проекты' },
  { id: 'music', label: 'Музыка' },
];

export function navHref(item: NavItem, page: 'home' | 'gallery') {
  if (item.href) return item.href;
  return page === 'home' ? `#${item.id}` : `./index.html#${item.id}`;
}

export const favorites = [{ title: 'Call of Duty: Warzone' }, { title: "Garry's Mod" }];

export type HardwareIcon = 'gpu' | 'ram' | 'cpu' | 'drive';

export type HardwareItem = {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: HardwareIcon;
};

export const hardware: HardwareItem[] = [
  {
    id: 'cpu',
    label: 'Процессор',
    value: 'Ryzen 7 5800X',
    detail: 'AMD · 8 ядер / 16 потоков · 3.8 GHz',
    icon: 'cpu',
  },
  {
    id: 'gpu',
    label: 'Видеокарта',
    value: 'RX 6900 XT',
    detail: 'AMD Radeon · 16 GB GDDR6',
    icon: 'gpu',
  },
  {
    id: 'ram',
    label: 'Оперативная память',
    value: '32 GB',
    detail: 'DDR4 · 4×8 GB · 2667 MT/s',
    icon: 'ram',
  },
  {
    id: 'storage',
    label: 'Накопители',
    value: '≈1.2 TB',
    detail: '250 GB NVMe + 1 TB SSD',
    icon: 'drive',
  },
];

export const interests = [
  {
    index: '01',
    title: 'Игры',
    text: 'Люблю тактические шутеры, исследовать большие открытые миры и играть с друзьями.',
  },
  {
    index: '02',
    title: 'Железо',
    text: 'Интересуюсь ПК, комплектующими и сборками. Люблю разбираться, что стоит за производительностью и почему железо ведёт себя по-разному в играх.',
  },
  {
    index: '03',
    title: 'Нейросети',
    text: 'Постоянно пробую что-то новое: запускаю локальные модели, тестирую разные инструменты и смотрю, на что способны современные нейросети.',
  },
];

export const projects = {
  eduos: {
    name: 'EduOS',
    stack: 'Rust',
    status: 'Остановлен',
    description:
      'Хотел написать своё ядро на Rust, но всё упёрлось в драйверы и отрисовку интерфейса. Это оказалось сильно труднее, чем я думал.',
  },
  interests: [
    'Компьютерное железо и сборки',
    'Windows и Linux',
    'Сайты и интерфейсы вместе с нейросетями',
    'Небольшие проекты на Rust',
    'Музыка и плейлисты',
  ],
};

export const musicPlaylist =
  'https://music.yandex.ru/playlists/lk.97e9aab2-9086-4295-ba55-8b8070ae77ea';

export const social = {
  steamJavops: 'https://steamcommunity.com/id/javops/',
  steamJavierping: 'https://steamcommunity.com/id/javierping/',
  yandexMusic: musicPlaylist,
};
