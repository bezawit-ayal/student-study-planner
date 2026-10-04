import { ArrowUpRight, BookOpen, CalendarDays, Check } from "lucide-react"
import { Link } from "react-router-dom"

function Welcome() {
    return (
        <main className="welcome-page">

            <nav className="welcome-nav">

                <Link to="/" className="brand">
                    <span className="brand-mark">
                        <BookOpen size={18} strokeWidth={1.8} />
                    </span>

                    <span>StudyFlow</span>
                </Link>

                <div className="nav-right">
                    <span className="nav-question">
                        Already studying with us?
                    </span>

                    <Link to="/sign-in" className="nav-link">
                        Sign in
                    </Link>
                </div>

            </nav>

            <section className="hero">

                <div className="hero-copy">

                    <p className="hero-label">
                        <span></span>
                        A study planner for students
                    </p>

                    <h1>
                        Make room
                        <br />
                        <em>for learning.</em>
                    </h1>

                    <p className="hero-description">
                        Keep your classes, assignments, exams, and
                        study time together. StudyFlow helps you
                        decide what matters today and what can wait.
                    </p>

                    <div className="hero-actions">

                        <Link to="/sign-up" className="start-link">
                            Create your study plan
                            <ArrowUpRight size={18} />
                        </Link>

                        <span className="no-card">
                            Free to get started
                        </span>

                    </div>

                </div>

                <div className="hero-image">

                    <img
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85"
                        alt="Students studying together"
                    />

                    <div className="image-note">
                        <div className="note-icon">
                            <Check size={16} />
                        </div>

                        <div>
                            <strong>One place for your semester</strong>
                            <span>Classes · tasks · exams · focus</span>
                        </div>
                    </div>

                </div>

            </section>

            <section className="simple-features">

                <div className="feature-item">
                    <CalendarDays size={20} strokeWidth={1.6} />

                    <div>
                        <strong>Know what's next</strong>
                        <span>See upcoming deadlines before they become stressful.</span>
                    </div>
                </div>

                <div className="feature-item">
                    <BookOpen size={20} strokeWidth={1.6} />

                    <div>
                        <strong>Keep subjects together</strong>
                        <span>Organize everything around the classes you take.</span>
                    </div>
                </div>

                <div className="feature-item">

                    <div className="number">
                        01
                    </div>

                    <div>
                        <strong>Start with today</strong>
                        <span>Focus on the work in front of you.</span>
                    </div>

                </div>

            </section>

            <footer className="welcome-footer">
                <span>StudyFlow</span>
                <span>Built for students who want less chaos.</span>
            </footer>

        </main>
    )
}

export default Welcome