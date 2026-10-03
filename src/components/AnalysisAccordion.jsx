import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Link as LinkIcon, Brain, UserX, Clock, ShieldAlert } from './Icons'
import './AnalysisAccordion.css'

const categoryIcons = {
  'Link Intelligence': LinkIcon,
  'Social Engineering': Brain,
  'Impersonation Detection': UserX,
  'Urgency & Pressure': Clock,
  'Message Analysis': ShieldAlert,
}

export default function AnalysisAccordion({ signals = [] }) {
  const [openIndex, setOpenIndex] = useState(0)

  if (!signals.length) return null

  return (
    <div className="accordion">
      <h3 className="accordion__heading">Analysis Details</h3>
      {signals.map((signal, i) => {
        const Icon = categoryIcons[signal.category] || ShieldAlert
        const isOpen = openIndex === i
        return (
          <div key={i} className={`accordion__item ${isOpen ? 'accordion__item--open' : ''}`}>
            <button
              className="accordion__trigger"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              <span className="accordion__num">{String(i + 1).padStart(2, '0')}</span>
              <Icon size={18} className="accordion__icon" />
              <div className="accordion__trigger-text">
                <span className="accordion__category">{signal.category}</span>
                <span className="accordion__signal">{signal.signal}</span>
              </div>
              <span className={`badge badge-${signal.severity === 'high' ? 'high' : signal.severity === 'medium' ? 'medium' : 'low'}`}>
                {signal.severity.toUpperCase()}
              </span>
              <ChevronDown
                size={16}
                className={`accordion__chevron ${isOpen ? 'accordion__chevron--open' : ''}`}
              />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="accordion__content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="accordion__detail">
                    <div className="accordion__detail-row">
                      <span className="accordion__detail-label">Detection</span>
                      <span className="accordion__detail-value">{signal.signal}</span>
                    </div>
                    <div className="accordion__detail-row">
                      <span className="accordion__detail-label">Evidence</span>
                      <span className="accordion__detail-value">{signal.detail}</span>
                    </div>
                    <div className="accordion__detail-row">
                      <span className="accordion__detail-label">Risk Contribution</span>
                      <span className="accordion__detail-value accordion__detail-points">
                        +{signal.points} points
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
