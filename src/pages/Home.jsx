import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import DetectionLayers from '../components/DetectionLayers'
import DemoSection from '../components/DemoSection'
import Resources from '../components/Resources'
import ScrollReveal from '../components/ScrollReveal'
import { ArrowRight, Zap, Eye, Feather, Users } from '../components/Icons'
import './Home.css'

const whyItems = [
  { icon: Zap, title: 'Fast', desc: 'Instant client-side analysis. No data leaves your browser.' },
  { icon: Eye, title: 'Explainable', desc: 'Every signal and score contribution is transparent and human-readable.' },
  { icon: Feather, title: 'Lightweight', desc: 'No heavy dependencies. Runs on any device, any connection.' },
  { icon: Users, title: 'Human-in-the-Loop', desc: 'PhishGuard advises. You decide. We never auto-block or hide content.' },
]

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <DetectionLayers />
      <DemoSection />

      {/* Why PhishGuard */}
      <section className="section why-section">
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <p className="section-eyebrow">Why PhishGuard</p>
              <h2 className="section-title">Built Different</h2>
              <p className="section-subtitle">
                Not another black-box scanner. PhishGuard prioritizes explainability and user agency.
              </p>
            </div>
          </ScrollReveal>
          <div className="why-section__grid">
            {whyItems.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.08}>
                <div className="why-section__card">
                  <div className="why-section__icon-wrap">
                    <item.icon size={22} />
                  </div>
                  <h3 className="why-section__card-title">{item.title}</h3>
                  <p className="why-section__card-desc">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Resources />

      {/* Final CTA */}
      <section className="section final-cta">
        <div className="container">
          <ScrollReveal>
            <div className="final-cta__inner glass-card">
              <h2 className="final-cta__title">Ready to check a suspicious message?</h2>
              <p className="final-cta__desc">
                Paste any email, SMS, or social message and get an instant, explainable threat assessment.
              </p>
              <Link to="/analyzer" className="btn btn-primary final-cta__btn">
                Open Analyzer <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
