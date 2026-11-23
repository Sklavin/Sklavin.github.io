import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type MouseEvent, type RefObject } from 'react';
import { gameFilters, games, type Game, type GameTag } from '../data/games';
import { steamAppId } from '../lib/appid';
import { asset } from '../lib/asset';
import { initials } from '../lib/initials';
import { useSteamLive, type SteamLive } from '../lib/steamLive';
import { formatHours } from '../lib/time';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Close, EpicMark, SteamMark } from './Icons';
import { Reveal } from './Reveal';
import { RollingNumber } from './RollingNumber';
import { SectionHead } from './SectionHead';

const ease = [0.22, 1, 0.36, 1] as const;

const PHONE_BREAKPOINT = '(max-width: 720px)';
const PHONE_PREVIEW = 4;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function hoursFor(game: Game, live: SteamLive | null): number | null {
  const config = game.hours;
  if (!config) return null;

  const groups = [{ account: config.account, appids: config.appids }, ...(config.extra ?? [])];
  const appids = new Set<number>();

  for (const group of groups) {
    const ids = group.appids?.length ? group.appids : [steamAppId(game.href)];
    for (const id of ids) {
      if (id != null) appids.add(id);
    }
  }

  const hrefId = steamAppId(game.href);
  if (hrefId != null) appids.add(hrefId);

  let total = 0;
  let found = false;

  for (const account of ['javops', 'javierping'] as const) {
    const byApp = live?.profiles[account]?.library?.hoursByAppId;
    if (!byApp) continue;
    for (const appid of appids) {
      const value = byApp[String(appid)];
      if (value != null) {
        total += value;
        found = true;
      }
    }
  }

  return found ? Math.round(total * 10) / 10 : config.value;
}

