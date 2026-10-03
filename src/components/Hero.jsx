import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield } from './Icons'
import './Hero.css'

function SphereVisual() {
  const [activeTier, setActiveTier] = useState('50K')

  return (
    <motion.div
      className="hero-sphere-wrap"
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* 3D Crystal Glass Sphere */}
      <div className="hero-sphere-viewport">
        <video
          className="hero-sphere-video"
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          poster="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_105822_bf7c2d53-9957-4521-bbbf-7c1ab7a70130.png"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_105953_21ad8049-9088-4a00-bad3-aee6b5575a2b.mp4"
        />
        <div className="hero-sphere-glow" aria-hidden="true" />
      </div>

      {/* Floating Glassmorphic AI-Driven Card (Matches Image 2) */}
      <motion.div
        className="hero-sphere-panel glass-card"
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
      >
        <div className="sphere-panel__header">
          <div className="sphere-panel__title-wrap">
            <span className="sphere-panel__title">AI-Driven</span>
            <span className="sphere-panel__dot" />
          </div>
          <div className="sphere-panel__shield-badge">
            <Shield size={19} className="sphere-panel__shield-icon" />
          </div>
        </div>

        <p className="sphere-panel__subtitle">
          Cloud Infrastructure<br />
          Protection
        </p>

        <div className="sphere-panel__metrics">
          <div className="sphere-panel__scale">
            {['1K', '10K', '50K', '100K'].map((tier) => (
              <span
                key={tier}
                className={`sphere-panel__tier ${activeTier === tier ? 'sphere-panel__tier--active' : ''}`}
                onClick={() => setActiveTier(tier)}
              >
                {tier}
              </span>
            ))}
          </div>

          <div className="sphere-panel__track">
            <motion.div
              className="sphere-panel__fill"
              initial={{ width: '0%' }}
              animate={{
                width: activeTier === '1K' ? '15%' : activeTier === '10K' ? '40%' : activeTier === '50K' ? '70%' : '100%'
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <div className="sphere-panel__footer">
          <span className="sphere-panel__pulse-dot" />
          <span className="sphere-panel__footer-text">PhishGuard Autonomous Shield</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg-grid" aria-hidden="true" />
      <div className="hero__particles" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`hero__particle hero__particle--${i + 1}`} />
        ))}
      </div>

      <div className="container hero__container">
        <div className="hero__content">
          <motion.span
            className="hero__eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            AI-POWERED SCAM DETECTION
          </motion.span>

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            THINK BEFORE<br />
            YOU TRUST.
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Paste any suspicious email, SMS, or social message. PhishGuard analyzes
            links, impersonation, urgency, and social-engineering tactics to reveal
            the threat.
          </motion.p>

          <motion.div
            className="hero__buttons"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link to="/analyzer" className="btn btn-primary hero__btn">
              Analyze a Message
              <ArrowRight size={16} />
            </Link>
            <Link to="/analyzer?demo=netflix-phish" className="btn btn-secondary hero__btn">
              Try Demo
            </Link>
          </motion.div>
        </div>

        <div className="hero__visual">
          <SphereVisual />
        </div>
      </div>
    </section>
  )
}

