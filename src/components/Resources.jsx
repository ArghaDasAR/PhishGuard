import { externalResources } from '../data/externalResources'
import { ExternalLink } from './Icons'
import ScrollReveal, { StaggerContainer, StaggerItem } from './ScrollReveal'
import './Resources.css'

export default function Resources() {
  return (
    <section className="section resources-section" id="resources">
      <div className="container">
        <ScrollReveal>
          <div className="section-header">
            <p className="section-eyebrow">Cybersecurity Resources</p>
            <h2 className="section-title">Official External Resources</h2>
            <p className="section-subtitle">
              Trusted government and institutional cybersecurity resources for reporting and advisory.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="resources-section__grid">
          {externalResources.map((resource) => (
            <StaggerItem key={resource.id}>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resources-section__card glass-card"
              >
                <div className="resources-section__card-top">
                  <h3 className="resources-section__name">{resource.name}</h3>
                  <ExternalLink size={16} className="resources-section__ext-icon" />
                </div>
                <p className="resources-section__full-name">{resource.fullName}</p>
                <p className="resources-section__desc">{resource.description}</p>
              </a>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.2}>
          <p className="resources-section__disclaimer">
            PhishGuard is an independent project and is not affiliated with or endorsed by these organizations.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
