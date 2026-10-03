import './WhySuspicious.css'

export default function WhySuspicious({ signals = [], explanation = '' }) {
  const pointSignals = signals.filter(s => s.points > 0).sort((a, b) => b.points - a.points)

  if (!pointSignals.length) return null

  return (
    <div className="why-suspicious">
      <h3 className="why-suspicious__heading">Why Is This Suspicious?</h3>
      <div className="why-suspicious__points">
        {pointSignals.map((s, i) => (
          <div key={i} className="why-suspicious__point-row">
            <span className={`why-suspicious__score why-suspicious__score--${s.severity}`}>
              +{s.points}
            </span>
            <span className="why-suspicious__reason">{s.signal}</span>
          </div>
        ))}
      </div>
      {explanation && (
        <p className="why-suspicious__explanation">{explanation}</p>
      )}
    </div>
  )
}
