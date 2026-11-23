import { projects } from '../data/site';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

export function Projects() {
  return (
    <section className="section projects" id="projects">
      <div className="container">
        <SectionHead
          index="05"
          title="Проекты и технологии"
          lead="Спокойная часть страницы. Одна закрытая история и несколько вещей, которые мне интересно трогать руками."
        />

        <div className="projects-grid">
          <Reveal>
            <article className="eduos is-closed">
              <div className="eduos-top">
                <span className="mono">{projects.eduos.status}</span>
                <span className="mono eduos-stack">{projects.eduos.stack}</span>
              </div>
              <div>
                <h3 className="eduos-title">
                  {projects.eduos.name}
                  <span className="eduos-dot" aria-hidden="true" />
                </h3>
                <p className="eduos-text">{projects.eduos.description}</p>
              </div>
            </article>
          </Reveal>

          <Reveal className="projects-side" delay={0.1}>
            <h3 className="projects-subtitle">Чем ещё интересуюсь</h3>
            <ul className="projects-list">
              {projects.interests.map((item, i) => (
                <li key={item}>
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="projects-note">
              Я не специалист с большим опытом: это хобби, в котором интересно разбираться
              постепенно. Сайт, который вы читаете, собран вместе с нейросетью — и я этого не
              скрываю.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
