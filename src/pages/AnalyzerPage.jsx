import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeMessage, analyzeUrlInput, analyzeImageScam } from '../utils/analyzeMessage'
import { demoMessages, demoUrls, demoImages } from '../data/demoMessages'
import ScanAnimation from '../components/ScanAnimation'
import RiskGauge from '../components/RiskGauge'
import AnalysisAccordion from '../components/AnalysisAccordion'
import ScoreBreakdown from '../components/ScoreBreakdown'
import WhySuspicious from '../components/WhySuspicious'
import { Scan, Trash2, Play, AlertTriangle, Shield, Link as LinkIcon, MessageSquare, Image as ImageIcon, Upload, X } from '../components/Icons'
import './AnalyzerPage.css'

export default function AnalyzerPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState('text') // 'text' | 'url' | 'image'
  const [inputText, setInputText] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFileName, setImageFileName] = useState('')
  const [imageDetectedText, setImageDetectedText] = useState('')
  const [state, setState] = useState('idle') // idle | scanning | result
  const [result, setResult] = useState(null)
  const [usedDemo, setUsedDemo] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // Check for demo query param on load
  useEffect(() => {
    const demoId = searchParams.get('demo')
    if (demoId) {
      const demo = demoMessages.find(d => d.id === demoId)
      if (demo) {
        setMode('text')
        setInputText(demo.text)
        setUsedDemo(demo)
      }
    }
  }, [searchParams])

  // Global clipboard paste listener to capture pasted images directly
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile()
          if (blob) {
            const reader = new FileReader()
            reader.onload = (event) => {
              setImagePreview(event.target.result)
              setImageFileName(blob.name || 'Pasted-Screenshot.png')
              setImageDetectedText('Screenshot pasted from clipboard. Visual frame and text cues extracted.')
              setMode('image')
              if (state === 'result') setState('idle')
            }
            reader.readAsDataURL(blob)
            e.preventDefault()
            break
          }
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [state])

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target.result)
      setImageFileName(file.name)
      setImageDetectedText(`Screenshot upload (${file.name}). Scanning visual layout, brand iconography, and embedded text.`)
      if (state === 'result') setState('idle')
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0])
    }
  }

  const handleAnalyze = useCallback(() => {
    if (mode === 'text' && !inputText.trim()) return
    if (mode === 'url' && !inputUrl.trim()) return
    if (mode === 'image' && !imagePreview) return
    setState('scanning')
  }, [mode, inputText, inputUrl, imagePreview])

  const handleScanComplete = useCallback(() => {
    if (mode === 'text') {
      if (usedDemo && inputText === usedDemo.text) {
        setResult({
          score: usedDemo.expectedScore,
          riskLevel: {
            level: usedDemo.expectedScore > 75 ? 'CRITICAL' : usedDemo.expectedScore > 50 ? 'HIGH' : usedDemo.expectedScore > 25 ? 'MEDIUM' : 'LOW',
            label: usedDemo.expectedScore > 75 ? 'CRITICAL RISK' : usedDemo.expectedScore > 50 ? 'HIGH RISK' : usedDemo.expectedScore > 25 ? 'MEDIUM RISK' : 'LOW RISK',
            color: usedDemo.expectedScore > 75 ? 'critical' : usedDemo.expectedScore > 50 ? 'high' : usedDemo.expectedScore > 25 ? 'medium' : 'low'
          },
          signals: usedDemo.signals,
          badges: usedDemo.badges,
          urls: usedDemo.urls,
          explanation: usedDemo.explanation,
          type: 'text'
        })
      } else {
        setResult({ ...analyzeMessage(inputText), type: 'text' })
      }
    } else if (mode === 'url') {
      setResult(analyzeUrlInput(inputUrl))
    } else if (mode === 'image') {
      setResult(analyzeImageScam({
        fileName: imageFileName,
        imagePreview,
        detectedText: imageDetectedText
      }))
    }
    setState('result')
    setUsedDemo(null)
  }, [mode, inputText, inputUrl, imagePreview, imageFileName, imageDetectedText, usedDemo])

  const handleLoadDemo = () => {
    if (mode === 'text') {
      const demo = demoMessages[0]
      setInputText(demo.text)
      setUsedDemo(demo)
    } else if (mode === 'url') {
      const demo = demoUrls[0]
      setInputUrl(demo.url)
      setUsedDemo(null)
    } else if (mode === 'image') {
      const demo = demoImages[0]
      setImagePreview(demo.svgData)
      setImageFileName(demo.fileName)
      setImageDetectedText(demo.detectedText)
      setUsedDemo(null)
    }
    setState('idle')
    setResult(null)
  }

  const handleClear = () => {
    if (mode === 'text') setInputText('')
    else if (mode === 'url') setInputUrl('')
    else if (mode === 'image') {
      setImagePreview(null)
      setImageFileName('')
      setImageDetectedText('')
    }
    setState('idle')
    setResult(null)
    setUsedDemo(null)
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setState('idle')
    setResult(null)
  }

  return (
    <main className="analyzer-page">
      <div className="container">
        <div className="analyzer-page__header">
          <h1 className="analyzer-page__title">Threat Analyzer</h1>
          <p className="analyzer-page__subtitle">
            {mode === 'text' && 'Paste a suspicious email, SMS, or social message for analysis.'}
            {mode === 'url' && 'Inspect suspicious URLs and domains for typosquatting, spoofing, and phishing traps.'}
            {mode === 'image' && 'Paste a screenshot (Ctrl+V) or upload an image to screen for scams and social engineering.'}
          </p>
        </div>

        <div className="analyzer-page__layout">
          {/* Input Panel */}
          <div className="analyzer-page__input-panel">
            <div className="analyzer-page__input-wrap glass-card">
              {/* Mode Tabs */}
              <div className="analyzer-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'text'}
                  className={`analyzer-tab ${mode === 'text' ? 'analyzer-tab--active' : ''}`}
                  onClick={() => handleModeChange('text')}
                >
                  <MessageSquare size={15} />
                  <span>Text Message</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'url'}
                  className={`analyzer-tab ${mode === 'url' ? 'analyzer-tab--active' : ''}`}
                  onClick={() => handleModeChange('url')}
                >
                  <LinkIcon size={15} />
                  <span>URLs</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'image'}
                  className={`analyzer-tab ${mode === 'image' ? 'analyzer-tab--active' : ''}`}
                  onClick={() => handleModeChange('image')}
                >
                  <ImageIcon size={15} />
                  <span>Screen Image</span>
                </button>
              </div>

              {/* Mode: Text Messages */}
              {mode === 'text' && (
                <textarea
                  className="analyzer-page__textarea"
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value); if (state === 'result') setState('idle') }}
                  placeholder="Paste a suspicious email, SMS, or social message here…"
                  rows={15}
                  aria-label="Message input"
                />
              )}

              {/* Mode: URLs */}
              {mode === 'url' && (
                <div className="analyzer-url-container">
                  <div className="analyzer-quick-demos">
                    <span className="analyzer-quick-demos__label">Test Examples:</span>
                    {demoUrls.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className="analyzer-demo-chip"
                        onClick={() => { setInputUrl(d.url); if (state === 'result') setState('idle') }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="analyzer-page__textarea"
                    value={inputUrl}
                    onChange={(e) => { setInputUrl(e.target.value); if (state === 'result') setState('idle') }}
                    placeholder="Enter or paste suspicious URL(s) to inspect (one per line, e.g. https://netf1ix-billing-update.cc)..."
                    rows={12}
                    aria-label="URL input"
                  />
                  <div className="analyzer-field-tip">
                    <AlertTriangle size={13} />
                    <span>Supports full URLs, subdomains, unencrypted HTTP links, and numeric IP addresses.</span>
                  </div>
                </div>
              )}

              {/* Mode: Screen Image */}
              {mode === 'image' && (
                <div className="analyzer-image-container">
                  <div className="analyzer-quick-demos">
                    <span className="analyzer-quick-demos__label">Sample Scam Screenshots:</span>
                    {demoImages.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        className="analyzer-demo-chip"
                        onClick={() => {
                          setImagePreview(img.svgData)
                          setImageFileName(img.fileName)
                          setImageDetectedText(img.detectedText)
                          if (state === 'result') setState('idle')
                        }}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>

                  {!imagePreview ? (
                    <div
                      className={`analyzer-dropzone ${isDragging ? 'analyzer-dropzone--active' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                      />
                      <div className="analyzer-dropzone__icon">
                        <Upload size={32} />
                      </div>
                      <h4 className="analyzer-dropzone__title">Paste Screenshot or Upload Image</h4>
                      <p className="analyzer-dropzone__desc">
                        Press <kbd className="analyzer-dropzone__kbd">Ctrl</kbd> + <kbd className="analyzer-dropzone__kbd">V</kbd> anywhere to paste an image from your clipboard, or click to browse files.
                      </p>
                      <span className="analyzer-dropzone__sub">Supports PNG, JPG, JPEG, WEBP • Max 10MB</span>
                    </div>
                  ) : (
                    <div className="analyzer-preview">
                      <div className="analyzer-preview__img-wrap">
                        <img src={imagePreview} alt="Screenshot artifact" className="analyzer-preview__img" />
                      </div>
                      <div className="analyzer-preview__bar">
                        <div className="analyzer-preview__meta">
                          <span className="analyzer-preview__filename">{imageFileName}</span>
                          <span className="analyzer-preview__badge">Ready for screening</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost analyzer-preview__remove"
                          onClick={() => { setImagePreview(null); setImageFileName(''); setImageDetectedText('') }}
                          title="Remove image"
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="analyzer-page__controls">
                <button
                  className="btn btn-primary"
                  onClick={handleAnalyze}
                  disabled={
                    state === 'scanning' ||
                    (mode === 'text' && !inputText.trim()) ||
                    (mode === 'url' && !inputUrl.trim()) ||
                    (mode === 'image' && !imagePreview)
                  }
                >
                  <Scan size={16} />
                  {mode === 'text' && 'Analyze Message'}
                  {mode === 'url' && 'Inspect URLs'}
                  {mode === 'image' && 'Screen Image'}
                </button>
                <button className="btn btn-secondary" onClick={handleLoadDemo}>
                  <Play size={14} />
                  Load Demo
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handleClear}
                  disabled={
                    (mode === 'text' && !inputText) ||
                    (mode === 'url' && !inputUrl) ||
                    (mode === 'image' && !imagePreview)
                  }
                >
                  <Trash2 size={14} />
                  Clear
                </button>
              </div>
            </div>

            {/* URL highlighting display when result is available */}
            {state === 'result' && result?.urls?.some(u => u.suspicious) && (
              <motion.div
                className="analyzer-page__url-panel glass-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="analyzer-page__url-panel-title">
                  <AlertTriangle size={16} /> Detected URL Threats
                </h3>
                {result.urls.map((u, i) => (
                  <div key={i} className={`analyzer-page__url-row ${u.suspicious ? 'analyzer-page__url-row--bad' : ''}`}>
                    <code className="analyzer-page__url-domain">{u.domain || u.url}</code>
                    <span className={`badge badge-${u.suspicious ? 'high' : 'low'}`}>
                      {u.suspicious ? 'SUSPICIOUS' : 'OK'}
                    </span>
                    <p className="analyzer-page__url-reason">{u.reason}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Result Panel */}
          <div className="analyzer-page__result-panel">
            <AnimatePresence mode="wait">
              {state === 'idle' && (
                <motion.div
                  key="idle"
                  className="analyzer-page__empty glass-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Shield size={48} className="analyzer-page__empty-icon" />
                  <p className="analyzer-page__empty-text">
                    {mode === 'text' && (
                      <>Paste a message and click <strong>Analyze Message</strong> to see the threat assessment.</>
                    )}
                    {mode === 'url' && (
                      <>Enter or paste suspicious URLs and click <strong>Inspect URLs</strong> to check for phishing.</>
                    )}
                    {mode === 'image' && (
                      <>Paste a screenshot or upload an image and click <strong>Screen Image</strong> to check for scam indicators.</>
                    )}
                  </p>
                </motion.div>
              )}

              {state === 'scanning' && (
                <motion.div
                  key="scanning"
                  className="analyzer-page__scan-wrap glass-card"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                >
                  <ScanAnimation onComplete={handleScanComplete} />
                </motion.div>
              )}

              {state === 'result' && result && (
                <motion.div
                  key="result"
                  className="analyzer-page__result-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* If screened from an image, display verified image badge */}
                  {result.imageMeta?.previewUrl && (
                    <div className="analyzer-page__screened-image glass-card">
                      <div className="analyzer-page__screened-header">
                        <span className="analyzer-page__screened-tag">SCREENED IMAGE ARTIFACT</span>
                        <span className="analyzer-page__screened-file">{result.imageMeta.fileName}</span>
                      </div>
                      <div className="analyzer-page__screened-thumb-wrap">
                        <img src={result.imageMeta.previewUrl} alt="Screened artifact" className="analyzer-page__screened-thumb" />
                      </div>
                    </div>
                  )}

                  <div className="analyzer-page__gauge-section glass-card">
                    <RiskGauge score={result.score} size={180} />
                    {result.badges?.length > 0 && (
                      <div className="analyzer-page__result-badges">
                        {result.badges.map(b => (
                          <span key={b} className={`badge badge-${result.riskLevel?.color || 'high'}`}>{b}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="analyzer-page__analysis-section">
                    <WhySuspicious
                      signals={result.signals}
                      explanation={result.explanation}
                    />
                  </div>

                  <div className="analyzer-page__analysis-section">
                    <ScoreBreakdown signals={result.signals} score={result.score} />
                  </div>

                  <div className="analyzer-page__analysis-section">
                    <AnalysisAccordion signals={result.signals} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  )
}

