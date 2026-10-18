const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });

    let result;
    try {
        result = await response.json();
    } catch (error) {
        if (error.name === "AbortError") throw error;
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
    }

    if (!result.success) {
        throw new Error(result.message || "The request could not be completed.");
    }

    return result.data;
}

// Subjects
export function getSubjects(options) {
    return request("/subjects", options);
}

export function createSubject(data) {
    return request("/subjects", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateSubject(id, data) {
    return request(`/subjects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function deleteSubject(id) {
    return request(`/subjects/${id}`, {
        method: "DELETE",
    });
}

// Assignments, exams, and study sessions
export function createSubjectItem(subjectId, resource, data) {
    return request(`/subjects/${subjectId}/${resource}`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateSubjectItem(subjectId, resource, itemId, data) {
    return request(`/subjects/${subjectId}/${resource}/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function deleteSubjectItem(subjectId, resource, itemId) {
    return request(`/subjects/${subjectId}/${resource}/${itemId}`, {
        method: "DELETE",
    });
}

// Focus sessions
export function getFocusSessions(options) {
    return request("/focus-sessions", options);
}

export function createFocusSession(data) {
    return request("/focus-sessions", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// Notifications
export function getNotifications(options) {
    return request("/notifications", options);
}

export function createNotification(data) {
    return request("/notifications", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateNotification(id, data) {
    return request(`/notifications/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function deleteNotification(id) {
    return request(`/notifications/${id}`, {
        method: "DELETE",
    });
}

// Basic profiles are persistent user records, not authenticated accounts.
export function getProfile(id, options) {
    return request(`/users/${encodeURIComponent(id)}`, options);
}

export function createProfile(data) {
    return request("/users", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateProfile(id, data) {
    return request(`/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}