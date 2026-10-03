import ScrollReveal, { StaggerContainer, StaggerItem } from './ScrollReveal'
import { MessageSquare, Scan, Eye, FileCheck } from './Icons'
import './HowItWorks.css'

const steps = [
  { icon: MessageSquare, label: 'PASTE', desc: 'Drop in a suspicious message' },
  { icon: Scan, label: 'SCAN', desc: 'Automated signal extraction' },
  { icon: Eye, label: 'ANALYZE', desc: 'Threat pattern detection' },
  { icon: FileCheck, label: 'EXPLAIN', desc: 'Explainable risk assessment' },
]

export default function HowItWorks() {
  return (
    <section className="section how-it-works" id="how-it-works">
      <div className="container">
        <ScrollReveal>
          <div className="section-header">
            <p className="section-eyebrow">Workflow</p>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              From suspicious message to actionable threat assessment in seconds.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="how-it-works__grid">
          {steps.map((step, i) => (
            <StaggerItem key={step.label}>
              <div className="how-it-works__step glass-card">
                <div className="how-it-works__icon-wrap">
                  <step.icon size={28} />
                </div>
                <h3 className="how-it-works__label">{step.label}</h3>
                <p className="how-it-works__desc">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="how-it-works__arrow" aria-hidden="true">→</div>
              )}
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
