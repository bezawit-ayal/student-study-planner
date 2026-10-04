import {
    ArrowRight,
    LockKeyhole,
    Mail
} from "lucide-react"

import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import AuthLayout from "../components/auth/auth-layout"

function SignIn() {

    const navigate = useNavigate()
    function handleSubmit(event) {
        event.preventDefault()

        console.log("Sign in submitted")

        navigate("/onboarding")
    }

    return (
        <AuthLayout
            title="Welcome back."
            description="Sign in to continue planning your semester."
        >

            <form
                className="auth-form"
                onSubmit={handleSubmit}
            >

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
                            required
                        />

                    </div>

                </div>

                <div className="form-field">

                    <div className="password-label">

                        <label htmlFor="password">
                            Password
                        </label>

                        <button
                            type="button"
                            className="forgot-password"
                            onClick={() => {
                                console.log("Forgot password")
                            }}
                        >
                            Forgot password?
                        </button>

                    </div>

                    <div className="input-wrapper">

                        <LockKeyhole size={17} />

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />

                    </div>

                </div>

                <button
                    type="submit"
                    className="auth-submit"
                >
                    Sign in
                    <ArrowRight size={17} />
                </button>

            </form>

            <div className="auth-switch">

                <span>
                    Don't have an account?
                </span>

                <Link to="/sign-up">
                    Create one
                </Link>

            </div>

        </AuthLayout>
    )
}

export default SignIn