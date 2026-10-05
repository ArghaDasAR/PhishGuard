/**
 * src/utils/mergeThreatScores.js — Threat Score Combiner and Signal Merger
 *
 * Member 3: AI / Social Engineering Analyzer
 * Combines Member 2 (Technical URL/Domain Heuristics) with Member 3 (Gemma 4 Social Engineering AI)
 *
 * Formula:
 * finalThreatScore = round(technicalScore * 0.55 + socialEngineeringScore * 0.45) clamped to 0-100.
 *
 * Risk Level Mapping:
 * 0-29: LOW
 * 30-59: MEDIUM
 * 60-79: HIGH
 * 80-100: CRITICAL
 */

/**
 * Returns risk level category object compatible with PhishGuard UI.
 * @param {number} score - Threat score from 0 to 100
 */
export function getRiskLevel(score) {
  const s = Math.max(0, Math.min(100, Math.round(score || 0)))
  if (s <= 29) return { level: 'LOW', label: 'LOW RISK', color: 'low' }
  if (s <= 59) return { level: 'MEDIUM', label: 'MEDIUM RISK', color: 'medium' }
  if (s <= 79) return { level: 'HIGH', label: 'HIGH RISK', color: 'high' }
  return { level: 'CRITICAL', label: 'CRITICAL RISK', color: 'critical' }
}

/**
 * Merges local technical analysis with Gemma 4 social-engineering AI analysis.
 *
 * @param {Object} technicalResult - Output from local technical analyzer (Member 2)
 * @param {Object|null} aiResult - Output from /api/analyze-gemma (Member 3)
 * @returns {Object} Unified threat assessment object
 */
