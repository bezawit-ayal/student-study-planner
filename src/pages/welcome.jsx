import { ArrowDown, ArrowRight, BookOpen, CalendarDays, Check } from "lucide-react"
import { Link } from "react-router-dom"
import "./welcome.css"

export default function WelcomePage() {
  return (
    <main className="welcome-screen">
      <header className="welcome-header">
        <Link className="welcome-brand" to="/" aria-label="StudyFlow home">
          <span className="welcome-brand-mark">
            <BookOpen size={19} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span>StudyFlow</span>
        </Link>
        <a className="welcome-explore-link" href="#welcome-features">
          A calmer way to study <ArrowDown size={15} aria-hidden="true" />
        </a>
      </header>

      <section className="welcome-hero" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <p className="welcome-eyebrow">
            <span aria-hidden="true" />
            Make space for what matters
          </p>
          <h1 id="welcome-title">
            Make room
            <em>for better learning.</em>
          </h1>
          <p className="welcome-description">
            Plan your study time, stay ahead of deadlines, and build habits that
            move you forward.
          </p>
          <div className="welcome-actions">
            <Link className="welcome-primary-action" to="/dashboard">
              Get Started <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a className="welcome-secondary-action" href="#welcome-features">
              Explore StudyFlow
            </a>
          </div>
          <div className="welcome-reassurance">
            <span className="welcome-reassurance-mark"><Check size={13} aria-hidden="true" /></span>
            <span>A little structure. A lot more breathing room.</span>
          </div>
        </div>

        <div className="welcome-photo">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85"
            alt="Students studying together in a bright university space"
          />
          <div className="welcome-photo-overlay" aria-hidden="true" />
          <div className="welcome-photo-caption">
            <div className="welcome-caption-icon">
              <CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div>
              <span>YOUR SEMESTER, IN BALANCE</span>
              <strong>Make today count.</strong>
            </div>
          </div>
          <span className="welcome-photo-detail" aria-hidden="true">01 / A FRESH START</span>
        </div>
      </section>

      <section className="welcome-features" id="welcome-features" aria-label="How StudyFlow helps">
        <article>
          <span className="welcome-feature-index">01</span>
          <div>
            <h2>See what’s next</h2>
            <p>Keep deadlines in view and give your week a little more shape.</p>
          </div>
        </article>
        <article>
          <span className="welcome-feature-index">02</span>
          <div>
            <h2>Bring it together</h2>
            <p>Keep classes, assignments, and exams connected in one place.</p>
          </div>
        </article>
        <article>
          <span className="welcome-feature-index">03</span>
          <div>
            <h2>Find your focus</h2>
            <p>Build consistent habits without asking for perfect days.</p>
          </div>
        </article>
      </section>

      <footer className="welcome-screen-footer">
        <span>StudyFlow</span>
        <span>Steady progress, at your pace.</span>
      </footer>
    </main>
  )
}
