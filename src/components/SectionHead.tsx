import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type SectionHeadProps = {
  index: string;
  title: string;
  lead?: string;
  aside?: ReactNode;
};

export function SectionHead({ index, title, lead, aside }: SectionHeadProps) {
  return (
    <Reveal className="section-head">
      <span className="section-index mono">{index}</span>
      <div className="section-head-main">
        <h2 className="section-title">{title}</h2>
        {(lead || aside) && (
          <div className="section-head-bottom">
            {lead && <p className="section-lead">{lead}</p>}
            {aside}
          </div>
        )}
      </div>
    </Reveal>
  );
}
