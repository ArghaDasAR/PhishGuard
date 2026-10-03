import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { scanSteps } from '../data/demoMessages'
import { Scan, Link as LinkIcon, Globe, UserX, Brain, ShieldAlert, FileCheck } from './Icons'
import './ScanAnimation.css'

const stepIcons = {
  link: LinkIcon,
  globe: Globe,
  'user-x': UserX,
  brain: Brain,
  'shield-alert': ShieldAlert,
  'file-check': FileCheck,
}

export default function ScanAnimation({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalDuration = 3200
    const stepDuration = totalDuration / scanSteps.length
    let step = 0

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1
        if (next >= 100) { clearInterval(progressInterval); return 100 }
        return next
      })
    }, totalDuration / 100)

    const stepInterval = setInterval(() => {
      step++
      if (step >= scanSteps.length) {
        clearInterval(stepInterval)
        setTimeout(() => onComplete?.(), 400)
        return
      }
      setCurrentStep(step)
    }, stepDuration)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [onComplete])

  return (
    <div className="scan-anim">
      <div className="scan-anim__header">
        <motion.div
          className="scan-anim__icon"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Scan size={28} />
        </motion.div>
        <h3 className="scan-anim__title">ANALYZING MESSAGE</h3>
        <span className="scan-anim__percent">{progress}%</span>
      </div>

      <div className="scan-anim__bar-track">
        <motion.div
          className="scan-anim__bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />
        <div className="scan-anim__bar-glow" style={{ left: `${progress}%` }} />
      </div>

      <div className="scan-anim__steps">
        {scanSteps.map((step, i) => {
          const Icon = stepIcons[step.icon] || Scan
          const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'
          return (
            <motion.div
              key={step.id}
              className={`scan-anim__step scan-anim__step--${state}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <span className="scan-anim__step-num">{String(step.id).padStart(2, '0')}</span>
              <Icon size={16} className="scan-anim__step-icon" />
              <span className="scan-anim__step-label">{step.label}</span>
              {state === 'active' && (
                <motion.span
                  className="scan-anim__step-pulse"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              {state === 'done' && <span className="scan-anim__step-check">✓</span>}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
