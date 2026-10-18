const pages = {
  assignments: {
    title: "Assignments",
    description: "Assignment management will be built around the subject data model.",
  },
  exams: {
    title: "Exams",
    description: "Review and manage exams associated with your subjects.",
  },
  studyplan: {
    title: "Study Plan",
    description: "Plan study sessions and connect them to your subjects.",
  },
  focustimer: {
    title: "Focus Timer",
    description: "A focus timer and session history will be added in this workspace.",
  },
  progress: {
    title: "Progress",
    description: "Progress summaries will be calculated from your saved activities.",
  },
  notifications: {
    title: "Notifications",
    description: "Your reminders and notifications will appear here.",
  },
  settings: {
    title: "Profile & Settings",
    description: "Account details are not connected because authentication is not implemented.",
  },
}

export default function WorkspacePlaceholder({ page }) {
  const content = pages[page] || pages.settings

  return (
    <section className="workspace-placeholder">
      <p className="section-eyebrow">YOUR WORKSPACE</p>
      <h2>{content.title}</h2>
      <p className="page-description">{content.description}</p>
      <span className="coming-soon-badge">Feature not yet implemented</span>
    </section>
  )
}