export function Games() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<GameTag | 'all'>('all');
  const [active, setActive] = useState<Game | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const opener = useRef<HTMLButtonElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const isPhone = useMediaQuery(PHONE_BREAKPOINT);
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const close = useCallback(() => setActive(null), []);
  const live = useSteamLive();
  const list = filter === 'all' ? games : games.filter((game) => game.tags.includes(filter));
  const visible = isPhone && !expanded ? list.slice(0, PHONE_PREVIEW) : list;
  const canToggle = isPhone && list.length > PHONE_PREVIEW;

  useEffect(() => {
    if (revealed) return;
    const grid = gridRef.current;
    if (!grid) return;

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setRevealed(true);
    };

    if (typeof IntersectionObserver === 'undefined') {
      show();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) show();
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(grid);

    const fallback = window.setTimeout(show, 6000);

    return () => {
      window.clearTimeout(fallback);
      io.disconnect();
    };
  }, [revealed]);

  const navigate = useCallback(
    (step: 1 | -1) => {
      setDir(step);
      setActive((current) => {
        if (!current || list.length < 2) return current;
        const i = list.findIndex((game) => game.id === current.id);
        if (i === -1) return list[0];
        return list[(i + step + list.length) % list.length];
      });
    },
    [list],
  );

  return (
    <section className="section games" id="games">
      <div className="container">
        <SectionHead
          index="02"
          title="Игры"
          lead="Мой вкус: тактика, большие миры, кооператив и немного хаоса."
          aside={
            <span className="count-label mono" aria-live="polite">
              <RollingNumber
                value={String(list.length).padStart(2, '0')}
                suffix={` / ${String(games.length).padStart(2, '0')}`}
              />
            </span>
          }
        />

        <Reveal className="filters-row" delay={0.05}>
          <div className="filters" role="group" aria-label="Фильтр по жанрам">
            {gameFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`filter ${filter === item.id ? 'is-active' : ''}${
                  reduce ? '' : ' has-pill'
                }`}
                onClick={() => {
                  setFilter(item.id);
                  setExpanded(false);
                }}
                aria-pressed={filter === item.id}
              >
                
                <span className="filter-label">{item.label}</span>
                {filter === item.id && !reduce && (
                  <motion.span
                    className="filter-pill"
                    layoutId="filter-pill"
                    transition={{ duration: 0.3, ease }}
                  />
                )}
              </button>
            ))}
          </div>
        </Reveal>

        <div ref={gridRef} className={`games-grid${filter === 'all' ? '' : ' is-flat'}`}>
          
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((game, position) => (
              <GameCard
                key={`${filter}:${game.id}`}
                game={game}
                hours={hoursFor(game, live)}
                index={games.findIndex((g) => g.id === game.id)}
                position={position}
                revealed={revealed}
                onOpen={(event) => {
                  opener.current = event.currentTarget;
                  setActive(game);
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence initial={false}>
          {canToggle && (
            <motion.div
              key="games-more"
              className="games-more"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <button
                className="games-toggle"
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
              >
                <span className="games-toggle-label">{expanded ? 'Свернуть' : 'Показать все'}</span>
                <motion.span
                  className="games-toggle-icon"
                  aria-hidden="true"
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <ArrowDown />
                </motion.span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GameDialog
        game={active}
        live={live}
        list={list}
        dir={dir}
        onNavigate={navigate}
        onClose={close}
        returnFocus={opener}
      />
    </section>
  );
}

type CardProps = {
  game: Game;
  hours: number | null;
  index: number;
  position: number;
  revealed: boolean;
  onOpen: (event: MouseEvent<HTMLButtonElement>) => void;
};

function GameMedia({ game, eager = false }: { game: Game; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const wide = game.shape !== 'poster';

  if (failed) {
    return (
      <span className="game-fallback" role="img" aria-label={game.imageAlt}>
        <span className="game-fallback-mark" aria-hidden="true">
          {initials(game.title)}
        </span>
        <span className="game-fallback-meta" aria-hidden="true">
          {game.genre}
        </span>
      </span>
    );
  }

  return (
    <img
      className={loaded ? 'is-loaded' : undefined}
      src={asset(`games/${game.image}`)}
      alt={game.imageAlt}
      width={wide ? 1440 : 300}
      height={wide ? 810 : 450}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      ref={(el) => {
        if (el?.complete) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
}

function GameCard({ game, hours, index, position, revealed, onOpen }: CardProps) {
  const reduce = useReducedMotion();

  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y: 16 };
  const shown = reduce ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.article
      className={`game-card game-card--${game.shape}`}
      initial={hidden}
      animate={
        revealed
          ? {
              ...shown,
              transition: { duration: 0.45, ease, delay: Math.min(position, 10) * 0.04 },
            }
          : hidden
      }
      exit={
        reduce
          ? { opacity: 0, transition: { duration: 0.25 } }
          : { opacity: 0, y: 14, scale: 0.97, transition: { duration: 0.3, ease } }
      }
    >
      <GameMedia game={game} />
      <span className="game-shade" aria-hidden="true" />

      <button className="game-open" type="button" onClick={onOpen}>
        <span className="sr-only">Подробнее: {game.title}</span>
      </button>

      <span className="game-index mono">{String(index + 1).padStart(2, '0')}</span>

      <a
        className="game-link"
        href={game.href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`${game.title} — ${game.linkLabel}`}
        title={game.linkLabel}
      >
        {game.linkLabel === 'Epic Games' ? (
          <EpicMark />
        ) : game.linkLabel === 'Steam' ? (
          <SteamMark />
        ) : (
          <ArrowUpRight />
        )}
      </a>

      <div className="game-info">
        <p className="game-meta mono">
          {game.genre} · {game.year}
          {hours != null && <span className="game-hours"> · {formatHours(hours)} ч</span>}
        </p>
        <h3 className="game-title">{game.title}</h3>
        {(game.shape === 'feature' || game.shape === 'full') && (
          <p className="game-blurb">{game.blurb}</p>
        )}
        <span className="game-cta">
          Подробнее <span aria-hidden="true">→</span>
        </span>
      </div>
    </motion.article>
  );
}

type DialogProps = {
  game: Game | null;
  live: SteamLive | null;
  list: Game[];
  dir: 1 | -1;
  onNavigate: (step: 1 | -1) => void;
  onClose: () => void;
  returnFocus: RefObject<HTMLButtonElement | null>;
};

function GameDialog({ game, live, list, dir, onNavigate, onClose, returnFocus }: DialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const hours = game ? hoursFor(game, live) : null;
  const reduce = useReducedMotion();
  const activeIndex = game ? list.findIndex((item) => item.id === game.id) : -1;

  useEffect(() => {
    if (!game) return;
    const previous = document.activeElement as HTMLElement | null;
    const trigger = returnFocus.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft') {
        onNavigate(-1);
        return;
      }
      if (event.key === 'ArrowRight') {
        onNavigate(1);
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      (trigger ?? previous)?.focus?.();
    };
  }, [game, onClose, onNavigate, returnFocus]);

  const slideX = reduce ? 0 : 36 * dir;

  return (
    <AnimatePresence>
      {game && (
        <motion.div
          className="dialog-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.55, ease }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dialog-controls">
              {activeIndex >= 0 && list.length > 1 && (
                <span className="dialog-count mono">
                  <RollingNumber
                    value={String(activeIndex + 1).padStart(2, '0')}
                    suffix={` / ${String(list.length).padStart(2, '0')}`}
                  />
                </span>
              )}
              <button
                className="dialog-arrow"
                type="button"
                onClick={() => onNavigate(-1)}
                disabled={list.length < 2}
                aria-label="Предыдущая игра"
                title="Предыдущая игра (←)"
              >
                <ArrowLeft />
              </button>
              <button
                className="dialog-arrow"
                type="button"
                onClick={() => onNavigate(1)}
                disabled={list.length < 2}
                aria-label="Следующая игра"
                title="Следующая игра (→)"
              >
                <ArrowRight />
              </button>
              <button
                ref={closeRef}
                className="dialog-close"
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
              >
                <Close />
              </button>
            </div>

            
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={game.id}
                className="dialog-slide"
                data-shape={game.shape}
                initial={{ opacity: 0, x: slideX }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -slideX }}
                transition={{ duration: 0.32, ease }}
              >
                <div className="dialog-media">
                  <GameMedia game={game} eager />
                </div>

                <div className="dialog-body">
                  <p className="dialog-meta mono">
                    {game.genre} · {game.year}
                    {hours != null && ` · ${formatHours(hours)} ч в Steam`}
                  </p>
                  <h3 id="dialog-title" className="dialog-title">
                    {game.title}
                  </h3>
                  <p className="dialog-text">{game.blurb}</p>
                  {game.hoursNote && <p className="dialog-hours-note mono">{game.hoursNote}</p>}
                  <div className="dialog-tags">
                    {game.tags.map((tag) => {
                      const label = gameFilters.find((f) => f.id === tag)?.label ?? tag;
                      return (
                        <span className="tag" key={tag}>
                          {label}
                        </span>
                      );
                    })}
                  </div>
                  <div className="dialog-actions">
                    <a
                      className="btn btn-primary"
                      href={game.href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {game.linkLabel === 'Steam' ? (
                        <SteamMark />
                      ) : game.linkLabel === 'Epic Games' ? (
                        <EpicMark />
                      ) : (
                        <ArrowUpRight />
                      )}
                      Открыть {game.linkLabel}
                    </a>
                    <button className="btn btn-ghost" type="button" onClick={onClose}>
                      Закрыть
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
