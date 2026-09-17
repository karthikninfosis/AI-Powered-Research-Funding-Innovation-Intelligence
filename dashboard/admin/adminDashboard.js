const ADMIN_API_BASE =
    API_BASE_URL;


/* =====================================================
   GLOBAL DATA
===================================================== */

let allUsers = [];
let allRoles = [];

let roleChart = null;
let statusChart = null;
let growthChart = null;
let adminChart = null;


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        verifyAdminAccess();

    }
);


/* =====================================================
   VERIFY ADMIN
===================================================== */

async function verifyAdminAccess() {

    try {

        /*
         * Get authenticated user
         */

        const meResponse =
            await authFetch(
                `${ADMIN_API_BASE}/api/auth/me`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!meResponse.ok) {

            window.location.href =
                "/auth/login.html";

            return;

        }


        const meUser =
            await meResponse.json();


        /*
         * Get complete user
         */

        const userResponse =
            await authFetch(
                `${ADMIN_API_BASE}/api/users/email/${encodeURIComponent(meUser.email)}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!userResponse.ok) {

            showDenied(
                "Unable to load your user information."
            );

            return;

        }


        const currentUser =
            await userResponse.json();


        /*
         * Get available roles
         */

        const rolesResponse =
            await authFetch(
                `${ADMIN_API_BASE}/api/roles/get`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!rolesResponse.ok) {

            showDenied(
                "Unable to load available roles."
            );

            return;

        }


        allRoles =
            await rolesResponse.json();


        /*
         * Find current user's role
         */

        const currentRole =
            allRoles.find(
                role =>
                    String(role._id) ===
                    String(currentUser.role_id)
            );


        if (!currentRole) {

            showDenied(
                "Your role could not be identified."
            );

            return;

        }


        /*
         * Check admin
         */

        const isAdmin =
            String(currentRole.name || "")
                .toLowerCase() === "admin" ||

            String(currentRole.code || "")
                .toLowerCase() === "admin";


        if (!isAdmin) {

            showDenied(
                `Access denied. Your role is "${currentRole.name}".`
            );

            return;

        }


        /*
         * Access granted
         */

        document
            .getElementById("authLoading")
            .classList.add("hidden");


        document
            .getElementById("authDenied")
            .classList.add("hidden");


        document
            .getElementById("dashboard")
            .classList.remove("hidden");


        /*
         * Load dashboard
         */

        await loadAdminData();

    }

    catch (error) {

        console.error(
            "Admin authentication error:",
            error
        );


        showDenied(
            "Authentication error: " +
            error.message
        );

    }

}


/* =====================================================
   ACCESS DENIED
===================================================== */

function showDenied(message) {

    document
        .getElementById("authLoading")
        .classList.add("hidden");


    document
        .getElementById("dashboard")
        .classList.add("hidden");


    document
        .getElementById("authDenied")
        .classList.remove("hidden");


    document
        .getElementById("authDeniedMessage")
        .textContent = message;

}


/* =====================================================
   LOAD USERS + ROLES
===================================================== */

async function loadAdminData() {

    try {

        /*
         * Fetch both APIs
         */

        const [
            usersResponse,
            rolesResponse
        ] = await Promise.all([

            fetch(
                `${ADMIN_API_BASE}/api/users/`,
                {
                    method: "GET",
                    credentials: "include"
                }
            ),

            fetch(
                `${ADMIN_API_BASE}/api/roles/get`,
                {
                    method: "GET",
                    credentials: "include"
                }
            )

        ]);


        if (!usersResponse.ok) {

            throw new Error(
                `Users API returned ${usersResponse.status}`
            );

        }


        if (!rolesResponse.ok) {

            throw new Error(
                `Roles API returned ${rolesResponse.status}`
            );

        }


        allUsers =
            await usersResponse.json();


        allRoles =
            await rolesResponse.json();


        if (!Array.isArray(allUsers)) {

            throw new Error(
                "Users API did not return an array."
            );

        }


        if (!Array.isArray(allRoles)) {

            throw new Error(
                "Roles API did not return an array."
            );

        }


        console.log(
            "Admin users:",
            allUsers
        );


        console.log(
            "Available roles:",
            allRoles
        );


        /*
         * Update UI
         */

        updateStatistics();

        populateRoleFilters();

        renderCharts();

        renderRoleSummary();

        renderUsersTable(allUsers);

        renderAdminsTable();

        loadDatasetCounts();

    }

    catch (error) {

        console.error(
            "Admin data loading failed:",
            error
        );


        showDataError(
            error.message
        );

    }

}


/* =====================================================
   DATASET COUNTS
===================================================== */

async function loadDatasetCounts() {

    const endpoints = [
        { key: "countTechnologies", url: `${ADMIN_API_BASE}/api/technology-data/count` },
        { key: "countPatents", url: `${ADMIN_API_BASE}/api/patents-data/count` },
        { key: "countDatasets", url: `${ADMIN_API_BASE}/api/datasets-data/count` },
        { key: "countGrants", url: `${ADMIN_API_BASE}/api/grants-data/count` }
    ];

    for (const item of endpoints) {

        try {

            const response = await authFetch(
                item.url,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                continue;
            }

            const data = await response.json();

            const el = document.getElementById(item.key);

            if (!el) {
                continue;
            }

            const total =
                data.total_records ??
                data.total ??
                data.count ??
                0;

            el.textContent =
                Number(total).toLocaleString();

        }
        catch (error) {

            console.error(
                `Failed to load dataset count (${item.key}):`,
                error
            );

        }

    }

}


/* =====================================================
   ERROR
===================================================== */

function showDataError(message) {

    const roleSummary =
        document.getElementById(
            "roleSummary"
        );


    if (roleSummary) {

        roleSummary.innerHTML = `

            <div style="
                padding:20px;
                color:#ed8888;
            ">
                Failed to load admin data:
                ${escapeHTML(message)}
            </div>

        `;

    }

}


/* =====================================================
   GET ROLE
===================================================== */

function getRole(user) {

    return allRoles.find(
        role =>
            String(role._id) ===
            String(user.role_id)
    );

}


/* =====================================================
   GET ROLE NAME
===================================================== */

function getRoleName(user) {

    const role =
        getRole(user);


    if (!role) {

        return "Unknown";

    }


    return (
        role.name ||
        role.code ||
        "Unknown"
    );

}


/* =====================================================
   IS ADMIN
===================================================== */

function isAdminUser(user) {

    const role =
        getRole(user);


    if (!role) {

        return false;

    }


    return (

        String(role.name || "")
            .toLowerCase() === "admin"

        ||

        String(role.code || "")
            .toLowerCase() === "admin"

    );

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    const total =
        allUsers.length;


    const active =
        allUsers.filter(
            user =>
                user.is_active === true
        ).length;


    const inactive =
        total - active;


    const admins =
        allUsers.filter(
            user =>
                isAdminUser(user)
        ).length;


    const researchers =
        countRoles([
            "researcher",
            "researchers"
        ]);


    const startups =
        countRoles([
            "startup",
            "startups"
        ]);


    document
        .getElementById("totalUsers")
        .textContent = total;


    document
        .getElementById("totalAdmins")
        .textContent = admins;


    document
        .getElementById("activeUsers")
        .textContent = active;


    document
        .getElementById("inactiveUsers")
        .textContent = inactive;


    document
        .getElementById("researchersCount")
        .textContent = researchers;


    document
        .getElementById("startupsCount")
        .textContent = startups;

}


/* =====================================================
   COUNT ROLE
===================================================== */

function countRoles(roleNames) {

    return allUsers.filter(
        user => {

            const roleName =
                getRoleName(user)
                    .toLowerCase()
                    .trim();


            return roleNames.includes(
                roleName
            );

        }
    ).length;

}


/* =====================================================
   ROLE FILTER
===================================================== */

function populateRoleFilters() {

    const roleFilter =
        document.getElementById(
            "roleFilter"
        );


    const editRole =
        document.getElementById(
            "editRole"
        );


    roleFilter.innerHTML = `
        <option value="">
            All Roles
        </option>
    `;


    editRole.innerHTML = "";


    allRoles.forEach(role => {

        const roleName =
            role.name ||
            role.code ||
            "Unknown";


        /*
         * Filter option
         */

        const filterOption =
            document.createElement(
                "option"
            );


        filterOption.value =
            String(role._id);


        filterOption.textContent =
            roleName;


        roleFilter.appendChild(
            filterOption
        );


        /*
         * Edit role option
         */

        const editOption =
            document.createElement(
                "option"
            );


        editOption.value =
            String(role._id);


        editOption.textContent =
            roleName;


        editRole.appendChild(
            editOption
        );

    });

}


/* =====================================================
   CHARTS
===================================================== */

function renderCharts() {

    renderRoleChart();

    renderStatusChart();

    renderGrowthChart();

    renderAdminChart();

}


/* =====================================================
   ROLE CHART
===================================================== */

function renderRoleChart() {

    const counts = {};


    allUsers.forEach(user => {

        const role =
            getRoleName(user);


        counts[role] =
            (counts[role] || 0) + 1;

    });


    const labels =
        Object.keys(counts);


    const values =
        Object.values(counts);


    if (roleChart) {

        roleChart.destroy();

    }


    const canvas =
        document.getElementById(
            "roleChart"
        );


    roleChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label: "Users",

                            data: values,

                            borderWidth: 1

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                precision: 0

                            }

                        }

                    }

                }

            }
        );

}


/* =====================================================
   STATUS CHART
===================================================== */

function renderStatusChart() {

    const active =
        allUsers.filter(
            user =>
                user.is_active === true
        ).length;


    const inactive =
        allUsers.length - active;


    if (statusChart) {

        statusChart.destroy();

    }


    const canvas =
        document.getElementById(
            "statusChart"
        );


    statusChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "Active",
                        "Inactive"
                    ],

                    datasets: [

                        {

                            data: [
                                active,
                                inactive
                            ],

                            borderWidth: 1

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    }

                }

            }
        );

}


/* =====================================================
   USER GROWTH
===================================================== */

function renderGrowthChart() {

    const dateCounts = {};


    allUsers.forEach(user => {

        if (!user.created_at) {

            return;

        }


        const date =
            new Date(
                user.created_at
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return;

        }


        /*
         * YYYY-MM
         */

        const key =
            `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;


        dateCounts[key] =
            (dateCounts[key] || 0) + 1;

    });


    const sortedKeys =
        Object.keys(dateCounts)
            .sort();


    const labels =
        sortedKeys.map(key => {

            const [
                year,
                month
            ] = key.split("-");


            return new Date(
                Number(year),
                Number(month) - 1
            ).toLocaleDateString(
                "en-IN",
                {
                    month: "short",
                    year: "numeric"
                }
            );

        });


    const values =
        sortedKeys.map(
            key =>
                dateCounts[key]
        );


    if (growthChart) {

        growthChart.destroy();

    }


    const canvas =
        document.getElementById(
            "growthChart"
        );


    growthChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Users Created",

                            data: values,

                            tension: .3,

                            fill: false,

                            borderWidth: 2,

                            pointRadius: 4

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                precision: 0

                            }

                        }

                    }

                }

            }
        );

}


