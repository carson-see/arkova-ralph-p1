/**
 * LandingPage
 *
 * Public landing page for Arkova.
 */

import React from 'react';

export function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-name">Arkova</span>
        </div>
        <div className="nav-links">
          <a href="#/verify" className="nav-link">Verify</a>
          <a href="#/auth" className="btn-primary">Sign In</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Secure Your Documents with Verifiable Proof</h1>
          <p className="hero-subtitle">
            Create tamper-evident records of your important documents.
            Prove authenticity without exposing sensitive data.
          </p>
          <div className="hero-cta">
            <a href="#/auth" className="btn-primary btn-large">Get Started</a>
            <a href="#/verify" className="btn-secondary btn-large">Verify a Document</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Arkova?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Privacy First</h3>
            <p>
              Your files never leave your device. We only store a cryptographic
              fingerprint – your data stays yours.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Tamper-Evident</h3>
            <p>
              Any modification to a document changes its fingerprint.
              Instantly detect if a file has been altered.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Verifiable Anywhere</h3>
            <p>
              Anyone can verify a document's authenticity without needing
              an account or special software.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>Built for Business</h3>
            <p>
              Organization accounts with team management, audit trails,
              and compliance-ready features.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step">
            <span className="step-number">1</span>
            <h3>Secure Your Document</h3>
            <p>Drop your file to generate a unique digital fingerprint.</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>We Anchor It</h3>
            <p>The fingerprint is anchored to create a permanent, verifiable record.</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>Verify Anytime</h3>
            <p>Anyone can verify the document's authenticity instantly.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Secure Your Documents?</h2>
        <p>Start protecting your important files today.</p>
        <a href="#/auth" className="btn-primary btn-large">Create Free Account</a>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-name">Arkova</span>
            <p>Secure document verification</p>
          </div>
          <div className="footer-links">
            <a href="#/verify">Verify Document</a>
            <a href="#/auth">Sign In</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Arkova. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
