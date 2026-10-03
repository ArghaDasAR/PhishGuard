import { Link } from 'react-router-dom'
import { Shield, Github, Linkedin, ExternalLink } from './Icons'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand-col">
            <Link to="/" className="footer__brand">
              <Shield size={22} className="footer__brand-icon" />
              <span className="footer__brand-text">PHISHGUARD</span>
            </Link>
            <p className="footer__tagline">Think Before You Trust.</p>
            <p className="footer__desc">AI-powered scam and social-engineering analysis.</p>
            <div className="footer__social">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="footer__social-link">
                <Github size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer__social-link">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Product</h4>
            <Link to="/analyzer" className="footer__link">Analyzer</Link>
            <Link to="/#how-it-works" className="footer__link">How It Works</Link>
            <Link to="/architecture" className="footer__link">Architecture</Link>
            <Link to="/docs" className="footer__link">Developer Docs</Link>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Cybersecurity Resources</h4>
            <a href="https://www.cert-in.org.in/" target="_blank" rel="noopener noreferrer" className="footer__link footer__link--ext">
              CERT-In <ExternalLink size={12} />
            </a>
            <a href="https://www.cybercrime.gov.in/" target="_blank" rel="noopener noreferrer" className="footer__link footer__link--ext">
              Cyber Crime Portal <ExternalLink size={12} />
            </a>
            <a href="https://www.csk.gov.in/" target="_blank" rel="noopener noreferrer" className="footer__link footer__link--ext">
              Cyber Swachhta Kendra <ExternalLink size={12} />
            </a>
            <a href="https://www.cert-in.org.in/s2cMainServlet?pageid=GUIDLNVIEW01" target="_blank" rel="noopener noreferrer" className="footer__link footer__link--ext">
              CERT-In Guidelines <ExternalLink size={12} />
            </a>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Project</h4>
            <Link to="/docs" className="footer__link">About PhishGuard</Link>
            <Link to="/architecture" className="footer__link">Technology</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer__link footer__link--ext">
              GitHub Repository <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__legal">
            PhishGuard provides automated risk analysis and should not be treated as definitive proof that a message is malicious or safe. Verify suspicious communications through trusted channels before taking action.
          </p>
          <p className="footer__legal">
            PhishGuard is an independent project and is not affiliated with or endorsed by the government resources linked above.
          </p>
          <p className="footer__copy">© {new Date().getFullYear()} PhishGuard. Built for education and awareness.</p>
        </div>
      </div>
    </footer>
  )
}
