import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/clerk-react'
import './Landing.css'

export default function Landing() {
  return (
    <section className="landing">
      <div className="landing-bg">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="grid-pattern" />
      </div>
      <div className="landing-content">
        <h1 className="landing-title">
          Build websites with <span className="gradient-text">AI</span>
          <br />in seconds, not hours
        </h1>
        <p className="landing-subtitle">
          Describe your dream website in plain English. Our AI turns your ideas into
          beautiful, responsive sites—no coding required.
        </p>
        <div className="landing-cta">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="btn-hero">Start building free</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link to="/create" className="btn-hero">Start building</Link>
          </SignedIn>
        </div>
        <div className="landing-features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Instant generation</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎨</span>
            <span>Modern design</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📱</span>
            <span>Mobile-ready</span>
          </div>
        </div>
      </div>
    </section>
  )
}
