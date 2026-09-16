const SIDEBAR_API_BASE = "http://192.168.1.13:8000";

let sidebarUser = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    await loadSidebar();
});


/* =========================================================
   LOAD SIDEBAR
========================================================= */

async function loadSidebar() {

    const sidebarContainer =
        document.getElementById("sidebar");

    if (!sidebarContainer) {
        console.error("Sidebar container not found");
        return;
    }

    try {

        sidebarUser =
            await getCurrentUser();

        renderSidebar(sidebarUser);

    } catch (error) {

        console.error(
            "Sidebar loading error:",
            error
        );

        sidebarContainer.innerHTML = `
            <aside class="app-sidebar">

                <div class="sidebar-brand">
                    <div class="brand-logo">IF</div>

                    <div>
                        <div class="brand-name">
                            InnovFund
                        </div>

                        <div class="brand-subtitle">
                            Innovation Intelligence
                        </div>
                    </div>
                </div>

                <div class="sidebar-error">
                    Unable to load user information.
                </div>

            </aside>
        `;
    }
}


/* =========================================================
   GET CURRENT USER
========================================================= */

async function getCurrentUser() {

    /* -----------------------------------------
       1. AUTH USER
    ----------------------------------------- */

    const meResponse = await fetch(
        `${SIDEBAR_API_BASE}/api/auth/me`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!meResponse.ok) {

        window.location.href = "/auth/login.html";

        throw new Error(
            "Authentication failed"
        );
    }

    const meUser =
        await meResponse.json();


    /* -----------------------------------------
       2. FULL USER INFORMATION
    ----------------------------------------- */

    const userResponse = await fetch(
        `${SIDEBAR_API_BASE}/api/users/email/${encodeURIComponent(meUser.email)}`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!userResponse.ok) {
        throw new Error(
            "Unable to fetch user information"
        );
    }

    const user =
        await userResponse.json();


    console.log(
        "User information:",
        user
    );


    /* -----------------------------------------
       3. RESEARCH PROFILE

       IMPORTANT:
       Use user.user_id

       NOT user._id
    ----------------------------------------- */

    if (user.user_id) {

        const profileResponse =
            await fetch(
                `${SIDEBAR_API_BASE}/api/research-profiles/${encodeURIComponent(user.user_id)}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (profileResponse.ok) {

            user.researchProfile =
                await profileResponse.json();

            console.log(
                "Research profile:",
                user.researchProfile
            );

        }

        else if (
            profileResponse.status === 404
        ) {

            console.log(
                "Research profile does not exist"
            );

            user.researchProfile = null;

        }

        else {

            console.warn(
                "Research profile request failed:",
                profileResponse.status
            );

            user.researchProfile = null;
        }

    } else {

        user.researchProfile = null;

    }


    /* -----------------------------------------
       4. GET ROLE
    ----------------------------------------- */

    const rolesResponse =
        await fetch(
            `${SIDEBAR_API_BASE}/api/roles/get`,
            {
                method: "GET",
                credentials: "include"
            }
        );


    if (rolesResponse.ok) {

        const roles =
            await rolesResponse.json();


        const role =
            roles.find(
                r =>
                    String(r._id) ===
                    String(user.role_id)
            );


        user.roleName =
            role
                ? role.name
                : "Unknown";


        user.roleCode =
            role
                ? role.code
                : "";


        user.roleId =
            role
                ? role.roleId
                : user.role_id;

    } else {

        user.roleName = "Unknown";
        user.roleCode = "";
        user.roleId = user.role_id;

    }


    return user;
}


/* =========================================================
   RENDER SIDEBAR
========================================================= */

function renderSidebar(user) {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const initials =
        getInitials(user.name);


    sidebar.innerHTML = `

        <aside class="app-sidebar">

            <!-- BRAND -->

            <div class="sidebar-brand">

                <div class="brand-logo">
                    IF
                </div>

                <div class="brand-text">

                    <div class="brand-name">
                        InnovFund
                    </div>

                    <div class="brand-subtitle">
                        Innovation Intelligence
                    </div>

                </div>

            </div>


            <!-- NAVIGATION -->

            <nav class="sidebar-navigation">

                <a
                    href="#overview"
                    class="sidebar-item active"
                    onclick="setActiveSidebar(this)"
                >
                    <span class="sidebar-icon">
                        ◉
                    </span>

                    <span>
                        Overview
                    </span>
                </a>


                <a
                    href="#funding"
                    class="sidebar-item"
                    onclick="setActiveSidebar(this)"
                >
                    <span class="sidebar-icon">
                        $
                    </span>

                    <span>
                        Funding
                    </span>
                </a>


                <a
                    href="#trends"
                    class="sidebar-item"
                    onclick="setActiveSidebar(this)"
                >
                    <span class="sidebar-icon">
                        ↗
                    </span>

                    <span>
                        Research Trends
                    </span>
                </a>


                <a
                    href="#publications"
                    class="sidebar-item"
                    onclick="setActiveSidebar(this)"
                >
                    <span class="sidebar-icon">
                        ≡
                    </span>

                    <span>
                        Publications
                    </span>
                </a>


                <a
                    href="#patents"
                    class="sidebar-item"
                    onclick="setActiveSidebar(this)"
                >
                    <span class="sidebar-icon">
                        ◇
                    </span>

                    <span>
                        Patents
                    </span>
                </a>


                <a
                    href="#innovation"
                    class="sidebar-item"
                    onclick="setActiveSidebar(this)"
                >
                    <span class="sidebar-icon">
                        ★
                    </span>

                    <span>
                        Innovation Score
                    </span>
                </a>

            </nav>


            <!-- USER -->

            <div class="sidebar-bottom">

                <button
                    class="sidebar-profile"
                    onclick="openProfileModal()"
                >

                    <div class="profile-avatar">
                        ${escapeHTML(initials)}
                    </div>


                    <div class="profile-details">

                        <strong>
                            ${escapeHTML(user.name || "User")}
                        </strong>

                        <span>
                            ${escapeHTML(
                                user.roleName || "User"
                            )}
                        </span>

                    </div>


                    <span class="profile-arrow">
                        ›
                    </span>

                </button>


                <button
                    class="sidebar-logout"
                    onclick="logoutUser()"
                >

                    <span>
                        ↪
                    </span>

                    Logout

                </button>

            </div>

        </aside>


        <!-- PROFILE MODAL -->

        <div
            id="profileModal"
            class="profile-modal"
            onclick="closeProfileOutside(event)"
        >

            <div class="profile-modal-box">

                <div class="profile-modal-header">

                    <div>

                        <h2>
                            Profile
                        </h2>

                        <p>
                            Manage your account and research information
                        </p>

                    </div>

                    <button
                        class="profile-close"
                        onclick="closeProfileModal()"
                    >
                        ×
                    </button>

                </div>


                <div
                    id="profileContent"
                    class="profile-content"
                ></div>

            </div>

        </div>

    `;
}


/* =========================================================
   OPEN PROFILE
========================================================= */

function openProfileModal() {

    if (!sidebarUser) {
        return;
    }


    const modal =
        document.getElementById(
            "profileModal"
        );


    const content =
        document.getElementById(
            "profileContent"
        );


    content.innerHTML =
        buildProfileForm(
            sidebarUser
        );


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );
}


/* =========================================================
   CLOSE PROFILE
========================================================= */

function closeProfileModal() {

    const modal =
        document.getElementById(
            "profileModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "modal-open"
    );
}


function closeProfileOutside(event) {

    if (
        event.target.id ===
        "profileModal"
    ) {

        closeProfileModal();

    }
}


/* =========================================================
   BUILD PROFILE FORM
========================================================= */

function buildProfileForm(user) {

    const profile =
        user.researchProfile;


    return `

        <form
            id="profileForm"
            onsubmit="saveProfile(event)"
        >

            <!-- =========================================
                 ACCOUNT INFORMATION
            ========================================== -->

            <div class="profile-section">

                <div class="profile-section-title">
                    Account Information
                </div>


                <div class="profile-grid">

                    <div class="profile-field">

                        <label>
                            Name
                        </label>

                        <input
                            id="profileName"
                            type="text"
                            value="${escapeAttribute(
                                user.name || ""
                            )}"
                            required
                        >

                    </div>


                    <div class="profile-field">

                        <label>
                            Email
                        </label>

                        <input
                            id="profileEmail"
                            type="email"
                            value="${escapeAttribute(
                                user.email || ""
                            )}"
                            required
                        >

                    </div>


                    <div class="profile-field">

                        <label>
                            User ID
                        </label>

                        <input
                            type="text"
                            value="${escapeAttribute(
                                user.user_id || ""
                            )}"
                            disabled
                        >

                    </div>


                    <div class="profile-field">

                        <label>
                            Role
                        </label>

                        <input
                            type="text"
                            value="${escapeAttribute(
                                user.roleName || "Unknown"
                            )}"
                            disabled
                        >

                    </div>


                    <div class="profile-field">

                        <label>
                            Account Status
                        </label>

                        <input
                            type="text"
                            value="${
                                user.is_active
                                    ? "Active"
                                    : "Inactive"
                            }"
                            disabled
                        >

                    </div>


                    <div class="profile-field">

                        <label>
                            Last Active
                        </label>

                        <input
                            type="text"
                            value="${escapeAttribute(
                                formatDate(
                                    user.updated_at
                                )
                            )}"
                            disabled
                        >

                    </div>


                    <div class="profile-field">

                        <label>
                            Created At
                        </label>

                        <input
                            type="text"
                            value="${escapeAttribute(
                                formatDate(
                                    user.created_at
                                )
                            )}"
                            disabled
                        >

                    </div>


                    <div class="profile-field">

                        <label>
                            Updated At
                        </label>

                        <input
                            type="text"
                            value="${escapeAttribute(
                                formatDate(
                                    user.updated_at
                                )
                            )}"
                            disabled
                        >

                    </div>

                </div>

            </div>


            <!-- =========================================
                 PASSWORD
            ========================================== -->

            <div class="profile-section">

                <div class="profile-section-title">
                    Password
                </div>


                <div class="profile-grid">

                    <div class="profile-field">

                        <label>
                            New Password
                        </label>

                        <input
                            id="profilePassword"
                            type="password"
                            placeholder="Leave blank to keep current password"
                        >

                    </div>

                </div>

            </div>


            <!-- =========================================
                 RESEARCH PROFILE
            ========================================== -->

            <div class="profile-section">

                <div class="profile-section-header">

                    <div>

                        <div class="profile-section-title">
                            Research Profile
                        </div>

                        ${
                            profile
                                ? `
                                    <p class="profile-section-description">
                                        Your research information.
                                    </p>
                                  `
                                : `
                                    <p class="profile-section-description warning-text">
                                        No research profile found. Create one to add more information.
                                    </p>
                                  `
                        }

                    </div>

                </div>


                <div class="profile-grid">

                    <!-- ORGANIZATION -->

                    <div class="profile-field">

                        <label>
                            Organization
                        </label>

                        <input
                            id="researchOrganization"
                            type="text"
                            value="${escapeAttribute(
                                profile?.organization || ""
                            )}"
                            placeholder="Enter organization"
                        >

                    </div>


                    <!-- DEPARTMENT -->

                    <div class="profile-field">

                        <label>
                            Department
                        </label>

                        <input
                            id="researchDepartment"
                            type="text"
                            value="${escapeAttribute(
                                profile?.department || ""
                            )}"
                            placeholder="Enter department"
                        >

                    </div>


                    <!-- DESIGNATION -->

                    <div class="profile-field">

                        <label>
                            Designation
                        </label>

                        <input
                            id="researchDesignation"
                            type="text"
                            value="${escapeAttribute(
                                profile?.designation || ""
                            )}"
                            placeholder="Enter designation"
                        >

                    </div>


                    <!-- COUNTRY -->

                    <div class="profile-field">

                        <label>
                            Country
                        </label>

                        <input
                            id="researchCountry"
                            type="text"
                            value="${escapeAttribute(
                                profile?.country || ""
                            )}"
                            placeholder="Enter country"
                        >

                    </div>

                </div>


                <!-- =====================================
                     RESEARCH DOMAINS
                ====================================== -->

                <div class="checkbox-section">

                    <label class="checkbox-title">
                        Research Domains
                    </label>

                    <div class="checkbox-grid">

                        ${createCheckboxes(
                            "researchDomains",
                            RESEARCH_DOMAINS,
                            profile?.research_domains || []
                        )}

                    </div>

                </div>


                <!-- =====================================
                     KEYWORDS
                ====================================== -->

                <div class="checkbox-section">

                    <label class="checkbox-title">
                        Keywords
                    </label>

                    <div class="checkbox-grid">

                        ${createCheckboxes(
                            "keywords",
                            RESEARCH_KEYWORDS,
                            profile?.keywords || []
                        )}

                    </div>

                </div>


                <!-- =====================================
                     TECHNOLOGY AREAS
                ====================================== -->

                <div class="checkbox-section">

                    <label class="checkbox-title">
                        Technology Areas
                    </label>

                    <div class="checkbox-grid">

                        ${createCheckboxes(
                            "technologyAreas",
                            TECHNOLOGY_AREAS,
                            profile?.technology_areas || []
                        )}

                    </div>

                </div>

            </div>


            <!-- =========================================
                 MESSAGE
            ========================================== -->

            <div
                id="profileMessage"
                class="profile-message"
            ></div>


            <!-- =========================================
                 ACTIONS
            ========================================== -->

            <div class="profile-actions">

                <button
                    type="button"
                    class="profile-cancel-btn"
                    onclick="closeProfileModal()"
                >
                    Cancel
                </button>


                <button
                    type="submit"
                    class="profile-save-btn"
                    id="profileSaveButton"
                >
                    ${
                        profile
                            ? "Save Changes"
                            : "Create Research Profile"
                    }
                </button>

            </div>

        </form>

    `;
}


/* =========================================================
   CHECKBOX OPTIONS
========================================================= */

const RESEARCH_DOMAINS = [

    "Artificial Intelligence",

    "Machine Learning",

    "Deep Learning",

    "Computer Vision",

    "Natural Language Processing",

    "Data Science",

    "Cybersecurity",

    "Internet of Things",

    "Robotics",

    "Cloud Computing",

    "Edge Computing",

    "Blockchain",

    "Healthcare Technology",

    "Renewable Energy",

    "Agriculture Technology"

];


const RESEARCH_KEYWORDS = [

    "Artificial Intelligence",

    "Machine Learning",

    "Deep Learning",

    "Neural Networks",

    "Computer Vision",

    "Natural Language Processing",

    "Generative AI",

    "Large Language Models",

    "Data Analytics",

    "Big Data",

    "Cybersecurity",

    "IoT",

    "Cloud Computing",

    "Edge Computing",

    "Blockchain",

    "Robotics",

    "Automation",

    "Digital Transformation",

    "Smart Systems"

];


const TECHNOLOGY_AREAS = [

    "AI / ML",

    "Generative AI",

    "Computer Vision",

    "NLP",

    "Robotics",

    "IoT",

    "Cloud Computing",

    "Edge Computing",

    "Cybersecurity",

    "Blockchain",

    "Big Data",

    "Digital Twin",

    "AR / VR",

    "5G / 6G",

    "Quantum Computing",

    "Biotechnology",

    "Renewable Energy",

    "Smart Agriculture",

    "Healthcare Technology"

];


/* =========================================================
   CREATE CHECKBOXES
========================================================= */

function createCheckboxes(
    groupName,
    options,
    selectedValues
) {

    if (
        !Array.isArray(selectedValues)
    ) {

        selectedValues = [];

    }


    return options
        .map(
            (option, index) => {

                const checked =
                    selectedValues.some(
                        value =>
                            String(value)
                                .toLowerCase() ===
                            String(option)
                                .toLowerCase()
                    );


                return `

                    <label class="checkbox-option">

                        <input
                            type="checkbox"
                            name="${groupName}"
                            value="${escapeAttribute(option)}"
                            ${checked ? "checked" : ""}
                        >

                        <span class="checkbox-custom">
                        </span>

                        <span class="checkbox-label">
                            ${escapeHTML(option)}
                        </span>

                    </label>

                `;

            }
        )
        .join("");
}


/* =========================================================
   SAVE PROFILE
========================================================= */

async function saveProfile(event) {

    event.preventDefault();


    if (!sidebarUser) {

        showProfileMessage(
            "User information is unavailable.",
            true
        );

        return;

    }


    const button =
        document.getElementById(
            "profileSaveButton"
        );


    const message =
        document.getElementById(
            "profileMessage"
        );


    button.disabled = true;

    button.textContent =
        "Saving...";

    message.textContent = "";


    try {

        /* =========================================
           BASIC USER INFORMATION
        ========================================== */

        const name =
            document
                .getElementById(
                    "profileName"
                )
                .value
                .trim();


        const email =
            document
                .getElementById(
                    "profileEmail"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "profilePassword"
                )
                .value
                .trim();


        if (!name || !email) {

            throw new Error(
                "Name and email are required."
            );

        }


        /* =========================================
           UPDATE USER

           IMPORTANT:
           User update uses MongoDB _id
        ========================================== */

        const userPayload = {

            name: name,

            email: email

        };


        if (password) {

            userPayload.password =
                password;

        }


        const userUpdateResponse =
            await fetch(
                `${SIDEBAR_API_BASE}/api/users/${encodeURIComponent(sidebarUser._id)}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify(
                            userPayload
                        )

                }
            );


        if (!userUpdateResponse.ok) {

            const errorData =
                await safeJson(
                    userUpdateResponse
                );


            throw new Error(
                errorData?.detail ||
                "Unable to update user information."
            );

        }


        /* =========================================
           RESEARCH PROFILE DATA
        ========================================== */

        const organization =
            document
                .getElementById(
                    "researchOrganization"
                )
                .value
                .trim();


        const department =
            document
                .getElementById(
                    "researchDepartment"
                )
                .value
                .trim();


        const designation =
            document
                .getElementById(
                    "researchDesignation"
                )
                .value
                .trim();


        const country =
            document
                .getElementById(
                    "researchCountry"
                )
                .value
                .trim();


        const researchDomains =
            getSelectedCheckboxes(
                "researchDomains"
            );


        const keywords =
            getSelectedCheckboxes(
                "keywords"
            );


        const technologyAreas =
            getSelectedCheckboxes(
                "technologyAreas"
            );


        const researchPayload = {

            user_id:
                sidebarUser.user_id,

            organization:
                organization,

            department:
                department,

            designation:
                designation,

            country:
                country,

            research_domains:
                researchDomains,

            keywords:
                keywords,

            technology_areas:
                technologyAreas

        };


        /* =========================================
           CREATE RESEARCH PROFILE
        ========================================== */

        if (!sidebarUser.researchProfile) {

            const createResponse =
                await fetch(
                    `${SIDEBAR_API_BASE}/api/research-profiles`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body:
                            JSON.stringify(
                                researchPayload
                            )

                    }
                );


            if (!createResponse.ok) {

                const errorData =
                    await safeJson(
                        createResponse
                    );


                throw new Error(
                    errorData?.detail ||
                    "Unable to create research profile."
                );

            }


            const createdProfile =
                await createResponse.json();


            sidebarUser.researchProfile =
                createdProfile;

        }


        /* =========================================
           EXISTING RESEARCH PROFILE

           No PUT endpoint was provided yet.

           Therefore we don't send a fake
           update request here.
        ========================================== */


        /* =========================================
           UPDATE LOCAL USER
        ========================================== */

        sidebarUser.name =
            name;

        sidebarUser.email =
            email;


        /* =========================================
           REFRESH SIDEBAR
        ========================================== */

        renderSidebar(
            sidebarUser
        );


        showProfileMessage(
            "Profile saved successfully.",
            false
        );


        /* Modal was recreated by renderSidebar,
           so reopen it after successful save */

        setTimeout(
            () => {

                openProfileModal();

            },
            100
        );


    } catch (error) {

        console.error(
            "Profile save error:",
            error
        );


        showProfileMessage(
            error.message,
            true
        );

    } finally {

        if (
            document.getElementById(
                "profileSaveButton"
            )
        ) {

            document.getElementById(
                "profileSaveButton"
            ).disabled = false;

        }

    }
}


