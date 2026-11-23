import { nav, navHref, social } from '../data/site';
import { ArrowUpRight, SteamMark } from './Icons';

export function Footer({ page = 'home' }: { page?: 'home' | 'gallery' }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a
              className="footer-logo"
              href={page === 'home' ? '#top' : './index.html'}
              aria-label="javops — наверх"
            >
              javops<span aria-hidden="true">.</span>
            </a>
          </div>

          <nav className="footer-col" aria-label="Разделы">
            <span className="mono">Разделы</span>
            {nav.map((item) => (
              <a key={item.id} href={navHref(item, page)}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="footer-col">
            <span className="mono">Steam</span>
            <a href={social.steamJavops} target="_blank" rel="noreferrer noopener">
              <SteamMark />
              javops
              <ArrowUpRight />
            </a>
            <a href={social.steamJavierping} target="_blank" rel="noreferrer noopener">
              <SteamMark />
              javierping
              <ArrowUpRight />
            </a>
          </div>

          <div className="footer-col">
            <span className="mono">Ещё</span>
            <a href={social.yandexMusic} target="_blank" rel="noreferrer noopener">
              Яндекс Музыка
              <ArrowUpRight />
            </a>
            <a href={page === 'home' ? '#about' : './index.html#about'}>Обо мне</a>
            <a href={page === 'home' ? '#top' : './index.html'}>Наверх ↑</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="mono">© 2026 Владислав · javops / javierping</span>
          <span className="mono">React · TypeScript · Vite</span>
        </div>
      </div>
    </footer>
  );
}
