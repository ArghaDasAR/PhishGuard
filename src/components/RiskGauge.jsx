import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getRiskLevel } from '../utils/analyzeMessage'
import './RiskGauge.css'

export default function RiskGauge({ score = 0, size = 200 }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const shouldReduce = useReducedMotion()
  const riskLevel = getRiskLevel(score)

  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (animatedScore / 100) * circumference
  const offset = circumference - progress

  useEffect(() => {
    if (shouldReduce) { setAnimatedScore(score); return }
    let current = 0
    const step = Math.max(1, Math.floor(score / 50))
    const interval = setInterval(() => {
      current += step
      if (current >= score) { current = score; clearInterval(interval) }
      setAnimatedScore(current)
    }, 20)
    return () => clearInterval(interval)
  }, [score, shouldReduce])

  const colorVar = `var(--risk-${riskLevel.color})`

  return (
    <div className="risk-gauge" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="risk-gauge__svg">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-primary)"
          strokeWidth="8"
          opacity="0.5"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorVar}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="risk-gauge__progress"
          style={{ filter: `drop-shadow(0 0 8px ${colorVar})` }}
        />
      </svg>
      <div className="risk-gauge__center">
        <span className="risk-gauge__number" style={{ color: colorVar }}>
          {animatedScore}
        </span>
        <span className="risk-gauge__of">/100</span>
        <span className={`risk-gauge__label badge badge-${riskLevel.color}`}>
          {riskLevel.label}
        </span>
      </div>
    </div>
  )
}
