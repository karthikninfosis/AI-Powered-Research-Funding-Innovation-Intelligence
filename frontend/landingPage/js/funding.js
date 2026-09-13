// ============================================================
// RESEARCHIQ - FUNDING DASHBOARD
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8001";

// ============================================================
// FUNDING DATA
// ============================================================

const fundingDocuments = [
    {
        id: 1,
        title: "AI Research and Innovation Grant",
        organization: "National Research Foundation",
        amount: "$250,000",
        deadline: "30 Sep 2026",
        type: "Research Grant",
        area: "Artificial Intelligence",
        match: 94,
        description:
            "Funding opportunity supporting innovative research projects in artificial intelligence and intelligent systems.",
        eligibility: "Universities & Research Institutions"
    },

    {
        id: 2,
        title: "Emerging Technologies Research Fund",
        organization: "Innovation & Technology Council",
        amount: "$180,000",
        deadline: "15 Oct 2026",
        type: "Innovation Grant",
        area: "Emerging Technology",
        match: 89,
        description:
            "Supports research and development projects focused on emerging technologies and digital innovation.",
        eligibility: "Researchers & Startups"
    },

    {
        id: 3,
        title: "Digital Transformation Research Program",
        organization: "Technology Development Agency",
        amount: "$120,000",
        deadline: "05 Nov 2026",
        type: "Research Grant",
        area: "Digital Transformation",
        match: 86,
        description:
            "Funding for research projects that develop practical solutions for digital transformation.",
        eligibility: "Academic Researchers"
    },

    {
        id: 4,
        title: "Future Computing Innovation Grant",
        organization: "Advanced Computing Foundation",
        amount: "$300,000",
        deadline: "20 Nov 2026",
        type: "Innovation Grant",
        area: "Computing",
        match: 82,
        description:
            "Supports innovative research in next-generation computing, intelligent systems and advanced technologies.",
        eligibility: "Universities & Technology Companies"
    }
];

// ============================================================
// STATE
// ============================================================

let searchQuery = "";

let filters = {
    fundingType: "All",
    researchArea: "All",
    organization: "All"
};

let sortAscending = false;

let activeSection = "dashboard";

const savedKey = "researchiq_saved_funding";

let savedIds = new Set(
    JSON.parse(
        localStorage.getItem(savedKey) || "[]"
    ).map(Number)
);

// ============================================================
// HELPER
// ============================================================

const $ = id => document.getElementById(id);

// ============================================================
// SAVED OPPORTUNITIES
// ============================================================

function saveState() {

    localStorage.setItem(
        savedKey,
        JSON.stringify([...savedIds])
    );
}

// ============================================================
// FILTER FUNDING
// ============================================================

function getFilteredDocuments() {

    let result = fundingDocuments.filter(doc => {

        const q =
            searchQuery
                .trim()
                .toLowerCase();

        const matchesSearch =
            !q ||
            doc.title.toLowerCase().includes(q) ||
            doc.organization.toLowerCase().includes(q) ||
            doc.area.toLowerCase().includes(q);

        const matchesType =
            filters.fundingType === "All" ||
            doc.type === filters.fundingType;

        const matchesArea =
            filters.researchArea === "All" ||
            doc.area === filters.researchArea;

        const matchesOrganization =
            filters.organization === "All" ||
            doc.organization === filters.organization;

        return (
            matchesSearch &&
            matchesType &&
            matchesArea &&
            matchesOrganization
        );
    });

    result.sort((a, b) =>
        sortAscending
            ? a.match - b.match
            : b.match - a.match
    );

    return result;
}

// ============================================================
// STATISTICS
// ============================================================

function renderStats() {

    const stats = $("fundingStats");

    if (!stats) return;

    const average =
        fundingDocuments.length
            ? Math.round(
                fundingDocuments.reduce(
                    (sum, doc) =>
                        sum + doc.match,
                    0
                ) /
                fundingDocuments.length
            )
            : 0;

    stats.innerHTML = `

        <div class="stat-card">

            <div class="stat-icon">
                ◈
            </div>

            <div class="stat-content">

                <span class="stat-value">
                    ${fundingDocuments.length}
                </span>

                <strong>
                    Total Opportunities
                </strong>

                <span class="stat-description">
                    Available funding
                </span>

            </div>

        </div>


        <div class="stat-card">

            <div class="stat-icon">
                ◆
            </div>

            <div class="stat-content">

                <span class="stat-value">
                    ${
                        fundingDocuments.filter(
                            d =>
                                d.type ===
                                "Research Grant"
                        ).length
                    }
                </span>

                <strong>
                    Research Grants
                </strong>

                <span class="stat-description">
                    Research focused
                </span>

            </div>

        </div>


        <div class="stat-card">

            <div class="stat-icon">
                ✦
            </div>

            <div class="stat-content">

                <span class="stat-value">
                    ${
                        fundingDocuments.filter(
                            d =>
                                d.type ===
                                "Innovation Grant"
                        ).length
                    }
                </span>

                <strong>
                    Innovation Grants
                </strong>

                <span class="stat-description">
                    Innovation focused
                </span>

            </div>

        </div>


        <div class="stat-card">

            <div class="stat-icon">
                ◎
            </div>

            <div class="stat-content">

                <span class="stat-value">
                    ${average}%
                </span>

                <strong>
                    Avg. Match Score
                </strong>

                <span class="stat-description">
                    AI relevance score
                </span>

            </div>

        </div>
    `;
}

