import { ArrowLeft, BookOpen } from "lucide-react"
import { Link } from "react-router-dom"

function AuthLayout({ children, title, description }) {
    return (
        <main className="auth-page">

            <nav className="auth-nav">

                <Link to="/" className="brand">
                    <span className="brand-mark">
                        <BookOpen size={18} strokeWidth={1.8} />
                    </span>

                    <span>StudyFlow</span>
                </Link>

                <Link to="/" className="back-link">
                    <ArrowLeft size={16} />
                    Back to home
                </Link>

            </nav>

            <section className="auth-main">

                <div className="auth-form-area">

                    <div className="auth-heading">

                        <p className="auth-label">
                            GET STARTED
                        </p>

                        <h1>{title}</h1>

                        <p>{description}</p>

                    </div>

                    {children}

                </div>

                <aside className="auth-side">

                    <div className="auth-side-image">
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85"
                            alt="Students studying together"
                        />
                    </div>

                    <div className="auth-side-copy">

                        <span>
                            STUDYFLOW
                        </span>

                        <h2>
                            A little
                            <br />
                            <em>organization</em>
                            <br />
                            goes a long way.
                        </h2>

                        <p>
                            Start by telling us who you are.
                            We'll help you build a study space
                            that fits the way you learn.
                        </p>

                    </div>

                </aside>

            </section>

        </main>
    )
}

export default AuthLayout