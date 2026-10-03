import ScrollReveal, { StaggerContainer, StaggerItem } from '../components/ScrollReveal'
import { Layers, Cpu, Database, Globe, Brain, Shield, Activity, Server } from '../components/Icons'
import './ArchitecturePage.css'

const layers = [
  {
    icon: Globe,
    title: 'Input Layer',
    desc: 'Accepts raw text from any communication channel — email, SMS, social media, or messaging platforms.',
    details: ['Multi-format text parser', 'URL extraction engine', 'Encoding normalization'],
  },
  {
    icon: Cpu,
    title: 'Analysis Engine',
    desc: 'Multi-pass processing pipeline that evaluates the message against threat intelligence patterns.',
    details: ['Regex-based pattern matching', 'Heuristic scoring model', 'Configurable detection rules'],
  },
  {
    icon: Brain,
    title: 'Signal Extraction',
    desc: 'Identifies and categorizes individual threat signals with severity assessment.',
    details: ['Link Intelligence', 'Impersonation Detection', 'Social Engineering Patterns', 'Urgency & Pressure Analysis'],
  },
  {
    icon: Activity,
    title: 'Risk Scoring',
    desc: 'Aggregates signal weights into a normalized 0–100 threat score with explainable breakdown.',
    details: ['Weighted signal aggregation', 'Category-based scoring', 'Risk level classification'],
  },
  {
    icon: Shield,
    title: 'Explanation Engine',
    desc: 'Generates human-readable explanations of why the message was flagged and what to watch for.',
    details: ['Natural language generation', 'Signal-to-explanation mapping', 'Actionable recommendations'],
  },
]

const principles = [
  { icon: Layers, title: 'Client-Side Only', desc: 'All analysis runs in the browser. No message data is ever transmitted to external servers.' },
  { icon: Server, title: 'Zero Dependencies', desc: 'No backend servers, APIs, or third-party services required. Works offline after initial load.' },
  { icon: Database, title: 'No Data Storage', desc: 'PhishGuard does not store, log, or persist any analyzed messages. Each session is ephemeral.' },
]

export default function ArchitecturePage() {
  return (
    <main className="arch-page">
      <div className="container">
        <ScrollReveal>
          <div className="arch-page__header">
            <p className="section-eyebrow">Architecture</p>
            <h1 className="section-title">System Architecture</h1>
            <p className="section-subtitle">
              A transparent look at how PhishGuard processes and analyzes messages.
            </p>
          </div>
        </ScrollReveal>

        {/* Processing pipeline */}
        <section className="arch-page__section">
          <ScrollReveal>
            <h2 className="arch-page__section-title">Processing Pipeline</h2>
          </ScrollReveal>
          <div className="arch-page__pipeline">
            {layers.map((layer, i) => (
              <ScrollReveal key={layer.title} delay={i * 0.08}>
                <div className="arch-page__pipeline-step glass-card">
                  <div className="arch-page__step-header">
                    <div className="arch-page__step-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="arch-page__step-icon-wrap">
                      <layer.icon size={22} />
                    </div>
                    <h3 className="arch-page__step-title">{layer.title}</h3>
                  </div>
                  <p className="arch-page__step-desc">{layer.desc}</p>
                  <ul className="arch-page__step-details">
                    {layer.details.map(d => (
                      <li key={d} className="arch-page__step-detail">{d}</li>
                    ))}
                  </ul>
                  {i < layers.length - 1 && (
                    <div className="arch-page__step-connector" aria-hidden="true">↓</div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Security principles */}
        <section className="arch-page__section">
          <ScrollReveal>
            <h2 className="arch-page__section-title">Security & Privacy</h2>
          </ScrollReveal>
          <StaggerContainer className="arch-page__principles">
            {principles.map(p => (
              <StaggerItem key={p.title}>
                <div className="arch-page__principle-card glass-card">
                  <div className="arch-page__principle-icon">
                    <p.icon size={24} />
                  </div>
                  <h3 className="arch-page__principle-title">{p.title}</h3>
                  <p className="arch-page__principle-desc">{p.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </div>
    </main>
  )
}
