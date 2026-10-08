import { useEffect, useRef, useState } from "react"
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock3,
    ImagePlus,
    Mail,
    Pencil,
    Save,
    User,
    X
} from "lucide-react"

import "./profile.css"

function Profile({ subjects = [], onBack }) {
    const fileInputRef = useRef(null)

    const [savedUser, setSavedUser] = useState(null)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [profilePhoto, setProfilePhoto] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        const storedUser = JSON.parse(
            localStorage.getItem("studyflow-user") || "null"
        )

        if (storedUser) {
            setSavedUser(storedUser)
            setName(storedUser.name || "")
            setEmail(storedUser.email || "")
            setProfilePhoto(storedUser.profilePhoto || "")
        }
    }, [])

    const totalSubjects = subjects.length

    const totalAssignments = subjects.reduce(
        (total, subject) =>
            total + (subject.assignments?.length || 0),
        0
    )

    const completedAssignments = subjects.reduce(
        (total, subject) =>
            total +
            (subject.assignments || []).filter(
                (assignment) => assignment.completed
            ).length,
        0
    )

    const totalSessions = subjects.reduce(
        (total, subject) =>
            total + (subject.studySessions?.length || 0),
        0
    )

    const completedSessions = subjects.reduce(
        (total, subject) =>
            total +
            (subject.studySessions || []).filter(
                (session) => session.completed
            ).length,
        0
    )

    const initials =
        name.trim().length > 0
            ? name.trim().charAt(0).toUpperCase()
            : "U"

    function handleEdit() {
        setName(savedUser?.name || "")
        setEmail(savedUser?.email || "")
        setProfilePhoto(savedUser?.profilePhoto || "")
        setError("")
        setSuccess("")
        setIsEditing(true)
    }

    function handleCancel() {
        setName(savedUser?.name || "")
        setEmail(savedUser?.email || "")
        setProfilePhoto(savedUser?.profilePhoto || "")
        setError("")
        setSuccess("")
        setIsEditing(false)
    }

    function handlePhotoClick() {
        fileInputRef.current?.click()
    }

    function handlePhotoChange(event) {
        const file = event.target.files?.[0]

        if (!file) {
            return
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file.")
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Please choose an image smaller than 2MB.")
            return
        }

        const reader = new FileReader()

        reader.onload = () => {
            setProfilePhoto(reader.result)
            setError("")
            setSuccess("")
        }

        reader.readAsDataURL(file)

        event.target.value = ""
    }

    function handleRemovePhoto() {
        setProfilePhoto("")
        setError("")
        setSuccess("")
    }

    function handleSave() {
        const trimmedName = name.trim()
        const trimmedEmail = email.trim().toLowerCase()

        setError("")
        setSuccess("")

        if (!trimmedName) {
            setError("Please enter your name.")
            return
        }

        if (!trimmedEmail) {
            setError("Please enter your email address.")
            return
        }

        if (!trimmedEmail.includes("@")) {
            setError("Please enter a valid email address.")
            return
        }

        const updatedUser = {
            ...(savedUser || {}),
            name: trimmedName,
            email: trimmedEmail,
            profilePhoto: profilePhoto || ""
        }

        localStorage.setItem(
            "studyflow-user",
            JSON.stringify(updatedUser)
        )

        setSavedUser(updatedUser)
        setName(trimmedName)
        setEmail(trimmedEmail)
        setProfilePhoto(profilePhoto || "")
        setSuccess("Profile updated successfully.")
        setIsEditing(false)
    }

    return (
        <section className="profile-page">
            <button
                className="profile-back-button"
                type="button"
                onClick={onBack}
            >
                <ArrowLeft size={17} />
                <span>Back to study plan</span>
            </button>

            <div className="profile-header">
                <div className="profile-header-content">
                    <div className="profile-photo-section">
                        <div className="profile-avatar">
                            {profilePhoto ? (
                                <img
                                    src={profilePhoto}
                                    alt="Profile"
                                />
                            ) : (
                                initials
                            )}
                        </div>

                        {isEditing && (
                            <div className="profile-photo-actions">
                                <button
                                    type="button"
                                    className="profile-photo-button"
                                    onClick={handlePhotoClick}
                                >
                                    <ImagePlus size={15} />
                                    <span>
                                        {profilePhoto
                                            ? "Change photo"
                                            : "Add photo"}
                                    </span>
                                </button>

                                {profilePhoto && (
                                    <button
                                        type="button"
                                        className="profile-remove-photo"
                                        onClick={handleRemovePhoto}
                                    >
                                        Remove
                                    </button>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    hidden
                                />
                            </div>
                        )}
                    </div>

                    <div className="profile-header-info">
                        <span className="profile-eyebrow">
                            My Profile
                        </span>

                        <h1>
                            {savedUser?.name || "Student"}
                        </h1>

                        <p>
                            Manage your personal information
                            and study activity.
                        </p>
                    </div>
                </div>

                {!isEditing && (
                    <button
                        className="profile-edit-button"
                        type="button"
                        onClick={handleEdit}
                    >
                        <Pencil size={16} />
                        <span>Edit Profile</span>
                    </button>
                )}
            </div>

            {success && (
                <div className="profile-success">
                    <CheckCircle2 size={17} />
                    <span>{success}</span>
                </div>
            )}

            {error && (
                <div className="profile-error">
                    <X size={17} />
                    <span>{error}</span>
                </div>
            )}

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-card-header">
                        <div>
                            <h2>Personal information</h2>
                            <p>
                                Your basic account details
                            </p>
                        </div>

                        <div className="profile-card-icon">
                            <User size={18} />
                        </div>
                    </div>

                    <div className="profile-information">
                        <div className="profile-field">
                            <label htmlFor="profile-name">
                                Full name
                            </label>

                            {isEditing ? (
                                <div className="profile-input-wrapper">
                                    <User size={17} />

                                    <input
                                        id="profile-name"
                                        type="text"
                                        value={name}
                                        onChange={(event) =>
                                            setName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your name"
                                    />
                                </div>
                            ) : (
                                <div className="profile-value">
                                    <User size={17} />

                                    <span>
                                        {savedUser?.name ||
                                            "Not set"}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-email">
                                Email address
                            </label>

                            {isEditing ? (
                                <div className="profile-input-wrapper">
                                    <Mail size={17} />

                                    <input
                                        id="profile-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your email"
                                    />
                                </div>
                            ) : (
                                <div className="profile-value">
                                    <Mail size={17} />

                                    <span>
                                        {savedUser?.email ||
                                            "Not set"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="profile-edit-actions">
                            <button
                                className="profile-cancel-button"
                                type="button"
                                onClick={handleCancel}
                            >
                                <X size={16} />
                                <span>Cancel</span>
                            </button>

                            <button
                                className="profile-save-button"
                                type="button"
                                onClick={handleSave}
                            >
                                <Save size={16} />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="profile-card">
                    <div className="profile-card-header">
                        <div>
                            <h2>Study statistics</h2>
                            <p>
                                A quick overview of your study
                                activity
                            </p>
                        </div>

                        <div className="profile-card-icon">
                            <BookOpen size={18} />
                        </div>
                    </div>

                    <div className="profile-stat-grid">
                        <div className="profile-stat">
                            <div className="profile-stat-icon">
                                <BookOpen size={18} />
                            </div>

                            <div>
                                <strong>
                                    {totalSubjects}
                                </strong>

                                <span>Subjects</span>
                            </div>
                        </div>

                        <div className="profile-stat">
                            <div className="profile-stat-icon">
                                <CheckCircle2 size={18} />
                            </div>

                            <div>
                                <strong>
                                    {completedAssignments}
                                </strong>

                                <span>
                                    Completed assignments
                                </span>
                            </div>
                        </div>

                        <div className="profile-stat">
                            <div className="profile-stat-icon">
                                <Clock3 size={18} />
                            </div>

                            <div>
                                <strong>
                                    {completedSessions}
                                </strong>

                                <span>
                                    Completed sessions
                                </span>
                            </div>
                        </div>

                        <div className="profile-stat">
                            <div className="profile-stat-icon">
                                <BookOpen size={18} />
                            </div>

                            <div>
                                <strong>
                                    {totalAssignments}
                                </strong>

                                <span>
                                    Total assignments
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Profile