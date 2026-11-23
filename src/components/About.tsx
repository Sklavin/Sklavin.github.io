import { favorites, interests } from '../data/site';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

export function About() {
  return (
    <section className="section about" id="about">
      <div className="container">
        <SectionHead index="01" title="Обо мне" lead="Коротко: кто я и что здесь собрано." />

        <div className="about-grid">
          <Reveal className="about-statement">
            <p>
              Меня зовут Владислав. В Steam меня можно найти как{' '}
              <span className="text-accent">javops</span> и{' '}
              <span className="text-accent">javierping</span> — два профиля, одна привычка
              возвращаться к любимым жанрам.
            </p>
            <p className="about-muted">
              Две любимые игры — {favorites[0].title} и {favorites[1].title}. Сайт я сделал вместе
              с нейросетью: я не профессиональный разработчик, а глупый вайбкодер.
            </p>
            <p className="about-muted">
              С нейросетями люблю экспериментировать: ставлю локальные модели, слежу за новинками и
              проверяю идеи на практике. И честно благодарен им за возможность делать такие вещи.
            </p>
          </Reveal>
        </div>

        <div className="interests">
          {interests.map((item, i) => (
            <Reveal key={item.index} className="interest" delay={0.05 * i}>
              <span className="interest-index mono">{item.index}</span>
              <h3 className="interest-title">{item.title}</h3>
              <p className="interest-text">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
