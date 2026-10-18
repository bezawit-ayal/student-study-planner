
import {
    BookOpen,
    CalendarDays,
    ChartNoAxesCombined,
    ClipboardCheck,
    GraduationCap,
    LayoutDashboard,
    Sprout,
    Settings,
    Timer,
    Bell,
} from "lucide-react"

const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "subjects", label: "Subjects", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: ClipboardCheck },
    { id: "exams", label: "Exams", icon: GraduationCap },
    { id: "studyplan", label: "Study Plan", icon: CalendarDays },
    { id: "focustimer", label: "Focus Timer", icon: Timer },
    { id: "progress", label: "Progress", icon: ChartNoAxesCombined },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
];

const pageTitles = Object.fromEntries(
    navigationItems.map(({ id, label }) => [id, label])
);

export default function Sidebar({ activePage, onNavigate }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-mark"><Sprout size={21} strokeWidth={1.8} aria-hidden="true" /></div>
                <div className="brand-copy">
                    <h2>StudyFlow</h2>
                    <span>STUDENT WORKSPACE</span>
                </div>
            </div>

            <div className="sidebar-current-page">
                <span className="sidebar-page-eyebrow">YOUR LEARNING SPACE</span>
                <h1>{pageTitles[activePage] || "Dashboard"}</h1>
            </div>

            <div className="sidebar-navigation-groups">
                <div className="sidebar-section-label">WORKSPACE</div>
                <nav className="sidebar-navigation" aria-label="Main navigation">
                    {navigationItems.slice(0, 7).map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`sidebar-link ${activePage === item.id ? "active" : ""
                                }`}
                            title={item.label}
                            aria-label={item.label}
                            onClick={() => onNavigate(item.id)}
                            aria-current={
                                activePage === item.id ? "page" : undefined
                            }
                        >
                            <item.icon className="sidebar-icon" size={18} strokeWidth={1.8} aria-hidden="true" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-section-label sidebar-bottom-label">
                    PREFERENCES
                </div>
                <nav className="sidebar-navigation" aria-label="Preferences">
                    {navigationItems.slice(7).map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`sidebar-link ${activePage === item.id ? "active" : ""
                                }`}
                            title={item.label}
                            aria-label={item.label}
                            onClick={() => onNavigate(item.id)}
                            aria-current={
                                activePage === item.id ? "page" : undefined
                            }
                        >
                            <item.icon className="sidebar-icon" size={18} strokeWidth={1.8} aria-hidden="true" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="sidebar-footer">
                <span className="sidebar-footer-line" />
                <span>Make room for what matters.</span>
            </div>
        </aside>
    );
}
