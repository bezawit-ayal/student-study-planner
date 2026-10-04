import { ArrowRight, BookOpen, GraduationCap } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Onboarding() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: "",
        studentType: "",
        institution: "",
        field: "",
        year: ""
    })

    function handleChange(event) {
        const { name, value } = event.target

        setForm((current) => ({
            ...current,
            [name]: value
        }))
    }

    function handleSubmit(event) {
        event.preventDefault()

        console.log("Student profile:", form)

        navigate("/dashboard")
    }

    return (
        <main className="onboarding-page">

            <nav className="onboarding-nav">

                <div className="brand">
                    <span className="brand-mark">
                        <BookOpen size={18} strokeWidth={1.8} />
                    </span>

                    <span>StudyFlow</span>
                </div>

                <span className="onboarding-step">
                    Getting started · 01 / 01
                </span>

            </nav>

            <section className="onboarding-content">

                <div className="onboarding-intro">

                    <div className="onboarding-icon">
                        <GraduationCap
                            size={22}
                            strokeWidth={1.7}
                        />
                    </div>

                    <p className="onboarding-label">
                        LET'S GET TO KNOW YOU
                    </p>

                    <h1>
                        Tell us a little
                        <br />
                        <em>about yourself.</em>
                    </h1>

                    <p className="onboarding-description">
                        This information helps us shape your study
                        space around your semester. You can change
                        it later from Settings.
                    </p>

                </div>

                <form
                    className="onboarding-form"
                    onSubmit={handleSubmit}
                >

                    <div className="onboarding-field">

                        <label htmlFor="student-name">
                            What should we call you?
                        </label>

                        <input
                            id="student-name"
                            name="name"
                            type="text"
                            placeholder="Your name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="onboarding-field">

                        <label htmlFor="student-type">
                            What kind of student are you?
                        </label>

                        <select
                            id="student-type"
                            name="studentType"
                            value={form.studentType}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Select your student type
                            </option>

                            <option value="high-school">
                                High school
                            </option>

                            <option value="college">
                                College
                            </option>

                            <option value="university">
                                University
                            </option>

                            <option value="vocational">
                                Vocational / technical
                            </option>

                            <option value="other">
                                Other
                            </option>
                        </select>

                    </div>

                    <div className="onboarding-field">

                        <label htmlFor="institution">
                            School or institution
                        </label>

                        <input
                            id="institution"
                            name="institution"
                            type="text"
                            placeholder="Where do you study?"
                            value={form.institution}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="onboarding-row">

                        <div className="onboarding-field">

                            <label htmlFor="field">
                                Field of study
                            </label>

                            <input
                                id="field"
                                name="field"
                                type="text"
                                placeholder="e.g. Computer Science"
                                value={form.field}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="onboarding-field">

                            <label htmlFor="year">
                                Study year
                            </label>

                            <select
                                id="year"
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Select year
                                </option>

                                <option value="1">
                                    1st year
                                </option>

                                <option value="2">
                                    2nd year
                                </option>

                                <option value="3">
                                    3rd year
                                </option>

                                <option value="4">
                                    4th year
                                </option>

                                <option value="5">
                                    5th year
                                </option>

                                <option value="graduate">
                                    Graduate
                                </option>
                            </select>

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="onboarding-submit"
                    >
                        Continue to StudyFlow
                        <ArrowRight size={17} />
                    </button>

                </form>

            </section>

            <footer className="onboarding-footer">
                <span>Your information stays yours.</span>
                <span>StudyFlow</span>
            </footer>

        </main>
    )
}

export default Onboarding