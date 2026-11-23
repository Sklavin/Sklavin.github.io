import { hardware } from '../data/site';
import { CpuIcon, DriveIcon, GpuIcon, RamIcon } from './Icons';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

const icons = {
  gpu: GpuIcon,
  ram: RamIcon,
  cpu: CpuIcon,
  drive: DriveIcon,
};

export function Pc() {
  return (
    <section className="section pc" id="pc">
      <div className="container">
        <SectionHead
          index="03"
          title="Мой ПК"
          lead="Крутой комп, тянет все во что хочу играть."
          aside={<span className="mono pc-aside">build / 2026</span>}
        />

        <div className="pc-grid">
          {hardware.map((item, i) => {
            const Icon = icons[item.icon];
            return (
              <Reveal key={item.id} delay={0.06 * i}>
                <article className="hw-card">
                  <div className="hw-top">
                    <Icon className="hw-icon" />
                    <span className="mono hw-label">{item.label}</span>
                  </div>
                  <div className="hw-bottom">
                    <h3 className="hw-value">{item.value}</h3>
                    <p className="hw-detail">{item.detail}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
