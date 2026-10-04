import {
    ArrowRight,
    LockKeyhole,
    Mail,
    User
} from "lucide-react"

import { Link } from "react-router-dom"

import AuthLayout from "../components/auth/auth-layout"

function SignUp() {

    function handleSubmit(event) {
        event.preventDefault()

        console.log("Sign up submitted")
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
                            required
                        />

                    </div>

                    <span className="field-hint">
                        Use at least 8 characters.
                    </span>

                </div>

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