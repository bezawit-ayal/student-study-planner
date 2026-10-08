import {
    ArrowRight,
    LockKeyhole,
    Mail,
    User
} from "lucide-react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import AuthLayout from "../components/auth/auth-layout"

function SignUp() {
    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    function handleSubmit(event) {
        event.preventDefault()

        setError("")

        const trimmedName = name.trim()
        const trimmedEmail = email.trim().toLowerCase()

        if (password.length < 8) {
            setError("Password must be at least 8 characters.")
            return
        }

        const existingUser = JSON.parse(
            localStorage.getItem("studyflow-user")
        )

        if (
            existingUser &&
            existingUser.email === trimmedEmail
        ) {
            setError("An account with this email already exists.")
            return
        }

        const user = {
            name: trimmedName,
            email: trimmedEmail,
            password: password
        }

        localStorage.setItem(
            "studyflow-user",
            JSON.stringify(user)
        )

        navigate("/sign-in")
    }

    return (
        <AuthLayout
            title="Create your account."
            description="Start organizing your semester in one simple place."
        >
            <form
                className="auth-form"
                onSubmit={handleSubmit}
            >
                <div className="form-field">
                    <label htmlFor="name">
                        Full name
                    </label>

                    <div className="input-wrapper">
                        <User size={17} />

                        <input
                            id="name"
                            type="text"
                            placeholder="Your full name"
                            autoComplete="name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                        />
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="email">
                        Email address
                    </label>

                    <div className="input-wrapper">
                        <Mail size={17} />

                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="password">
                        Password
                    </label>

                    <div className="input-wrapper">
                        <LockKeyhole size={17} />

                        <input
                            id="password"
                            type="password"
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            minLength={8}
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    <span className="field-hint">
                        Use at least 8 characters.
                    </span>
                </div>

                {error && (
                    <p className="auth-error">
                        {error}
                    </p>
                )}

                <label className="terms">
                    <input
                        type="checkbox"
                        required
                    />

                    <span>
                        I agree to the StudyFlow terms and
                        privacy policy.
                    </span>
                </label>

                <button
                    type="submit"
                    className="auth-submit"
                >
                    Create account
                    <ArrowRight size={17} />
                </button>
            </form>

            <div className="auth-switch">
                <span>
                    Already have an account?
                </span>

                <Link to="/sign-in">
                    Sign in
                </Link>
            </div>
        </AuthLayout>
    )

}

export default SignUp
