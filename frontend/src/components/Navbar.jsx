import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="logo-icon">⛏️</span>
        Majdur<span className="accent">AI</span>
      </Link>
      <div className="nav-links">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn btn-ghost">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn btn-primary">Get Started</button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/create" className="nav-link">Create</Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  )
}
