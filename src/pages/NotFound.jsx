import { Link } from 'react-router-dom'
import { Shield } from '../components/Icons'
import './NotFound.css'

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="container">
        <div className="not-found__content">
          <Shield size={64} className="not-found__icon" />
          <h1 className="not-found__code">404</h1>
          <p className="not-found__text">This page doesn't exist or has been moved.</p>
          <Link to="/" className="btn btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    </main>
  )
}