/* =========================================================
   GET SELECTED CHECKBOXES
========================================================= */

function getSelectedCheckboxes(
    groupName
) {

    const checkboxes =
        document.querySelectorAll(
            `input[name="${groupName}"]:checked`
        );


    return Array.from(
        checkboxes
    ).map(
        checkbox =>
            checkbox.value
    );
}


/* =========================================================
   PROFILE MESSAGE
========================================================= */

function showProfileMessage(
    text,
    isError = false
) {

    const message =
        document.getElementById(
            "profileMessage"
        );


    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.className =
        isError
            ? "profile-message error"
            : "profile-message success";

}


/* ========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

    try {

        await fetch(
            `${SIDEBAR_API_BASE}/api/auth/logout`,
            {

                method: "POST",

                credentials: "include"

            }
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

        window.location.href =
            "/auth/login.html";

    }
}


/* =========================================================
   SIDEBAR ACTIVE ITEM
========================================================= */

function setActiveSidebar(
    element
) {

    document
        .querySelectorAll(
            ".sidebar-item"
        )
        .forEach(
            item =>
                item.classList.remove(
                    "active"
                )
        );


    element.classList.add(
        "active"
    );

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
    date
) {

    if (!date) {
        return "Not available";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return date;

    }


    return parsed.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

    if (!name) {
        return "U";
    }


    const parts =
        name
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   ATTRIBUTE ESCAPE
========================================================= */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   SAFE JSON
========================================================= */

async function safeJson(
    response
) {

    try {

        return await response.json();

    } catch {

        return null;

    }

}