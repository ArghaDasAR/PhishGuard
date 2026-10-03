import ScrollReveal, { StaggerContainer, StaggerItem } from './ScrollReveal'
import { Link as LinkIcon, Brain, UserX } from './Icons'
import './DetectionLayers.css'

const layers = [
  {
    icon: LinkIcon,
    title: 'Link Intelligence',
    desc: 'Extracts and inspects every URL. Detects suspicious TLDs, typosquatting, and domain age anomalies.',
    signals: ['Domain analysis', 'Typosquatting detection', 'TLD reputation'],
  },
  {
    icon: Brain,
    title: 'Social Engineering',
    desc: 'Identifies psychological pressure tactics including urgency, fear, authority exploitation, and emotional manipulation.',
    signals: ['Urgency detection', 'Fear indicators', 'Authority patterns'],
  },
  {
    icon: UserX,
    title: 'Impersonation Detection',
    desc: 'Recognizes brand mimicry, lookalike domains, and communication patterns that mimic trusted organizations.',
    signals: ['Brand matching', 'Sender verification', 'Format analysis'],
  },
]

export default function DetectionLayers() {
  return (
    <section className="section detection-layers">
      <div className="container">
        <ScrollReveal>
          <div className="section-header">
            <p className="section-eyebrow">Detection</p>
            <h2 className="section-title">Detection Layers</h2>
            <p className="section-subtitle">
              Multi-layered analysis that goes beyond simple URL checking.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="detection-layers__grid">
          {layers.map((layer) => (
            <StaggerItem key={layer.title}>
              <div className="detection-layers__card glass-card">
                <div className="detection-layers__icon-wrap">
                  <layer.icon size={24} />
                </div>
                <h3 className="detection-layers__title">{layer.title}</h3>
                <p className="detection-layers__desc">{layer.desc}</p>
                <div className="detection-layers__signals">
                  {layer.signals.map(s => (
                    <span key={s} className="detection-layers__signal">{s}</span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