export function mergeThreatScores(technicalResult, aiResult) {
  const techScore = typeof technicalResult?.technicalScore === 'number'
    ? technicalResult.technicalScore
    : (typeof technicalResult?.score === 'number' ? technicalResult.score : 0)

  const isAiValid = aiResult && aiResult.success && aiResult.aiAvailable && typeof aiResult.socialEngineeringScore === 'number'
  const seScore = isAiValid ? aiResult.socialEngineeringScore : null

  // Calculate final score
  let finalScore
  if (isAiValid) {
    finalScore = Math.max(0, Math.min(100, Math.round(techScore * 0.55 + seScore * 0.45)))
  } else {
    finalScore = Math.max(0, Math.min(100, Math.round(techScore)))
  }

  // Aggregate signals
  const combinedSignals = []
  const badges = [...(technicalResult?.badges || [])]

  // Add technical signals from Member 2
  if (Array.isArray(technicalResult?.signals)) {
    for (const sig of technicalResult.signals) {
      combinedSignals.push(sig)
    }
  }

  // Add AI-detected social engineering signals if available
  if (isAiValid && aiResult.signals) {
    const aiSig = aiResult.signals

    if (aiSig.urgency >= 30) {
      const pts = Math.round(aiSig.urgency * 0.18)
      combinedSignals.push({
        category: 'Urgency & Pressure',
        severity: aiSig.urgency >= 70 ? 'high' : 'medium',
        signal: 'Gemma 4: Artificial urgency detected',
        detail: `AI identified psychological pressure and time-constraint triggers (${aiSig.urgency}/100 intensity).`,
        points: pts,
      })
      if (!badges.includes('FALSE URGENCY')) badges.push('FALSE URGENCY')
    }

    if (aiSig.fearOrThreat >= 30) {
      const pts = Math.round(aiSig.fearOrThreat * 0.15)
      combinedSignals.push({
        category: 'Social Engineering',
        severity: aiSig.fearOrThreat >= 70 ? 'high' : 'medium',
        signal: 'Gemma 4: Fear & coercion indicators',
        detail: `AI flagged language designed to induce panic, account threats, or consequences (${aiSig.fearOrThreat}/100 intensity).`,
        points: pts,
      })
      if (!badges.includes('EMOTIONAL PRESSURE')) badges.push('EMOTIONAL PRESSURE')
    }

    if (aiSig.fakeAuthority >= 30) {
      const pts = Math.round(aiSig.fakeAuthority * 0.10)
      combinedSignals.push({
        category: 'Social Engineering',
        severity: aiSig.fakeAuthority >= 70 ? 'high' : 'medium',
        signal: 'Gemma 4: Fake authority framing',
        detail: `AI identified institutional or administrative posture exploitation (${aiSig.fakeAuthority}/100 intensity).`,
        points: pts,
      })
      if (!badges.includes('FAKE AUTHORITY')) badges.push('FAKE AUTHORITY')
    }

    if (aiSig.financialPressure >= 30) {
      const pts = Math.round(aiSig.financialPressure * 0.12)
      combinedSignals.push({
        category: 'Social Engineering',
        severity: aiSig.financialPressure >= 70 ? 'high' : 'medium',
        signal: 'Gemma 4: Financial & billing pressure',
        detail: `AI detected urgent payment demands, billing alerts, or financial loss warnings (${aiSig.financialPressure}/100 intensity).`,
        points: pts,
      })
      if (!badges.includes('FINANCIAL PRESSURE')) badges.push('FINANCIAL PRESSURE')
    }

    if (aiSig.credentialRequest >= 30) {
      const pts = Math.round(aiSig.credentialRequest * 0.18)
      combinedSignals.push({
        category: 'Social Engineering',
        severity: aiSig.credentialRequest >= 70 ? 'high' : 'medium',
        signal: 'Gemma 4: Credential harvesting attempt',
        detail: `AI flagged solicitation of login details, passwords, PINs, OTPs, or identity verification (${aiSig.credentialRequest}/100 intensity).`,
        points: pts,
      })
      if (!badges.includes('CREDENTIAL REQUEST')) badges.push('CREDENTIAL REQUEST')
    }

    if (aiSig.emotionalPressure >= 30) {
      const pts = Math.round(aiSig.emotionalPressure * 0.08)
      combinedSignals.push({
        category: 'Social Engineering',
        severity: aiSig.emotionalPressure >= 70 ? 'high' : 'medium',
        signal: 'Gemma 4: Emotional manipulation',
        detail: `AI detected psychological pressure targeting emotions or compliance (${aiSig.emotionalPressure}/100 intensity).`,
        points: pts,
      })
      if (!badges.includes('EMOTIONAL PRESSURE')) badges.push('EMOTIONAL PRESSURE')
    }

    if (aiSig.impersonation >= 30) {
      const pts = Math.round(aiSig.impersonation * 0.08)
      combinedSignals.push({
        category: 'Impersonation Detection',
        severity: aiSig.impersonation >= 70 ? 'high' : 'medium',
        signal: 'Gemma 4: Impersonation behavior',
        detail: `AI detected entity/brand impersonation framing (${aiSig.impersonation}/100 intensity).`,
        points: pts,
      })
      if (!badges.includes('IMPERSONATION')) badges.push('IMPERSONATION')
    }

    if (aiSig.actionPressure >= 30) {
      const pts = Math.round(aiSig.actionPressure * 0.08)
      combinedSignals.push({
        category: 'Urgency & Pressure',
        severity: aiSig.actionPressure >= 70 ? 'high' : 'medium',
        signal: 'Gemma 4: Forced action demand',
        detail: `AI flagged directives coercing immediate user action (${aiSig.actionPressure}/100 intensity).`,
        points: pts,
      })
    }

    if (aiSig.rewardManipulation >= 30) {
      const pts = Math.round(aiSig.rewardManipulation * 0.03)
      combinedSignals.push({
        category: 'Social Engineering',
        severity: 'medium',
        signal: 'Gemma 4: Reward/Prize lure',
        detail: `AI identified lottery, reward, or prize baiting tactics (${aiSig.rewardManipulation}/100 intensity).`,
        points: pts,
      })
      if (!badges.includes('REWARD LURE')) badges.push('REWARD LURE')
    }

    if (seScore >= 60 && !badges.includes('SOCIAL ENGINEERING')) {
      badges.push('SOCIAL ENGINEERING')
    }

    badges.push('GEMMA 4 VERIFIED')
  }

  // Generate unified explanation
  let explanation = ''
  if (isAiValid && aiResult.explanation) {
    explanation = aiResult.explanation
    if (aiResult.recommendedAction) {
      explanation += ` Recommended action: ${aiResult.recommendedAction}`
    }
  } else if (technicalResult?.explanation) {
    explanation = technicalResult.explanation
    if (aiResult && !aiResult.aiAvailable) {
      explanation += ' (AI analysis unavailable — technical analysis shown.)'
    }
  } else {
    explanation = finalScore > 50
      ? 'Elevated phishing risk detected across technical and social-engineering indicators. Do not click links or share credentials.'
      : 'No significant phishing or social engineering threats detected. Exercise standard precautions.'
  }

  // Deduplicate badges
  const uniqueBadges = [...new Set(badges)]

  // Deduplicate and sort signals
  const sortedSignals = combinedSignals.length > 0
    ? combinedSignals.sort((a, b) => b.points - a.points)
    : [
        {
          category: 'Message Analysis',
          severity: 'low',
          signal: 'No significant threats detected',
          detail: 'Content does not exhibit significant phishing indicators.',
          points: 4,
        },
      ]

  return {
    score: finalScore,
    riskLevel: getRiskLevel(finalScore),
    technicalScore: techScore,
    socialEngineeringScore: seScore,
    aiAvailable: isAiValid,
    confidence: isAiValid ? aiResult.confidence : null,
    model: isAiValid ? (aiResult.model || 'gemma-4-26b-a4b-it') : null,
    signals: sortedSignals,
    badges: uniqueBadges,
    urls: technicalResult?.urls || [],
    explanation,
    recommendedAction: isAiValid ? (aiResult.recommendedAction || null) : null,
    type: technicalResult?.type || 'text',
    messageLength: technicalResult?.messageLength,
    matchedBrands: technicalResult?.matchedBrands,
    urlCount: technicalResult?.urlCount,
  }
}