/* =====================================================
   ADMIN CHART
===================================================== */

function renderAdminChart() {

    const admins =
        allUsers.filter(
            user =>
                isAdminUser(user)
        ).length;


    const others =
        allUsers.length - admins;


    if (adminChart) {

        adminChart.destroy();

    }


    const canvas =
        document.getElementById(
            "adminChart"
        );


    adminChart =
        new Chart(
            canvas,
            {

                type: "pie",

                data: {

                    labels: [
                        "Admins",
                        "Other Users"
                    ],

                    datasets: [

                        {

                            data: [
                                admins,
                                others
                            ],

                            borderWidth: 1

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    }

                }

            }
        );

}


/* =====================================================
   ROLE SUMMARY
===================================================== */

function renderRoleSummary() {

    const container =
        document.getElementById(
            "roleSummary"
        );


    const counts = {};


    allUsers.forEach(user => {

        const role =
            getRoleName(user);


        counts[role] =
            (counts[role] || 0) + 1;

    });


    container.innerHTML = "";


    Object.entries(counts)
        .forEach(
            ([role, count]) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "role-card";


                card.innerHTML = `

                    <div class="role-card-name">
                        ${escapeHTML(role)}
                    </div>

                    <div class="role-card-count">
                        ${count}
                    </div>

                    <div class="role-card-label">
                        Users
                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );


    if (
        Object.keys(counts).length === 0
    ) {

        container.innerHTML = `
            <div style="color:#657286;">
                No users found.
            </div>
        `;

    }

}


/* =====================================================
   USERS TABLE
===================================================== */

function renderUsersTable(users) {

    const tbody =
        document.getElementById(
            "usersTableBody"
        );


    tbody.innerHTML = "";


    if (!users.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-table"
                >
                    No users found.
                </td>

            </tr>

        `;

        return;

    }


    users.forEach(user => {

        const row =
            document.createElement(
                "tr"
            );


        const roleName =
            getRoleName(user);


        const active =
            user.is_active === true;


        row.innerHTML = `

            <td>

                <span class="user-id">
                    ${escapeHTML(user.user_id)}
                </span>

            </td>


            <td>
                ${escapeHTML(user.name)}
            </td>


            <td>

                <span class="user-email">
                    ${escapeHTML(user.email)}
                </span>

            </td>


            <td>

                <span class="role-badge">
                    ${escapeHTML(roleName)}
                </span>

            </td>


            <td>

                <span class="
                    status-badge
                    ${active
                        ? "status-active"
                        : "status-inactive"}
                ">

                    ${active
                        ? "Active"
                        : "Inactive"}

                </span>

            </td>


            <td>
                ${formatDate(user.last_active)}
            </td>


            <td>
                ${formatDate(user.created_at)}
            </td>


            <td>

                <button
                    class="edit-button"
                    onclick="openEditUser('${escapeHTML(user._id)}')"
                >
                    Edit
                </button>

            </td>

        `;


        tbody.appendChild(
            row
        );

    });

}


/* =====================================================
   ADMINS TABLE
===================================================== */

function renderAdminsTable() {

    const admins =
        allUsers.filter(
            user =>
                isAdminUser(user)
        );


    document
        .getElementById(
            "adminPageCount"
        )
        .textContent =
        admins.length;


    const tbody =
        document.getElementById(
            "adminsTableBody"
        );


    tbody.innerHTML = "";


    if (!admins.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-table"
                >
                    No administrators found.
                </td>

            </tr>

        `;

        return;

    }


    admins.forEach(user => {

        const row =
            document.createElement(
                "tr"
            );


        const active =
            user.is_active === true;


        row.innerHTML = `

            <td>

                <span class="user-id">
                    ${escapeHTML(user.user_id)}
                </span>

            </td>


            <td>
                ${escapeHTML(user.name)}
            </td>


            <td>

                <span class="user-email">
                    ${escapeHTML(user.email)}
                </span>

            </td>


            <td>

                <span class="role-badge">
                    ${escapeHTML(getRoleName(user))}
                </span>

            </td>


            <td>

                <span class="
                    status-badge
                    ${active
                        ? "status-active"
                        : "status-inactive"}
                ">

                    ${active
                        ? "Active"
                        : "Inactive"}

                </span>

            </td>


            <td>
                ${formatDate(user.created_at)}
            </td>


            <td>

                <button
                    class="edit-button"
                    onclick="openEditUser('${escapeHTML(user._id)}')"
                >
                    Edit
                </button>

            </td>

        `;


        tbody.appendChild(
            row
        );

    });

}


/* =====================================================
   SEARCH / FILTER
===================================================== */

function filterUsers() {

    const search =
        document
            .getElementById(
                "userSearch"
            )
            .value
            .toLowerCase()
            .trim();


    const role =
        document
            .getElementById(
                "roleFilter"
            )
            .value;


    const status =
        document
            .getElementById(
                "statusFilter"
            )
            .value;


    const filtered =
        allUsers.filter(
            user => {

                const matchesSearch =

                    !search ||

                    String(
                        user.user_id || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        user.name || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        user.email || ""
                    )
                    .toLowerCase()
                    .includes(search);


                const matchesRole =

                    !role ||

                    String(
                        user.role_id
                    ) ===
                    String(role);


                const matchesStatus =

                    !status ||

                    (
                        status === "active" &&
                        user.is_active === true
                    )

                    ||

                    (
                        status === "inactive" &&
                        user.is_active !== true
                    );


                return (
                    matchesSearch &&
                    matchesRole &&
                    matchesStatus
                );

            }
        );


    renderUsersTable(
        filtered
    );

}


/* =====================================================
   OPEN EDIT USER
===================================================== */

function openEditUser(objectId) {

    const user =
        allUsers.find(
            item =>
                String(item._id) ===
                String(objectId)
        );


    if (!user) {

        alert(
            "User could not be found."
        );

        return;

    }


    /*
     * READ ONLY
     */

    document
        .getElementById(
            "editObjectId"
        )
        .value =
        user._id || "";


    document
        .getElementById(
            "editUserId"
        )
        .value =
        user.user_id || "";


    document
        .getElementById(
            "editLastActive"
        )
        .value =
        formatDateTime(
            user.last_active
        );


    document
        .getElementById(
            "editCreatedAt"
        )
        .value =
        formatDateTime(
            user.created_at
        );


    document
        .getElementById(
            "editUpdatedAt"
        )
        .value =
        formatDateTime(
            user.updated_at
        );


    /*
     * EDITABLE
     */

    document
        .getElementById(
            "editName"
        )
        .value =
        user.name || "";


    document
        .getElementById(
            "editEmail"
        )
        .value =
        user.email || "";


    document
        .getElementById(
            "editPassword"
        )
        .value = "";


    document
        .getElementById(
            "editRole"
        )
        .value =
        String(
            user.role_id || ""
        );


    document
        .getElementById(
            "editStatus"
        )
        .value =
        user.is_active === true
            ? "true"
            : "false";


    document
        .getElementById(
            "editMessage"
        )
        .textContent = "";


    /*
     * Open modal
     */

    document
        .getElementById(
            "editUserModal"
        )
        .classList
        .remove("hidden");

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeEditModal() {

    document
        .getElementById(
            "editUserModal"
        )
        .classList
        .add("hidden");

}


/* =====================================================
   SAVE USER
===================================================== */

document
    .getElementById(
        "editUserForm"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            /*
             * ObjectId is used ONLY
             * in the URL.
             */

            const objectId =
                document
                    .getElementById(
                        "editObjectId"
                    )
                    .value;


            const name =
                document
                    .getElementById(
                        "editName"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "editEmail"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "editPassword"
                    )
                    .value;


            const roleId =
                document
                    .getElementById(
                        "editRole"
                    )
                    .value;


            const isActive =
                document
                    .getElementById(
                        "editStatus"
                    )
                    .value === "true";


            const message =
                document
                    .getElementById(
                        "editMessage"
                    );


            /*
             * Basic validation
             */

            if (!objectId) {

                message.textContent =
                    "Object ID is missing.";

                message.style.color =
                    "#ed8888";

                return;

            }


            if (!name) {

                message.textContent =
                    "Name is required.";

                message.style.color =
                    "#ed8888";

                return;

            }


            if (!email) {

                message.textContent =
                    "Email is required.";

                message.style.color =
                    "#ed8888";

                return;

            }


            if (!roleId) {

                message.textContent =
                    "Please select a role.";

                message.style.color =
                    "#ed8888";

                return;

            }


            message.textContent =
                "Saving changes...";


            message.style.color =
                "#9aa7b7";


            try {

                /*
                 * IMPORTANT
                 *
                 * We DO NOT send:
                 *
                 * _id
                 * user_id
                 * last_active
                 * created_at
                 * updated_at
                 *
                 * These remain read-only.
                 */


                const updateData = {

                    name:
                        name,

                    email:
                        email,

                    role_id:
                        roleId,

                    is_active:
                        isActive

                };


                /*
                 * Only send password
                 * when Admin entered one.
                 */

                if (
                    password.trim() !== ""
                ) {

                    updateData.password =
                        password;

                }


                console.log(
                    "PUT ObjectId:",
                    objectId
                );


                console.log(
                    "Update payload:",
                    updateData
                );


                /*
                 * UPDATE
                 *
                 * PUT /api/users/{_id}
                 */

                const response =
                    await authFetch(
                        `${ADMIN_API_BASE}/api/users/${encodeURIComponent(objectId)}`,
                        {

                            method:
                                "PUT",

                            credentials:
                                "include",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    updateData
                                )

                        }
                    );


                const responseText =
                    await response.text();


                if (!response.ok) {

                    throw new Error(
                        responseText ||
                        `Update failed with status ${response.status}`
                    );

                }


                console.log(
                    "Update response:",
                    responseText
                );


                message.textContent =
                    "User updated successfully.";

                message.style.color =
                    "#75d999";


                /*
                 * Reload all data
                 */

                await loadAdminData();


                /*
                 * Close modal
                 */

                setTimeout(
                    () => {

                        closeEditModal();

                    },
                    700
                );

            }

            catch (error) {

                console.error(
                    "User update failed:",
                    error
                );


                message.textContent =
                    "Update failed: " +
                    error.message;


                message.style.color =
                    "#ed8888";

            }

        }
    );


/* =====================================================
   SECTION SWITCH
===================================================== */

function showSection(
    section,
    button
) {

    /*
     * Hide everything
     */

    document
        .querySelectorAll(
            ".admin-section"
        )
        .forEach(
            element => {

                element
                    .classList
                    .add("hidden");

            }
        );


    /*
     * Remove active state
     */

    document
        .querySelectorAll(
            ".admin-nav-button"
        )
        .forEach(
            element => {

                element
                    .classList
                    .remove("active");

            }
        );


    /*
     * Show selected
     */

    if (
        section === "overview"
    ) {

        document
            .getElementById(
                "overviewSection"
            )
            .classList
            .remove("hidden");

    }


    if (
        section === "users"
    ) {

        document
            .getElementById(
                "usersSection"
            )
            .classList
            .remove("hidden");

    }


    if (
        section === "admins"
    ) {

        document
            .getElementById(
                "adminsSection"
            )
            .classList
            .remove("hidden");

    }


    /*
     * Active button
     */

    if (button) {

        button
            .classList
            .add("active");

    }

}


/* =====================================================
   DATE
===================================================== */

function formatDate(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   DATE + TIME
===================================================== */

function formatDateTime(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleString(
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


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
===================================================== */

document
    .getElementById(
        "editUserModal"
    )
    .addEventListener(
        "click",
        function(event) {

            if (
                event.target === this
            ) {

                closeEditModal();

            }

        }
    );


/* =====================================================
   ESC KEY CLOSE
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            const modal =
                document.getElementById(
                    "editUserModal"
                );


            if (
                modal &&
                !modal.classList.contains(
                    "hidden"
                )
            ) {

                closeEditModal();

            }

        }

    }
);