// ============================================================
// FUNDING CARD
// ============================================================

function cardHTML(doc) {

    const saved =
        savedIds.has(doc.id);

    return `

        <article class="funding-card">

            <div class="funding-card-top">

                <div class="funding-type">
                    ${doc.type}
                </div>

                <button
                    type="button"
                    class="save-button ${
                        saved ? "saved" : ""
                    }"
                    data-save-id="${doc.id}"
                >
                    ${
                        saved
                            ? "♥"
                            : "♡"
                    }
                </button>

            </div>


            <div class="funding-card-content">

                <div class="organization-name">
                    ${doc.organization}
                </div>

                <h3>
                    ${doc.title}
                </h3>

                <p class="funding-description">
                    ${doc.description}
                </p>


                <div class="funding-details">

                    <div class="funding-detail">

                        <span class="detail-icon">
                            💰
                        </span>

                        <div>

                            <span class="detail-label">
                                Funding Amount
                            </span>

                            <strong>
                                ${doc.amount}
                            </strong>

                        </div>

                    </div>


                    <div class="funding-detail">

                        <span class="detail-icon">
                            ◷
                        </span>

                        <div>

                            <span class="detail-label">
                                Deadline
                            </span>

                            <strong>
                                ${doc.deadline}
                            </strong>

                        </div>

                    </div>

                </div>


                <div class="eligibility">

                    <span>
                        ✓
                    </span>

                    <div>

                        <span class="detail-label">
                            Eligibility
                        </span>

                        <strong>
                            ${doc.eligibility}
                        </strong>

                    </div>

                </div>


                <div class="funding-card-footer">

                    <div class="match-score">

                        <div
                            class="match-circle"
                            style="
                                --match-score:
                                ${doc.match * 3.6}deg
                            "
                        >
                            <span>
                                ${doc.match}%
                            </span>
                        </div>

                        <div>

                            <strong>
                                AI Match
                            </strong>

                            <span>
                                Relevance score
                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="view-document-button"
                        data-view-id="${doc.id}"
                    >
                        View Document →
                    </button>

                </div>

            </div>

        </article>
    `;
}

// ============================================================
// RENDER FUNDING CARDS
// ============================================================

function renderCards() {

    const grid =
        $("fundingGrid");

    if (!grid) return;

    let docs =
        getFilteredDocuments();

    if (
        activeSection ===
        "saved"
    ) {

        docs =
            docs.filter(doc =>
                savedIds.has(doc.id)
            );
    }

    const count =
        $("resultCount");

    if (count) {

        count.textContent =
            `${docs.length} ${
                docs.length === 1
                    ? "opportunity"
                    : "opportunities"
            } found`;
    }

    if (!docs.length) {

        grid.innerHTML = `

            <div class="no-results">

                <div class="no-results-icon">
                    ⌕
                </div>

                <h3>
                    ${
                        activeSection ===
                        "saved"
                            ? "No saved opportunities"
                            : "No funding opportunities found"
                    }
                </h3>

                <p>
                    ${
                        activeSection ===
                        "saved"
                            ? "Click the ♡ icon on a funding card to save an opportunity."
                            : "Try changing your search keywords or filters."
                    }
                </p>

            </div>
        `;

        return;
    }

    grid.innerHTML =
        docs
            .map(cardHTML)
            .join("");
}

// ============================================================
// SIDEBAR ACTIVE
// ============================================================

function setActiveSidebar(button) {

    document
        .querySelectorAll(".sidebar-item")
        .forEach(item => {

            item.classList.remove(
                "active"
            );
        });

    if (button) {

        button.classList.add(
            "active"
        );
    }
}

// ============================================================
// AI RECOMMENDATIONS PAGE
// ============================================================

