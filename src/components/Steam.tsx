import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { steamData, steamProfiles, type AccountId } from '../data/steam';
import { asset } from '../lib/asset';
import { formatLiveTime, useSteamLive } from '../lib/steamLive';
import { formatHours } from '../lib/time';
import { ArrowUpRight } from './Icons';
import { Reveal } from './Reveal';
import { RollingNumber } from './RollingNumber';
import { SectionHead } from './SectionHead';

const ease = [0.22, 1, 0.36, 1] as const;
const accounts: AccountId[] = ['javierping', 'javops'];

const COD_APPIDS = new Set([1938090, 3595230, 3595270]);
const COD_APPID = 1938090;
const COD_TITLE = 'Call of Duty®';

function gamesWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'игра';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'игры';
  return 'игр';
}

function SlidingNick({ nick, dir }: { nick: string; dir: 1 | -1 }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{nick}</>;

  const from = dir === 1 ? '110%' : '-110%';
  const to = dir === 1 ? '-110%' : '110%';

  return (
    <span className="nick-slot">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          className="nick-slot-item"
          key={nick}
          initial={{ y: from, opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: to, opacity: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          {nick}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Steam() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<AccountId>('javierping');
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const live = useSteamLive();
  const fallback = steamData[active];
  const liveProfile = live?.profiles[active];

  const switchAccount = (id: AccountId) => {
    if (id === active) return;
    setSlideDir(accounts.indexOf(id) > accounts.indexOf(active) ? 1 : -1);
    setActive(id);
  };

  const top = useMemo(() => {
    const base = liveProfile?.library?.top?.length
      ? liveProfile.library.top
      : fallback.top;

    const rows = base.map((game) => ({ ...game }));
    const isCod = (game: { appid?: number; title: string }) =>
      game.appid != null ? COD_APPIDS.has(game.appid) : /modern warfare|call of duty/i.test(game.title);
    const codHours = rows.filter(isCod).reduce((sum, game) => sum + game.hours, 0);
    const rest = rows.filter((game) => !isCod(game));
    if (codHours > 0) rest.push({ appid: COD_APPID, title: COD_TITLE, hours: codHours });

    return rest
      .filter((game) => game.hours > 0)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8);
  }, [liveProfile, fallback]);
  const totalHours = liveProfile?.library?.totalHours ?? fallback.totalHours;
  const appsWithTime = liveProfile?.library?.appsWithTime ?? fallback.appsWithTime;
  const maxHours = Math.max(...top.map((game) => game.hours), 1);

  const stamp = formatLiveTime(live?.updatedAt);

  return (
    <section className="section steam" id="steam">
      <div className="container">
        <SectionHead
          index="04"
          title="Steam"
          lead="Два профиля и живые цифры."
          aside={
            <span className="live-stamp mono">
              <span className="live-dot" aria-hidden="true" />
              live{stamp ? ' · ' : ''}
              {stamp && <RollingNumber value={stamp} />}
            </span>
          }
        />

        <Reveal className="profile-duo-wrap" delay={0.04}>
          <article className="profile-duo">
            {steamProfiles.map((profile) => {
              const profileLive = live?.profiles[profile.id];
              const level = profileLive?.level ?? profile.level;
              const library = profileLive?.libraryCount ?? profile.libraryCount;
              const hours = profileLive?.library?.totalHours;
              const since = profileLive?.memberSince ?? profile.memberSince;

              return (
                <div className="duo-half" key={profile.id}>
                  <div className="profile-head">
                    <img
                      className="profile-avatar"
                      src={asset(profile.avatar)}
                      alt={`Аватар Steam ${profile.nickname}`}
                      width={184}
                      height={184}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="profile-id">
                      <h3 className="profile-name">{profile.nickname}</h3>
                      <p className="mono">
                        level <RollingNumber value={level} />
                        {library != null && (
                          <>
                            {' · '}
                            <RollingNumber value={library} /> {gamesWord(library)}
                          </>
                        )}{' '}
                        · с {since}
                      </p>
                    </div>
                  </div>

                  <p className="duo-hours">
                    {hours != null ? (
                      <RollingNumber
                        value={formatHours(hours)}
                        suffix={<span className="mono"> часов в Steam</span>}
                      />
                    ) : (
                      '—'
                    )}
                  </p>

                  <div className="profile-foot">
                    <span className="mono">
                      в библиотеке <RollingNumber value={library ?? '—'} /> игр
                    </span>
                    <a
                      className="profile-link"
                      href={profile.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Открыть профиль
                      <ArrowUpRight />
                    </a>
                  </div>
                </div>
              );
            })}
          </article>
        </Reveal>

        <div className="library">
          <Reveal className="library-chart">
            <div className="library-head">
              <div className="library-head-main">
                <h3 className="library-title">Топ по часам</h3>
                <div className="chart-switch" role="tablist" aria-label="Аккаунт Steam">
                  {accounts.map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={active === id}
                      className={`chart-tab ${active === id ? 'is-active' : ''}${
                        reduce ? '' : ' has-pill'
                      }`}
                      onClick={() => switchAccount(id)}
                    >
                      
                      <span className="chart-tab-label">{id}</span>
                      {active === id && !reduce && (
                        <motion.span
                          className="tab-pill"
                          layoutId="chart-tab-pill"
                          transition={{ duration: 0.3, ease }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <span className="mono">Steam</span>
            </div>

            
            <motion.div
              className="bars"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {top.map((game, i) => (
                  <motion.div
                    className="bar-row"
                    key={game.appid ?? game.title}
                    layout={reduce ? false : true}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <RollingNumber
                      value={String(i + 1).padStart(2, '0')}
                      className="bar-index mono"
                    />
                    <span className="bar-name">{game.title}</span>
                    <span className="bar-track">
                      <motion.span
                        className="bar-fill"
                        initial={reduce ? false : { scaleX: 0, width: `${(game.hours / maxHours) * 100}%` }}
                        animate={{ scaleX: 1, width: `${(game.hours / maxHours) * 100}%` }}
                        transition={{
                          scaleX: { duration: 0.55, delay: 0.04 * i, ease },
                          width: { duration: 0.45, ease },
                        }}
                      />
                    </span>
                    <span className="bar-value mono">
                      <RollingNumber value={formatHours(game.hours)} />
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <div className="library-summary">
              <div>
                <span className="mono">Суммарно</span>
                <strong>
                  <RollingNumber value={formatHours(totalHours)} suffix=" ч" />
                </strong>
                <span>
                  по <RollingNumber value={appsWithTime} /> приложениям
                </span>
              </div>
              <div>
                <span className="mono">Профиль</span>
                <strong className="profile-nick">
                  <SlidingNick nick={active} dir={slideDir} />
                </strong>
                <span>
                  <RollingNumber
                    value={
                      liveProfile?.libraryCount ??
                      steamProfiles.find((p) => p.id === active)?.libraryCount ??
                      '—'
                    }
                  />{' '}
                  игр в библиотеке
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
