'use client';

import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { BookOpen, PenLine, School } from 'lucide-react';

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand">
            <div className="navbar-logo">T</div>
            <span className="navbar-brand-text">{t.app_name}</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">{t.landing.nav_features}</a>
            <a href="#about" className="landing-nav-link">{t.landing.nav_about}</a>
          </div>
          <div className="landing-nav-actions">
            <Link href="/login" className="landing-btn-outline">{t.auth.login}</Link>
            <Link href="/register" className="landing-btn-primary">{t.auth.register}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <span className="landing-badge">{t.landing.hero_badge}</span>
        <h1 className="landing-hero-title">{t.landing.hero_title}</h1>
        <p className="landing-hero-subtitle">{t.landing.hero_subtitle}</p>
        <div className="landing-hero-actions">
          <Link href="/register" className="landing-btn-primary landing-btn-lg">{t.landing.cta_start}</Link>
          <Link href="#about" className="landing-btn-outline landing-btn-lg">{t.landing.cta_contact}</Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-features">
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon"><BookOpen size={28} /></div>
            <h3>{t.landing.feature_reading}</h3>
            <p>{t.landing.feature_reading_desc}</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon"><PenLine size={28} /></div>
            <h3>{t.landing.feature_writing}</h3>
            <p>{t.landing.feature_writing_desc}</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon"><School size={28} /></div>
            <h3>{t.landing.feature_classroom}</h3>
            <p>{t.landing.feature_classroom_desc}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="landing-cta">
        <h2>{t.landing.hero_title}</h2>
        <p>{t.landing.hero_subtitle}</p>
        <div className="landing-hero-actions">
          <Link href="/register" className="landing-btn-accent landing-btn-lg">{t.landing.cta_start}</Link>
          <Link href="/login" className="landing-btn-outline-light landing-btn-lg">{t.landing.cta_contact}</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-nav-brand">
            <div className="navbar-logo">T</div>
            <span style={{ color: '#f0eef4', fontWeight: 700, fontSize: '1.1rem' }}>{t.app_name}</span>
          </div>
          <p>&copy; 2026 Teachy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
