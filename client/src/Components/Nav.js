import React from 'react'
import { Link } from 'react-router-dom'
export default function Nav() {
  return (
    <div>
    <header>
        Protecting what matters the most - your family's safety, anytime,
        anywhere.
      </header>
      <nav>
        <div className="logo1"></div>
        <div className="button1">
          <Link className="btn2" to="/Register">Register</Link>
          <Link className="btn2" to="/Log in">Log in</Link>
        </div>
      </nav>
    </div>
  )
}
