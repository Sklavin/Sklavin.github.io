import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { nav, navHref, social } from '../data/site';
import { ArrowUpRight, Close, Menu, Moon, Sun } from './Icons';

function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  );
  const [manual, setManual] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored !== 'light' && stored !== 'dark') return false;
      const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      return stored !== (systemLight ? 'light' : 'dark');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      if (manual) localStorage.setItem('theme', theme);
      else localStorage.removeItem('theme');
    } catch {}
  }, [theme, manual]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: light)');
    const follow = (event: MediaQueryListEvent) => {
      if (!manual) setTheme(event.matches ? 'light' : 'dark');
    };
    query.addEventListener('change', follow);
    return () => query.removeEventListener('change', follow);
  }, [manual]);

  return {
    theme,
    toggle: () => {
      const apply = () => {
        setManual(true);
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
      };
      const doc = document as Document & {
        startViewTransition?: (callback: () => void) => unknown;
      };
      if (doc.startViewTransition) doc.startViewTransition(() => flushSync(apply));
      else apply();
    },
  };
}

export function Header({ page = 'home' }: { page?: 'home' | 'gallery' }) {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(page === 'gallery' ? 'gallery' : 'games');
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = nav
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <motion.div
          className="scroll-progress"
          style={reduce ? undefined : { scaleX: progress }}
          aria-hidden="true"
        />
        <div className="container header-inner">
          <a
            className="brand"
            href={page === 'home' ? '#top' : './index.html'}
            aria-label="javops — на главную"
          >
            <span className="brand-mark" aria-hidden="true" />
            javops
          </a>

          <nav className="header-nav" aria-label="Разделы сайта">
            {nav.map((item) => (
              <a
                key={item.id}
                href={navHref(item, page)}
                className={`nav-link ${active === item.id ? 'is-active' : ''}`}
                aria-current={active === item.id ? 'location' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            >
              
              <span className="theme-icon-slot">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={theme}
                    className="theme-icon"
                    initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {theme === 'dark' ? <Sun /> : <Moon />}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
            <button
              type="button"
              className="icon-btn menu-btn"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <nav aria-label="Мобильное меню">
              {nav.map((item, i) => (
                <motion.a
                  key={item.id}
                  href={navHref(item, page)}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                >
                  <span className="mobile-menu-index">0{i + 1}</span>
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <div className="mobile-menu-footer">
              <a href={social.steamJavops} target="_blank" rel="noreferrer noopener">
                javops <ArrowUpRight />
              </a>
              <a href={social.steamJavierping} target="_blank" rel="noreferrer noopener">
                javierping <ArrowUpRight />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
