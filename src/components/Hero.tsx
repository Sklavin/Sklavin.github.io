import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { games } from '../data/games';
import { favorites } from '../data/site';
import { asset } from '../lib/asset';
import { useSteamLive, type LiveRecentGame } from '../lib/steamLive';
import { formatHours, relativeDay } from '../lib/time';
import { ArrowDown, ArrowUpRight, SteamMark } from './Icons';
import { RollingNumber } from './RollingNumber';

const ease = [0.22, 1, 0.36, 1] as const;

const covers: Record<number, string> = {
  4000: 'games/garrys-mod-shot.jpg',
  553850: 'games/helldivers-2-shot.jpg',
  1144200: 'games/ready-or-not-shot.jpg',
  1808500: 'games/arc-raiders-shot.jpg',
};

function LatestThumb({ game, reduce }: { game?: LiveRecentGame; reduce: boolean | null }) {
  const [step, setStep] = useState(0);
  const chain = [
    game?.appid != null ? covers[game.appid] : undefined,
    game?.header ?? undefined,
    game?.appid != null
      ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`
      : undefined,
  ].filter((src): src is string => Boolean(src));
  const raw = chain[step] ?? 'games/ready-or-not-shot.jpg';

  return (
    <motion.img
      src={raw.startsWith('games/') ? asset(raw) : raw}
      alt=""
      width={300}
      height={450}
      loading="lazy"
      decoding="async"
      onError={() => setStep((value) => value + 1)}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3, ease }}
    />
  );
}

const titleLines = ['Во что играю,', 'на чём играю', 'и что звучит на фоне.'];

const nicknames = ['javops', 'javierping'];

function NickRoller() {
  const reduce = useReducedMotion();
  const [up, setUp] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setUp((value) => !value), 3200);
    return () => window.clearInterval(id);
  }, []);

  const label = 'javops и javierping';

  if (reduce) {
    return (
      <span>
        <span className="sr-only">{label}</span>
        {nicknames.join(' / ')}
      </span>
    );
  }

  return (
    <span className="nick-roller" aria-hidden="true">
      <span className="sr-only">{label}</span>
      <motion.span
        className="nick-track"
        animate={{ y: up ? '-50%' : '0%' }}
        transition={{ duration: 0.6, ease }}
      >
        {nicknames.map((nick) => (
          <span className="nick-item" key={nick}>
            {nick}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function Hero() {
  const visualRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const live = useSteamLive();
  const arcLive = live?.profiles.javierping?.recent?.find((game) => game.appid === 1808500);
  const latest = [
    live?.profiles.javierping?.recent?.[0],
    live?.profiles.javops?.recent?.[0],
  ]
    .filter((game): game is NonNullable<typeof game> => Boolean(game))
    .sort((a, b) => (b.lastPlayedISO ?? '').localeCompare(a.lastPlayedISO ?? ''))[0];
  const latestWhen = latest?.lastPlayedISO
    ? relativeDay(latest.lastPlayedISO)
    : latest?.lastPlayed;
  const libraries = [live?.profiles.javops?.library, live?.profiles.javierping?.library].filter(
    (library): library is NonNullable<typeof library> => Boolean(library),
  );
  const liveHours = libraries.length
    ? libraries.reduce((sum, library) => sum + library.totalHours, 0)
    : null;
  const { scrollYProgress } = useScroll({
    target: visualRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-4%', '6%']);

  const stats = [
    { label: 'игр в подборке', value: String(games.length).padStart(2, '0') },
    { label: 'часов в Steam', value: liveHours ? formatHours(liveHours) : '2 791' },
    { label: 'Steam-профиля', value: '2' },
  ];

  return (
    <section className="hero" id="top">
      <div className="container hero-inner">
        <div className="hero-copy">
          <motion.p
            className="eyebrow"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          >
            <span className="eyebrow-dot" aria-hidden="true" />
            Владислав · Москва · <NickRoller />
          </motion.p>

          <motion.h1
            className="hero-title"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
          >
            {titleLines.map((line, index) => (
              <span className="hero-title-line" key={line}>
                {index === titleLines.length - 1 ? (
                  <>
                    и что звучит
                    <span className="hero-title-accent"> на фоне.</span>
                  </>
                ) : (
                  line
                )}
              </span>
            ))}
          </motion.h1>

          <motion.p
            className="hero-lead"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease }}
          >
            Просто личная страница — про тебя и про игры.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
          >
            <a className="btn btn-primary" href="#games">
              Смотреть игры
              <ArrowDown />
            </a>
            <a className="btn btn-ghost" href="#steam">
              <SteamMark />
              Steam-профили
            </a>
          </motion.div>
        </div>

        <div className="hero-visual" ref={visualRef}>
          <motion.figure
            className="hero-media"
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.12, ease }}
          >
            <motion.img
              src={asset('games/arc-raiders-shot.jpg')}
              alt="Кадр из ARC Raiders"
              width={1440}
              height={810}
              fetchPriority="high"
              style={reduce ? undefined : { y: imageY }}
            />
            <figcaption className="hero-media-caption">
              <span className="mono">ARC Raiders</span>
              <span>
                {arcLive ? (
                  <>
                    <RollingNumber value={formatHours(arcLive.hours)} /> ч в Steam ·{' '}
                    {relativeDay(arcLive.lastPlayedISO)}
                  </>
                ) : (
                  '54 ч в Steam'
                )}
              </span>
            </figcaption>
          </motion.figure>

          <motion.div
            className="hero-bottom"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.4, ease }}
          >
            <a className="hero-mini" href="#steam">
              
              <span className="hero-mini-thumb">
                <AnimatePresence initial={false} mode="popLayout">
                  <LatestThumb key={latest?.appid ?? 'latest'} game={latest} reduce={reduce} />
                </AnimatePresence>
              </span>
              <span className="hero-mini-copy">
                <span className="mono">Последний запуск</span>
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    className="hero-mini-swap"
                    key={latest?.appid ?? 'latest'}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <strong>{latest?.title ?? 'Ready or Not'}</strong>
                    <span className="hero-mini-meta">
                      {latest ? (
                        <>
                          {latestWhen ? `${latestWhen} · ` : ''}
                          <RollingNumber value={formatHours(latest.hours)} /> ч
                        </>
                      ) : (
                        '17 ноября · 46 ч'
                      )}
                    </span>
                  </motion.span>
                </AnimatePresence>
              </span>
              <ArrowUpRight className="hero-mini-arrow" />
            </a>

            <a className="hero-next" href="#games">
              <span className="mono">Любимые игры</span>
              <strong>{favorites.map((game) => game.title.replace('Call of Duty: ', '')).join(' · ')}</strong>
            </a>
          </motion.div>
        </div>
      </div>

      <div className="container">
        <div className="hero-stats">
          {stats.map((stat) => (
            <div className="hero-stat" key={stat.label}>
              <span className="hero-stat-value">
                <RollingNumber value={stat.value} />
              </span>
              <span className="hero-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
