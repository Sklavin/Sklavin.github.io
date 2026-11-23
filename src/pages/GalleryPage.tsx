import { Footer } from '../components/Footer';
import { GalleryGrid } from '../components/GalleryGrid';
import { Header } from '../components/Header';
import { PageScrollbar } from '../components/PageScrollbar';
import { gallery } from '../data/gallery';

function photosWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'снимок';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'снимка';
  return 'снимков';
}

export function GalleryPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержанию
      </a>
      <Header page="gallery" />
      <main id="main" tabIndex={-1}>
        <section className="gallery-page" id="gallery">
          <div className="container">
            <header className="gallery-head">
              <div className="gallery-head-top">
                <div>
                  <span className="mono gallery-kicker">
                    Фото · {gallery.length} {photosWord(gallery.length)}
                  </span>
                  <h1 className="gallery-title">Галерея</h1>
                </div>
                <a className="gallery-back mono" href="./index.html">
                  ← На главную
                </a>
              </div>
              <p className="gallery-lead">
                Личные снимки. Открываются по клику, листаются стрелками и клавишами ← →.
              </p>
            </header>

            <GalleryGrid />
          </div>
        </section>
      </main>
      <Footer page="gallery" />
      <PageScrollbar />
    </>
  );
}