function renderAIRecommendationsPage() {

    const main =
        $("dashboardMain");

    if (!main) return;

    main.innerHTML = `

        <div class="dashboard-header">

            <div>

                <span class="dashboard-label">
                    AI INTELLIGENCE
                </span>

                <h1>
                    AI Recommendations
                </h1>

                <p>
                    Enter your innovation details and get
                    AI-powered funding recommendations.
                </p>

            </div>

        </div>


        <div style="
            background:#ffffff;
            border-radius:12px;
            padding:25px;
            margin-top:25px;
            max-width:800px;
        ">

            <label>
                Innovation Title
            </label>

            <input
                id="aiInnovationTitle"
                type="text"
                placeholder="Example: AI-Based Road Safety System"
                style="
                    width:100%;
                    padding:13px;
                    margin:8px 0 20px;
                    box-sizing:border-box;
                "
            >


            <label>
                Innovation Description
            </label>

            <textarea
                id="aiInnovationDescription"
                rows="7"
                placeholder="Describe your research, technology, problem and expected impact..."
                style="
                    width:100%;
                    padding:13px;
                    margin:8px 0 20px;
                    box-sizing:border-box;
                "
            ></textarea>


            <button
                type="button"
                id="getAIRecommendations"
                style="
                    padding:13px 20px;
                    border:none;
                    border-radius:8px;
                    cursor:pointer;
                    font-weight:600;
                "
            >
                ✦ Get AI Recommendations
            </button>

        </div>


        <div
            id="aiRecommendationResults"
            style="
                margin-top:25px;
                max-width:800px;
            "
        ></div>
    `;

    $("getAIRecommendations")
        .addEventListener(
            "click",
            getAIRecommendations
        );
}

// ============================================================
// AI BACKEND
// ============================================================

async function getAIRecommendations() {

    const title =
        $("aiInnovationTitle")
            .value
            .trim();

    const description =
        $("aiInnovationDescription")
            .value
            .trim();

    const results =
        $("aiRecommendationResults");

    const button =
        $("getAIRecommendations");

    if (!title && !description) {

        results.innerHTML = `

            <div class="no-results">

                <div class="no-results-icon">
                    ⚠
                </div>

                <h3>
                    Please enter your innovation
                </h3>

                <p>
                    Enter a title or description.
                </p>

            </div>
        `;

        return;
    }

    button.disabled = true;

    button.textContent =
        "⏳ Finding Recommendations...";

    results.innerHTML = `

        <div class="no-results">

            <div class="no-results-icon">
                ⏳
            </div>

            <h3>
                AI is analyzing your innovation...
            </h3>

        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/funding/recommend`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        innovation_title:
                            title,

                        innovation_description:
                            description,

                        top_k: 5
                    })
                }
            );

        if (!response.ok) {

            throw new Error(
                `Server error ${response.status}`
            );
        }

        const data =
            await response.json();

        if (
            !data.success ||
            !Array.isArray(
                data.recommendations
            )
        ) {

            throw new Error(
                "Invalid API response"
            );
        }

        renderAIResults(
            data.recommendations
        );

    } catch (error) {

        console.error(
            "AI recommendation error:",
            error
        );

        results.innerHTML = `

            <div class="no-results">

                <div class="no-results-icon">
                    ⚠
                </div>

                <h3>
                    Unable to get recommendations
                </h3>

                <p>
                    Make sure your FastAPI backend
                    is running on port 8001.
                </p>

                <p>
                    <strong>
                        ${error.message}
                    </strong>
                </p>

            </div>
        `;

    } finally {

        button.disabled = false;

        button.textContent =
            "✦ Get AI Recommendations";
    }
}

// ============================================================
// AI RESULTS
// ============================================================

function renderAIResults(
    recommendations
) {

    const results =
        $("aiRecommendationResults");

    if (!results) return;

    if (
        !recommendations.length
    ) {

        results.innerHTML = `

            <div class="no-results">

                <h3>
                    No recommendations found
                </h3>

                <p>
                    Try adding more details.
                </p>

            </div>
        `;

        return;
    }

    results.innerHTML = `

        <h2>
            Recommended Funding Opportunities
        </h2>

        <p>
            ${recommendations.length}
            opportunities matched.
        </p>


        <div style="
            display:flex;
            flex-direction:column;
            gap:15px;
        ">

            ${recommendations
                .map(
                    (grant, index) => `

                <article style="
                    background:#ffffff;
                    color:#111827;
                    border-radius:12px;
                    padding:20px;
                    border:1px solid #e4e4e4;
                ">

                    <div style="
                        color:#6d28d9;
                        font-size:12px;
                        font-weight:700;
                    ">

                        AI RECOMMENDATION
                        #${index + 1}

                    </div>


                    <h3>
                        ${
                            grant.title ||
                            "Funding Opportunity"
                        }
                    </h3>


                    <p>

                        <strong>
                            Match:
                        </strong>

                        ${
                            grant.match_score !==
                            undefined
                                ? Number(
                                    grant.match_score
                                ).toFixed(2)
                                : "0"
                        }%

                    </p>


                    <p>

                        <strong>
                            Agency:
                        </strong>

                        ${
                            grant.agency ||
                            "Not provided"
                        }

                    </p>


                    <p>

                        <strong>
                            Category:
                        </strong>

                        ${
                            grant.category ||
                            "Not provided"
                        }

                    </p>

                </article>
            `
                )
                .join("")}

        </div>
    `;
}

// ============================================================
// RESEARCH ANALYTICS
// ============================================================

