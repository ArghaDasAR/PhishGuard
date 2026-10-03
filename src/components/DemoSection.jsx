import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { demoMessages } from '../data/demoMessages'
import RiskGauge from './RiskGauge'
import { ArrowRight, AlertTriangle } from './Icons'
import ScrollReveal from './ScrollReveal'
import './DemoSection.css'

export default function DemoSection() {
  const [selected, setSelected] = useState(0)
  const demo = demoMessages[selected]

  return (
    <section className="section demo-section">
      <div className="container">
        <ScrollReveal>
          <div className="section-header">
            <p className="section-eyebrow">Live Preview</p>
            <h2 className="section-title">See It in Action</h2>
            <p className="section-subtitle">
              Explore how PhishGuard analyzes different types of suspicious messages.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="scaleIn">
          <div className="demo-section__tabs">
            {demoMessages.map((msg, i) => (
              <button
                key={msg.id}
                className={`demo-section__tab ${i === selected ? 'demo-section__tab--active' : ''}`}
                onClick={() => setSelected(i)}
              >
                {msg.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" delay={0.1}>
          <div className="demo-section__content glass-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={demo.id}
                className="demo-section__inner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="demo-section__message-col">
                  <div className="demo-section__msg-header">
                    <AlertTriangle size={16} />
                    <span>{demo.category} — {demo.label}</span>
                  </div>
                  <pre className="demo-section__msg-body">{demo.text}</pre>
                  {demo.badges.length > 0 && (
                    <div className="demo-section__badges">
                      {demo.badges.map(b => (
                        <span key={b} className="badge badge-high">{b}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="demo-section__result-col">
                  <RiskGauge score={demo.expectedScore} size={160} />
                  <p className="demo-section__explanation">{demo.explanation}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="demo-section__cta-wrap">
              <Link to="/analyzer" className="btn btn-primary">
                Analyze Your Own Message <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
