import { musicPlaylist } from '../data/site';
import { ArrowUpRight, Headphones } from './Icons';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

const bars = [38, 62, 28, 74, 48, 88, 34, 56, 70, 42, 80, 30, 58, 44];

export function Music() {
  return (
    <section className="section music" id="music">
      <div className="container">
        <SectionHead
          index="06"
          title="Музыка"
          lead="Фон для долгих вечеров за играми, сборками и кодом."
        />

        <Reveal>
          <div className="music-panel">
            <div className="music-copy">
              <span className="mono">Яндекс Музыка · плейлист</span>
              <h3 className="music-title">Один плейлист на все случаи</h3>
              <p className="music-text">
                Один плейлист на всё: игры, сборки, ночные эксперименты с очередной программой.
                Открыт по ссылке — включайте.
              </p>
              <a
                className="btn btn-primary"
                href={musicPlaylist}
                target="_blank"
                rel="noreferrer noopener"
              >
                Открыть плейлист
                <ArrowUpRight />
              </a>
            </div>

            <div className="music-visual" aria-hidden="true">
              <div className="eq">
                {bars.map((height, i) => (
                  <span key={i} style={{ height: `${height}%`, animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
              <div className="music-badge">
                <Headphones />
                <span className="mono">yandex · playlist</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
