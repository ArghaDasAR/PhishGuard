import { motion } from 'framer-motion'
import './ScoreBreakdown.css'

export default function ScoreBreakdown({ signals = [], score = 0 }) {
  if (!signals.length) return null
  const maxPoints = Math.max(...signals.map(s => s.points), 1)

  return (
    <div className="breakdown">
      <h3 className="breakdown__heading">Score Breakdown</h3>
      <div className="breakdown__bars">
        {signals.map((signal, i) => (
          <div key={i} className="breakdown__row">
            <span className="breakdown__label">{signal.category}</span>
            <div className="breakdown__bar-track">
              <motion.div
                className={`breakdown__bar-fill breakdown__bar-fill--${signal.severity}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${(signal.points / maxPoints) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="breakdown__points">+{signal.points}</span>
          </div>
        ))}
      </div>
      <div className="breakdown__total">
        <span className="breakdown__total-label">Total Risk Score</span>
        <span className="breakdown__total-value">{score} / 100</span>
      </div>
    </div>
  )
}