function renderResearchAnalyticsPage() {

    const main =
        $("dashboardMain");

    if (!main) return;

    const total =
        fundingDocuments.length;

    const research =
        fundingDocuments.filter(
            d =>
                d.type ===
                "Research Grant"
        ).length;

    const innovation =
        fundingDocuments.filter(
            d =>
                d.type ===
                "Innovation Grant"
        ).length;

    const average =
        Math.round(
            fundingDocuments.reduce(
                (sum, d) =>
                    sum + d.match,
                0
            ) / total
        );

    const areas = {};

    fundingDocuments.forEach(
        doc => {

            areas[doc.area] =
                (areas[doc.area] || 0) + 1;
        }
    );

    // ========================================================
    // RESEARCH AREA COLORS / ICONS
    // ========================================================

    const areaStyles = {

        "Artificial Intelligence": {
            icon: "🤖",
            gradient:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            description:
                "AI, machine learning and intelligent systems."
        },

        "Emerging Technology": {
            icon: "🚀",
            gradient:
                "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
            description:
                "Next-generation and emerging technologies."
        },

        "Digital Transformation": {
            icon: "💡",
            gradient:
                "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
            description:
                "Digital innovation and transformation research."
        },

        "Computing": {
            icon: "💻",
            gradient:
                "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            description:
                "Advanced computing and technology systems."
        }

    };


    main.innerHTML = `

        <div class="dashboard-header">

            <span class="dashboard-label">
                RESEARCH INTELLIGENCE
            </span>

            <h1>
                Research Analytics
            </h1>

            <p>
                Analyze funding activity and research areas.
            </p>

        </div>


        <!-- ==================================================
             ANALYTICS STATISTICS
        =================================================== -->

        <div style="
            display:grid;
            grid-template-columns:
            repeat(auto-fit,minmax(200px,1fr));
            gap:20px;
            margin-top:25px;
        ">


            <div class="stat-card">

                <strong>
                    Total Opportunities
                </strong>

                <h2>
                    ${total}
                </h2>

            </div>


            <div class="stat-card">

                <strong>
                    Research Grants
                </strong>

                <h2>
                    ${research}
                </h2>

            </div>


            <div class="stat-card">

                <strong>
                    Innovation Grants
                </strong>

                <h2>
                    ${innovation}
                </h2>

            </div>


            <div class="stat-card">

                <strong>
                    Average AI Match
                </strong>

                <h2>
                    ${average}%
                </h2>

            </div>

        </div>


        <!-- ==================================================
             RESEARCH AREAS - COLORFUL UI
        =================================================== -->

        <div style="
            background:linear-gradient(
                135deg,
                #f8f9ff 0%,
                #eef2ff 100%
            );
            border-radius:18px;
            padding:28px;
            margin-top:28px;
            border:1px solid #dfe4ff;
            box-shadow:
                0 10px 30px rgba(67,56,202,0.08);
        ">

            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:15px;
                margin-bottom:22px;
                flex-wrap:wrap;
            ">

                <div>

                    <div style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                        margin-bottom:6px;
                    ">

                        <span style="
                            width:38px;
                            height:38px;
                            border-radius:10px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:linear-gradient(
                                135deg,
                                #6d28d9,
                                #4f46e5
                            );
                            color:white;
                            font-size:19px;
                        ">
                            ◈
                        </span>

                        <h2 style="
                            margin:0;
                            color:#111827;
                            font-size:22px;
                        ">
                            Research Areas
                        </h2>

                    </div>

                    <p style="
                        margin:0;
                        color:#64748b;
                        font-size:14px;
                    ">
                        Key technology areas represented
                        in the funding opportunities.
                    </p>

                </div>


                <div style="
                    background:#ffffff;
                    padding:8px 14px;
                    border-radius:20px;
                    border:1px solid #dbe2ff;
                    color:#4f46e5;
                    font-size:13px;
                    font-weight:700;
                ">

                    ${Object.keys(areas).length}
                    Areas

                </div>

            </div>


            <div style="
                display:grid;
                grid-template-columns:
                repeat(auto-fit,minmax(220px,1fr));
                gap:18px;
            ">

                ${Object.entries(areas)
                    .map(
                        ([area, count]) => {

                            const style =
                                areaStyles[area] ||
                                {
                                    icon: "🔬",
                                    gradient:
                                        "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                    description:
                                        "Research and innovation area."
                                };

                            return `

                                <div
                                    style="
                                        position:relative;
                                        overflow:hidden;
                                        background:#ffffff;
                                        border-radius:16px;
                                        padding:0;
                                        border:1px solid #e2e8f0;
                                        box-shadow:
                                            0 6px 20px
                                            rgba(15,23,42,0.08);
                                        transition:
                                            transform 0.2s ease,
                                            box-shadow 0.2s ease;
                                    "
                                    onmouseover="
                                        this.style.transform='translateY(-4px)';
                                        this.style.boxShadow='0 12px 28px rgba(15,23,42,0.14)';
                                    "
                                    onmouseout="
                                        this.style.transform='translateY(0)';
                                        this.style.boxShadow='0 6px 20px rgba(15,23,42,0.08)';
                                    "
                                >

                                    <!-- COLOR HEADER -->

                                    <div style="
                                        background:${style.gradient};
                                        padding:20px;
                                        color:white;
                                    ">

                                        <div style="
                                            display:flex;
                                            align-items:center;
                                            justify-content:space-between;
                                        ">

                                            <div style="
                                                width:46px;
                                                height:46px;
                                                border-radius:13px;
                                                background:rgba(
                                                    255,
                                                    255,
                                                    255,
                                                    0.20
                                                );
                                                display:flex;
                                                align-items:center;
                                                justify-content:center;
                                                font-size:23px;
                                                backdrop-filter:blur(5px);
                                            ">
                                                ${style.icon}
                                            </div>


                                            <div style="
                                                background:rgba(
                                                    255,
                                                    255,
                                                    255,
                                                    0.20
                                                );
                                                border-radius:20px;
                                                padding:6px 11px;
                                                font-size:13px;
                                                font-weight:700;
                                            ">
                                                ${count}
                                            </div>

                                        </div>

                                    </div>


                                    <!-- CARD CONTENT -->

                                    <div style="
                                        padding:18px;
                                    ">

                                        <h3 style="
                                            margin:
                                            0 0 8px 0;
                                            color:#111827;
                                            font-size:17px;
                                        ">
                                            ${area}
                                        </h3>


                                        <p style="
                                            margin:
                                            0 0 15px 0;
                                            color:#64748b;
                                            font-size:13px;
                                            line-height:1.5;
                                        ">
                                            ${style.description}
                                        </p>


                                        <div style="
                                            display:flex;
                                            align-items:center;
                                            justify-content:space-between;
                                            padding-top:12px;
                                            border-top:
                                            1px solid #eef2f7;
                                        ">

                                            <span style="
                                                color:#64748b;
                                                font-size:12px;
                                            ">
                                                Opportunities
                                            </span>

                                            <strong style="
                                                color:#4f46e5;
                                                font-size:15px;
                                            ">
                                                ${count}
                                            </strong>

                                        </div>

                                    </div>

                                </div>
                            `;
                        }
                    )
                    .join("")}

            </div>

        </div>
    `;
}