/**
 * Merges local image inspection heuristics with Gemma 4 multimodal AI analysis.
 *
 * For Image Mode:
 * - Gemma 4 multimodal AI is the primary threat intelligence engine.
 * - When AI succeeds, socialEngineeringScore drives the score directly.
 * - Local indicators (+8 baseline visual inspection) NEVER dilute or overwrite a high Gemma score.
 * - If local analysis found specific high-severity indicators (e.g. extracted high-risk URL),
 *   it can augment the score: Math.max(seScore, localScore).
 * - When AI fails: falls back to local score, marks aiAvailable = false.
 *
 * @param {Object} localResult - Output from local image heuristic (analyzeImageScam)
 * @param {Object|null} aiResult - Output from /api/analyze-gemma (Member 3)
 * @returns {Object} Unified image threat assessment object
 */
export function mergeImageThreatScores(localResult, aiResult) {
  const localScore = typeof localResult?.score === 'number' ? localResult.score : 0
  const isAiValid = Boolean(aiResult && aiResult.success && aiResult.aiAvailable && typeof aiResult.socialEngineeringScore === 'number')
  const seScore = isAiValid ? aiResult.socialEngineeringScore : null

  let finalScore = localScore
  if (isAiValid) {
    // If Gemma detects social engineering, the AI score drives the threat level directly.
    // Local baseline heuristic (+8 or +12) must never drag down a 90+ AI score.
    finalScore = Math.max(seScore, localScore)
  }

  const badges = []
  if (isAiValid) {
    badges.push('IMAGE SCREENING')
    badges.push('GEMMA 4 MULTIMODAL')
    if (Array.isArray(aiResult.detectedTechniques)) {
      aiResult.detectedTechniques.forEach(t => {
        if (t && typeof t === 'string') badges.push(t.toUpperCase())
      })
    }
  } else {
    if (localResult?.badges) {
      badges.push(...localResult.badges)
    }
  }

  const combinedSignals = []
  if (localResult?.signals && Array.isArray(localResult.signals)) {
    combinedSignals.push(...localResult.signals)
  }

  if (isAiValid && aiResult.signals) {
    const { urgency, fearOrThreat, fakeAuthority, financialPressure,
      credentialRequest, emotionalPressure, impersonation, actionPressure, rewardManipulation } = aiResult.signals

    if ((urgency ?? 0) >= 10) {
      combinedSignals.push({
        category: 'Urgency & Pressure',
        severity: urgency >= 70 ? 'high' : urgency >= 40 ? 'medium' : 'low',
        signal: 'Gemma 4: Visual urgency cues',
        detail: `AI identified artificial urgency framing in screenshot (${urgency}/100 intensity).`,
        points: Math.max(1, Math.round(urgency * 0.18)),
      })
    }
    if ((fearOrThreat ?? 0) >= 10) {
      combinedSignals.push({
        category: 'Social Engineering',
        severity: fearOrThreat >= 70 ? 'high' : fearOrThreat >= 40 ? 'medium' : 'low',
        signal: 'Gemma 4: Fear & coercion indicators',
        detail: `AI flagged visual account threats or security warnings (${fearOrThreat}/100 intensity).`,
        points: Math.max(1, Math.round(fearOrThreat * 0.15)),
      })
    }
    if ((fakeAuthority ?? 0) >= 10) {
      combinedSignals.push({
        category: 'Authority & Trust Exploitation',
        severity: fakeAuthority >= 70 ? 'high' : fakeAuthority >= 40 ? 'medium' : 'low',
        signal: 'Gemma 4: Fake authority indicators',
        detail: `AI detected impersonation of legitimate authorities (${fakeAuthority}/100 intensity).`,
        points: Math.max(1, Math.round(fakeAuthority * 0.10)),
      })
    }
    if ((financialPressure ?? 0) >= 10) {
      combinedSignals.push({
        category: 'Financial Pressure',
        severity: financialPressure >= 70 ? 'high' : financialPressure >= 40 ? 'medium' : 'low',
        signal: 'Gemma 4: Financial manipulation',
        detail: `AI flagged financial threat or billing manipulation patterns (${financialPressure}/100 intensity).`,
        points: Math.max(1, Math.round(financialPressure * 0.12)),
      })
    }
    if ((credentialRequest ?? 0) >= 10) {
      combinedSignals.push({
        category: 'Social Engineering',
        severity: credentialRequest >= 70 ? 'high' : credentialRequest >= 40 ? 'medium' : 'low',
        signal: 'Gemma 4: Credential & billing prompts',
        detail: `AI detected visual payment input or password collection forms (${credentialRequest}/100 intensity).`,
        points: Math.max(1, Math.round(credentialRequest * 0.18)),
      })
    }
    if ((emotionalPressure ?? 0) >= 10) {
      combinedSignals.push({
        category: 'Emotional Manipulation',
        severity: emotionalPressure >= 70 ? 'high' : emotionalPressure >= 40 ? 'medium' : 'low',
        signal: 'Gemma 4: Emotional grooming',
        detail: `AI flagged emotional manipulation or rapport-building tactics (${emotionalPressure}/100 intensity).`,
        points: Math.max(1, Math.round(emotionalPressure * 0.08)),
      })
    }
    if ((impersonation ?? 0) >= 10) {
      combinedSignals.push({
        category: 'Impersonation Detection',
        severity: impersonation >= 70 ? 'high' : impersonation >= 40 ? 'medium' : 'low',
        signal: 'Gemma 4: Brand impersonation',
        detail: `AI identified corporate trademark imitation or layout spoofing (${impersonation}/100 intensity).`,
        points: Math.max(1, Math.round(impersonation * 0.08)),
      })
    }
    if ((actionPressure ?? 0) >= 10) {
      combinedSignals.push({
        category: 'Coercive Action',
        severity: actionPressure >= 70 ? 'high' : actionPressure >= 40 ? 'medium' : 'low',
        signal: 'Gemma 4: Forced action pressure',
        detail: `AI detected coercive calls-to-action or click pressure (${actionPressure}/100 intensity).`,
        points: Math.max(1, Math.round(actionPressure * 0.08)),
      })
    }
    if ((rewardManipulation ?? 0) >= 10) {
      combinedSignals.push({
        category: 'Reward Manipulation',
        severity: rewardManipulation >= 70 ? 'high' : rewardManipulation >= 40 ? 'medium' : 'low',
        signal: 'Gemma 4: Prize or reward bait',
        detail: `AI detected reward/prize manipulation tactics (${rewardManipulation}/100 intensity).`,
        points: Math.max(1, Math.round(rewardManipulation * 0.03)),
      })
    }
  }

  // Detected techniques from Gemma
  if (isAiValid && Array.isArray(aiResult.detectedTechniques)) {
    aiResult.detectedTechniques.forEach(technique => {
      if (!combinedSignals.some(s => s.signal.toLowerCase().includes(technique.toLowerCase()))) {
        combinedSignals.push({
          category: 'Gemma 4 Detection',
          severity: 'medium',
          signal: `Gemma 4: ${technique}`,
          detail: 'AI identified this social engineering technique in the screenshot.',
          points: 5,
        })
      }
    })
  }

  let explanation = ''
  if (isAiValid && aiResult.explanation) {
    explanation = aiResult.explanation
    if (aiResult.recommendedAction) {
      explanation += ` Recommended action: ${aiResult.recommendedAction}`
    }
  } else {
    explanation = 'AI analysis unavailable — technical/local analysis shown. ' + (localResult?.explanation || '')
  }

  return {
    score: finalScore,
    riskLevel: getRiskLevel(finalScore),
    socialEngineeringScore: seScore,
    technicalScore: localScore,
    aiAvailable: isAiValid,
    confidence: isAiValid ? (aiResult.confidence || 90) : null,
    model: isAiValid ? (aiResult.model || 'gemma-4-26b-a4b-it') : null,
    signals: combinedSignals.sort((a, b) => b.points - a.points),
    badges: [...new Set(badges)],
    urls: localResult?.urls || [],
    explanation,
    recommendedAction: isAiValid ? (aiResult.recommendedAction || null) : null,
    type: 'image',
  }
}