// ============================================================
// PATENT INTELLIGENCE
// ============================================================

function renderPatentPage() {

    const main =
        $("dashboardMain");

    if (!main) return;

    main.innerHTML = `

        <div class="dashboard-header">

            <span class="dashboard-label">
                PATENT INTELLIGENCE
            </span>

            <h1>
                Patent Intelligence
            </h1>

            <p>
                Analyze patents and identify technology opportunities.
            </p>

        </div>


        <div style="
            background:#ffffff;
            padding:25px;
            border-radius:12px;
            margin-top:25px;
            max-width:900px;
        ">

            <h2>
                Patent Analysis
            </h2>

            <p>
                Explore patent information related to your research.
            </p>


            <label>
                Patent / Technology Search
            </label>


            <input
                id="patentSearchInput"
                type="text"
                placeholder="Enter patent title, technology or keyword"
                style="
                    width:100%;
                    padding:13px;
                    margin:10px 0;
                    box-sizing:border-box;
                    border:1px solid #ddd;
                    border-radius:8px;
                "
            />


            <button
                id="patentSearchButton"
                type="button"
                style="
                    padding:13px 20px;
                    border:none;
                    border-radius:8px;
                    cursor:pointer;
                    font-weight:600;
                "
            >
                ◌ Search Patents
            </button>


            <div
                id="patentResults"
                style="
                    margin-top:25px;
                "
            ></div>

        </div>


        <div style="
            background:linear-gradient(
                135deg,
                #f8f9ff 0%,
                #eef2ff 100%
            );
            padding:25px;
            border-radius:16px;
            margin-top:20px;
            max-width:900px;
            border:1px solid #dfe4ff;
        ">

            <h2 style="
                color:#111827;
                margin-top:0;
            ">
                Technology Landscape
            </h2>

            <p style="
                color:#64748b;
            ">
                Identify technologies and innovation areas
                related to your research.
            </p>


            <div style="
                display:grid;
                grid-template-columns:
                repeat(auto-fit,minmax(220px,1fr));
                gap:15px;
                margin-top:20px;
            ">


                <div style="
                    padding:20px;
                    background:#ffffff;
                    border:1px solid #ddd;
                    border-radius:12px;
                    box-shadow:
                        0 5px 15px rgba(0,0,0,0.05);
                ">

                    <strong style="
                        color:#4f46e5;
                    ">
                        Technology Trends
                    </strong>

                    <p style="
                        color:#64748b;
                    ">
                        Explore emerging technologies.
                    </p>

                </div>


                <div style="
                    padding:20px;
                    background:#ffffff;
                    border:1px solid #ddd;
                    border-radius:12px;
                    box-shadow:
                        0 5px 15px rgba(0,0,0,0.05);
                ">

                    <strong style="
                        color:#7c3aed;
                    ">
                        Innovation Areas
                    </strong>

                    <p style="
                        color:#64748b;
                    ">
                        Identify important research areas.
                    </p>

                </div>


                <div style="
                    padding:20px;
                    background:#ffffff;
                    border:1px solid #ddd;
                    border-radius:12px;
                    box-shadow:
                        0 5px 15px rgba(0,0,0,0.05);
                ">

                    <strong style="
                        color:#2563eb;
                    ">
                        Patent Opportunities
                    </strong>

                    <p style="
                        color:#64748b;
                    ">
                        Identify potential technology opportunities.
                    </p>

                </div>

            </div>

        </div>
    `;


    // --------------------------------------------------------
    // PATENT SEARCH BUTTON
    // --------------------------------------------------------

    const searchButton =
        $("patentSearchButton");

    if (!searchButton) return;


    searchButton.addEventListener(
        "click",
        async () => {

            const input =
                $("patentSearchInput");

            const results =
                $("patentResults");

            const query =
                input.value.trim();


            if (!query) {

                results.innerHTML = `

                    <div class="no-results">

                        <div class="no-results-icon">
                            ⚠
                        </div>

                        <h3>
                            Enter a search keyword
                        </h3>

                        <p>
                            Enter a patent title,
                            technology or research keyword.
                        </p>

                    </div>
                `;

                return;
            }


            results.innerHTML = `

                <div class="no-results">

                    <div class="no-results-icon">
                        ⏳
                    </div>

                    <h3>
                        Searching patents...
                    </h3>

                    <p>
                        Searching for
                        <strong>
                            ${query}
                        </strong>
                    </p>

                </div>
            `;


            searchButton.disabled = true;

            searchButton.textContent =
                "⏳ Searching...";


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/patent/search`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                query:
                                    query

                            })
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `Server error ${response.status}`
                    );
                }


                const data =
                    await response.json();


                if (
                    !data.success ||
                    !Array.isArray(
                        data.results
                    )
                ) {

                    throw new Error(
                        "Invalid patent API response"
                    );
                }


                if (
                    !data.results.length
                ) {

                    results.innerHTML = `

                        <div class="no-results">

                            <h3>
                                No patents found
                            </h3>

                            <p>
                                No patent information
                                was found for
                                <strong>
                                    ${query}
                                </strong>.
                            </p>

                        </div>
                    `;

                    return;
                }


                results.innerHTML = `

                    <h2>
                        Patent Results
                    </h2>

                    <p>
                        ${data.results.length}
                        patent(s) found for
                        <strong>
                            ${query}
                        </strong>
                    </p>


                    <div style="
                        display:flex;
                        flex-direction:column;
                        gap:15px;
                    ">


                        ${data.results
                            .map(
                                patent => `

                                <article style="
                                    background:#ffffff;
                                    color:#111827;
                                    border-radius:12px;
                                    padding:20px;
                                    border:1px solid #e4e4e4;
                                ">


                                    <div style="
                                        color:#6d28d9;
                                        font-size:12px;
                                        font-weight:700;
                                    ">

                                        PATENT
                                        INTELLIGENCE

                                    </div>


                                    <h3>
                                        ${
                                            patent.title ||
                                            "Untitled Patent"
                                        }
                                    </h3>


                                    <p>

                                        <strong>
                                            Patent Number:
                                        </strong>

                                        ${
                                            patent.patent_number ||
                                            "Not available"
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Technology:
                                        </strong>

                                        ${
                                            patent.technology ||
                                            "Not available"
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Status:
                                        </strong>

                                        ${
                                            patent.status ||
                                            "Not available"
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Applicant:
                                        </strong>

                                        ${
                                            patent.applicant ||
                                            "Not available"
                                        }

                                    </p>


                                    <p>

                                        ${
                                            patent.description ||
                                            "No description available."
                                        }

                                    </p>

                                </article>
                            `
                            )
                            .join("")}

                    </div>
                `;

            } catch (error) {

                console.error(
                    "Patent search error:",
                    error
                );


                results.innerHTML = `

                    <div class="no-results">

                        <div class="no-results-icon">
                            ⚠
                        </div>

                        <h3>
                            Unable to search patents
                        </h3>

                        <p>
                            Make sure your FastAPI backend
                            is running on port 8001.
                        </p>

                        <p>
                            <strong>
                                ${error.message}
                            </strong>
                        </p>

                    </div>
                `;

            } finally {

                searchButton.disabled =
                    false;

                searchButton.textContent =
                    "◌ Search Patents";
            }

        }
    );
}

// ============================================================
// SET SECTION
// ============================================================

function setSection(section) {

    activeSection =
        section;


    const button =
        document.querySelector(
            `.sidebar-item[data-section="${section}"]`
        );


    setActiveSidebar(
        button
    );


    // ========================================================
    // COMMERCIALIZATION
    // ========================================================

    if (
        section ===
        "commercialization"
    ) {

        window.location.href =
            "commercialization.html";

        return;
    }


    // ========================================================
    // AI RECOMMENDATIONS
    // ========================================================

    if (
        section ===
        "ai"
    ) {

        renderAIRecommendationsPage();

        return;
    }


    // ========================================================
    // RESEARCH ANALYTICS
    // ========================================================

    if (
        section ===
        "research"
    ) {

        renderResearchAnalyticsPage();

        return;
    }


    // ========================================================
    // PATENT INTELLIGENCE
    // ========================================================

    if (
        section ===
        "patent"
    ) {

        renderPatentPage();

        return;
    }


    // ========================================================
    // FUNDING
    // ========================================================

    if (
        section === "dashboard" ||
        section === "discover" ||
        section === "saved"
    ) {

        const main =
            $("dashboardMain");

        if (main) {

            main.style.display =
                "";
        }


        renderStats();

        renderCards();

        return;
    }


    // ========================================================
    // SETTINGS / HELP
    // ========================================================

    const labels = {

        settings: [
            "ACCOUNT",
            "Settings",
            "Manage your ResearchIQ preferences."
        ],

        help: [
            "SUPPORT",
            "Help & Support",
            "Find guidance and support for ResearchIQ."
        ]

    };


    const data =
        labels[section];


    if (!data) return;


    const main =
        $("dashboardMain");


    if (!main) return;


    main.innerHTML = `

        <div class="dashboard-header">

            <span class="dashboard-label">
                ${data[0]}
            </span>

            <h1>
                ${data[1]}
            </h1>

            <p>
                ${data[2]}
            </p>

        </div>
    `;
}

// ============================================================
// OPEN DOCUMENT
// ============================================================

function openDocument(id) {

    const doc =
        fundingDocuments.find(
            d =>
                d.id ===
                Number(id)
        );


    if (!doc) return;


    const title =
        $("documentViewerTitle");

    const paper =
        $("documentPaper");

    const viewer =
        $("documentViewer");


    if (
        !title ||
        !paper ||
        !viewer
    ) {

        return;
    }


    title.textContent =
        doc.title;


    paper.innerHTML = `

        <div class="document-heading">
            ${doc.title}
        </div>


        <div class="document-section">

            <strong>
                Organization
            </strong>

            <p>
                ${doc.organization}
            </p>

        </div>


        <div class="document-section">

            <strong>
                Funding Amount
            </strong>

            <p>
                ${doc.amount}
            </p>

        </div>


        <div class="document-section">

            <strong>
                Deadline
            </strong>

            <p>
                ${doc.deadline}
            </p>

        </div>


        <div class="document-section">

            <strong>
                Funding Type
            </strong>

            <p>
                ${doc.type}
            </p>

        </div>


        <div class="document-section">

            <strong>
                Research Area
            </strong>

            <p>
                ${doc.area}
            </p>

        </div>


        <div class="document-section">

            <strong>
                Eligibility
            </strong>

            <p>
                ${doc.eligibility}
            </p>

        </div>


        <div class="document-section">

            <strong>
                Description
            </strong>

            <p>
                ${doc.description}
            </p>

        </div>
    `;


    viewer.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";
}

// ============================================================
// CLOSE DOCUMENT
// ============================================================

function closeDocument() {

    const viewer =
        $("documentViewer");


    if (!viewer) return;


    viewer.style.display =
        "none";


    document.body.style.overflow =
        "";
}

// ============================================================
// SAVE / UNSAVE
// ============================================================

function toggleSaved(id) {

    id =
        Number(id);


    if (
        savedIds.has(id)
    ) {

        savedIds.delete(id);

    } else {

        savedIds.add(id);
    }


    saveState();

    renderCards();
}

// ============================================================
// DOM LOADED
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ====================================================
        // INITIAL PAGE
        // ====================================================

        renderStats();

        renderCards();


        // ====================================================
        // SEARCH FORM
        // ====================================================

        const fundingSearch =
            $("fundingSearch");


        if (fundingSearch) {

            fundingSearch.addEventListener(
                "submit",
                event => {

                    event.preventDefault();


                    const input =
                        $("searchInput");


                    if (!input) return;


                    searchQuery =
                        input.value;


                    renderCards();
                }
            );
        }


        // ====================================================
        // SEARCH INPUT
        // ====================================================

        const searchInput =
            $("searchInput");


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                event => {

                    searchQuery =
                        event.target.value;


                    const clearSearch =
                        $("clearSearch");


                    if (clearSearch) {

                        clearSearch.style.display =
                            searchQuery
                                ? "block"
                                : "none";
                    }


                    renderCards();
                }
            );
        }


        // ====================================================
        // CLEAR SEARCH
        // ====================================================

        const clearSearch =
            $("clearSearch");


        if (clearSearch) {

            clearSearch.addEventListener(
                "click",
                () => {

                    searchQuery =
                        "";


                    if (searchInput) {

                        searchInput.value =
                            "";
                    }


                    clearSearch.style.display =
                        "none";


                    renderCards();
                }
            );
        }


        // ====================================================
        // POPULAR SEARCH
        // ====================================================

        document
            .querySelectorAll(
                "[data-search]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        searchQuery =
                            button.dataset.search;


                        if (searchInput) {

                            searchInput.value =
                                searchQuery;
                        }


                        if (clearSearch) {

                            clearSearch.style.display =
                                "block";
                        }


                        renderCards();
                    }
                );
            });


        // ====================================================
        // FILTER BUTTON
        // ====================================================

        const filterButton =
            $("filterButton");


        if (filterButton) {

            filterButton.addEventListener(
                "click",
                () => {

                    const panel =
                        $("filterPanel");


                    if (!panel) return;


                    panel.style.display =
                        panel.style.display ===
                        "none"
                            ? "block"
                            : "none";
                }
            );
        }


        // ====================================================
        // FILTERS
        // ====================================================

        [
            "fundingType",
            "researchArea",
            "organization"
        ].forEach(id => {

            const element =
                $(id);


            if (!element) return;


            element.addEventListener(
                "change",
                () => {

                    filters[id] =
                        element.value;


                    renderCards();
                }
            );
        });


        // ====================================================
        // CLEAR FILTERS
        // ====================================================

        const clearFilters =
            $("clearFilters");


        if (clearFilters) {

            clearFilters.addEventListener(
                "click",
                () => {

                    filters = {

                        fundingType:
                            "All",

                        researchArea:
                            "All",

                        organization:
                            "All"

                    };


                    const fundingType =
                        $("fundingType");

                    const researchArea =
                        $("researchArea");

                    const organization =
                        $("organization");


                    if (fundingType) {

                        fundingType.value =
                            "All";
                    }


                    if (researchArea) {

                        researchArea.value =
                            "All";
                    }


                    if (organization) {

                        organization.value =
                            "All";
                    }


                    renderCards();
                }
            );
        }


        // ====================================================
        // SORT
        // ====================================================

        const sortButton =
            $("sortButton");


        if (sortButton) {

            sortButton.addEventListener(
                "click",
                () => {

                    sortAscending =
                        !sortAscending;


                    sortButton.textContent =
                        sortAscending
                            ? "Sort by Match ↑"
                            : "Sort by Match ↓";


                    renderCards();
                }
            );
        }


        // ====================================================
        // FUNDING CARD ACTIONS
        // ====================================================

        const fundingGrid =
            $("fundingGrid");


        if (fundingGrid) {

            fundingGrid.addEventListener(
                "click",
                event => {

                    const saveButton =
                        event.target.closest(
                            "[data-save-id]"
                        );


                    if (saveButton) {

                        toggleSaved(
                            saveButton.dataset.saveId
                        );

                        return;
                    }


                    const viewButton =
                        event.target.closest(
                            "[data-view-id]"
                        );


                    if (viewButton) {

                        openDocument(
                            viewButton.dataset.viewId
                        );
                    }

                }
            );
        }


        // ====================================================
        // DOCUMENT VIEWER
        // ====================================================

        const documentClose =
            $("documentClose");


        if (documentClose) {

            documentClose.addEventListener(
                "click",
                closeDocument
            );
        }


        const documentFooterClose =
            $("documentFooterClose");


        if (documentFooterClose) {

            documentFooterClose.addEventListener(
                "click",
                closeDocument
            );
        }


        const documentViewer =
            $("documentViewer");


        if (documentViewer) {

            documentViewer.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        documentViewer
                    ) {

                        closeDocument();
                    }
                }
            );
        }


        // ====================================================
        // BACK TO HOME
        // ====================================================

        const backToHome =
            $("backToHome");


        if (backToHome) {

            backToHome.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "index.html";
                }
            );
        }


        // ====================================================
        // SIDEBAR
        // ====================================================

        document
            .querySelectorAll(
                ".sidebar-item"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        setSection(
                            button.dataset.section
                        );
                    }
                );
            });


        // ====================================================
        // NOTIFICATION
        // ====================================================

        const notificationButton =
            $("notificationButton");


        if (notificationButton) {

            notificationButton.addEventListener(
                "click",
                () => {

                    alert(
                        "You have new ResearchIQ notifications."
                    );
                }
            );
        }


        // ====================================================
        // PREMIUM
        // ====================================================

        const premiumButton =
            $("premiumButton");


        if (premiumButton) {

            premiumButton.addEventListener(
                "click",
                () => {

                    alert(
                        "Premium intelligence features coming soon."
                    );
                }
            );
        }

    }
);