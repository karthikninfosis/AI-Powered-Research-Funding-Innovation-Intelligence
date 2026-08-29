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
    description: "Funding opportunity supporting innovative research projects in artificial intelligence and intelligent systems.",
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
    description: "Supports research and development projects focused on emerging technologies and digital innovation.",
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
    description: "Funding for research projects that develop practical solutions for digital transformation.",
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
    description: "Supports innovative research in next-generation computing, intelligent systems and advanced technologies.",
    eligibility: "Universities & Technology Companies"
  }
];

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
  JSON.parse(localStorage.getItem(savedKey) || "[]").map(Number)
);

const $ = id => document.getElementById(id);

function saveState() {
  localStorage.setItem(savedKey, JSON.stringify([...savedIds]));
}

function getFilteredDocuments() {
  let result = fundingDocuments.filter(doc => {
    const q = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.organization.toLowerCase().includes(q) ||
      doc.area.toLowerCase().includes(q);

    const matchesType =
      filters.fundingType === "All" || doc.type === filters.fundingType;

    const matchesArea =
      filters.researchArea === "All" || doc.area === filters.researchArea;

    const matchesOrganization =
      filters.organization === "All" ||
      doc.organization === filters.organization;

    return matchesSearch && matchesType && matchesArea && matchesOrganization;
  });

  result.sort((a, b) => sortAscending ? a.match - b.match : b.match - a.match);
  return result;
}

function renderStats() {
  const avg = fundingDocuments.length
    ? Math.round(
        fundingDocuments.reduce((sum, doc) => sum + doc.match, 0) /
        fundingDocuments.length
      )
    : 0;

  $("fundingStats").innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">◈</div>
      <div class="stat-content">
        <span class="stat-value">${fundingDocuments.length}</span>
        <strong>Total Opportunities</strong>
        <span class="stat-description">Available funding</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">◆</div>
      <div class="stat-content">
        <span class="stat-value">${fundingDocuments.filter(d => d.type === "Research Grant").length}</span>
        <strong>Research Grants</strong>
        <span class="stat-description">Research focused</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">✦</div>
      <div class="stat-content">
        <span class="stat-value">${fundingDocuments.filter(d => d.type === "Innovation Grant").length}</span>
        <strong>Innovation Grants</strong>
        <span class="stat-description">Innovation focused</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">◎</div>
      <div class="stat-content">
        <span class="stat-value">${avg}%</span>
        <strong>Avg. Match Score</strong>
        <span class="stat-description">AI relevance score</span>
      </div>
    </div>
  `;
}

function cardHTML(doc) {
  const saved = savedIds.has(doc.id);

  return `
    <article class="funding-card">
      <div class="funding-card-top">
        <div class="funding-type">${doc.type}</div>
        <button
          type="button"
          class="save-button ${saved ? "saved" : ""}"
          data-save-id="${doc.id}"
          aria-label="${saved ? "Remove from saved" : "Save opportunity"}"
          title="${saved ? "Remove from saved" : "Save opportunity"}"
        >${saved ? "♥" : "♡"}</button>
      </div>

      <div class="funding-card-content">
        <div class="organization-name">${doc.organization}</div>
        <h3>${doc.title}</h3>
        <p class="funding-description">${doc.description}</p>

        <div class="funding-details">
          <div class="funding-detail">
            <span class="detail-icon">💰</span>
            <div>
              <span class="detail-label">Funding Amount</span>
              <strong>${doc.amount}</strong>
            </div>
          </div>

          <div class="funding-detail">
            <span class="detail-icon">◷</span>
            <div>
              <span class="detail-label">Deadline</span>
              <strong>${doc.deadline}</strong>
            </div>
          </div>
        </div>

        <div class="eligibility">
          <span>✓</span>
          <div>
            <span class="detail-label">Eligibility</span>
            <strong>${doc.eligibility}</strong>
          </div>
        </div>

        <div class="funding-card-footer">
          <div class="match-score">
            <div
              class="match-circle"
              style="--match-score:${doc.match * 3.6}deg"
            ><span>${doc.match}%</span></div>
            <div>
              <strong>AI Match</strong>
              <span>Relevance score</span>
            </div>
          </div>

          <button
            type="button"
            class="view-document-button"
            data-view-id="${doc.id}"
          >
            View Document <span>→</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderCards() {
  let docs = getFilteredDocuments();

  if (activeSection === "saved") {
    docs = docs.filter(doc => savedIds.has(doc.id));
  }

  $("resultCount").textContent =
    `${docs.length} ${docs.length === 1 ? "opportunity" : "opportunities"} found`;

  if (!docs.length) {
    $("fundingGrid").innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">⌕</div>
        <h3>${activeSection === "saved" ? "No saved opportunities" : "No funding opportunities found"}</h3>
        <p>${activeSection === "saved" ? "Click the ♡ icon on a funding card to save an opportunity." : "Try changing your search keywords or filters."}</p>
      </div>
    `;
    return;
  }

  $("fundingGrid").innerHTML = docs.map(cardHTML).join("");
}

function setActiveSidebar(button) {
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.classList.remove("active");
  });
  button.classList.add("active");
}

function setSection(section) {
  activeSection = section;
  const button = document.querySelector(`.sidebar-item[data-section="${section}"]`);
  if (button) setActiveSidebar(button);

  if (section === "discover" || section === "dashboard" || section === "saved") {
    $("dashboardMain").style.display = "";
    renderCards();

    if (section === "saved") {
      $("resultCount").textContent =
        `${[...savedIds].filter(id => fundingDocuments.some(d => d.id === id)).length} saved ${savedIds.size === 1 ? "opportunity" : "opportunities"} found`;
    }
    return;
  }

  const labels = {
    research: ["RESEARCH INTELLIGENCE", "Research Analytics", "Analyze publication trends, emerging research areas and research hotspots."],
    patent: ["PATENT INTELLIGENCE", "Patent Intelligence", "Explore patent landscapes, intellectual property activity and competitive innovation signals."],
    ai: ["AI INTELLIGENCE", "AI Recommendations", "Use AI-powered recommendations to identify relevant opportunities and innovation pathways."],
    settings: ["ACCOUNT", "Settings", "Manage your ResearchIQ preferences and account settings."],
    help: ["SUPPORT", "Help & Support", "Find guidance and support for using the ResearchIQ platform."]
  };

  const [label, title, description] = labels[section];
  $("dashboardMain").innerHTML = `
    <div class="dashboard-header">
      <div>
        <span class="dashboard-label">${label}</span>
        <h1>${title}</h1>
        <p>${description}</p>
      </div>
    </div>
    <div class="no-results" style="margin-top:30px">
      <div class="no-results-icon">✦</div>
      <h3>${title}</h3>
      <p>This section is ready for its next module. The existing Funding Intelligence interface remains unchanged.</p>
    </div>
  `;
}

function openDocument(id) {
  const doc = fundingDocuments.find(d => d.id === Number(id));
  if (!doc) return;

  $("documentViewerTitle").textContent = doc.title;

  $("documentPaper").innerHTML = `
    <div class="document-heading">${doc.title}</div>
    <div class="document-line"></div>

    <div class="document-section">
      <strong>Organization</strong>
      <p>${doc.organization}</p>
    </div>

    <div class="document-section">
      <strong>Funding Amount</strong>
      <p>${doc.amount}</p>
    </div>

    <div class="document-section">
      <strong>Deadline</strong>
      <p>${doc.deadline}</p>
    </div>

    <div class="document-section">
      <strong>Funding Type</strong>
      <p>${doc.type}</p>
    </div>

    <div class="document-section">
      <strong>Research Area</strong>
      <p>${doc.area}</p>
    </div>

    <div class="document-section">
      <strong>Eligibility</strong>
      <p>${doc.eligibility}</p>
    </div>

    <div class="document-section">
      <strong>Description</strong>
      <p>${doc.description}</p>
    </div>
  `;

  $("documentViewer").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeDocument() {
  $("documentViewer").style.display = "none";
  document.body.style.overflow = "";
}

function toggleSaved(id) {
  id = Number(id);

  if (savedIds.has(id)) {
    savedIds.delete(id);
  } else {
    savedIds.add(id);
  }

  saveState();
  renderCards();
}

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderCards();

  $("fundingSearch").addEventListener("submit", event => {
    event.preventDefault();
    searchQuery = $("searchInput").value;
    renderCards();
  });

  $("searchInput").addEventListener("input", event => {
    searchQuery = event.target.value;

    $("clearSearch").style.display =
      searchQuery ? "block" : "none";

    renderCards();
  });

  $("clearSearch").addEventListener("click", () => {
    searchQuery = "";
    $("searchInput").value = "";
    $("clearSearch").style.display = "none";
    renderCards();
  });

  document.querySelectorAll("[data-search]").forEach(button => {
    button.addEventListener("click", () => {
      searchQuery = button.dataset.search;
      $("searchInput").value = searchQuery;
      $("clearSearch").style.display = "block";
      renderCards();
    });
  });

  $("filterButton").addEventListener("click", () => {
    const panel = $("filterPanel");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

  ["fundingType", "researchArea", "organization"].forEach(id => {
    $(id).addEventListener("change", () => {
      filters[id] = $(id).value;
      renderCards();
    });
  });

  $("clearFilters").addEventListener("click", () => {
    filters = {
      fundingType: "All",
      researchArea: "All",
      organization: "All"
    };

    $("fundingType").value = "All";
    $("researchArea").value = "All";
    $("organization").value = "All";

    renderCards();
  });

  $("sortButton").addEventListener("click", () => {
    sortAscending = !sortAscending;
    $("sortButton").textContent =
      sortAscending ? "Sort by Match ↑" : "Sort by Match ↓";
    renderCards();
  });

  $("fundingGrid").addEventListener("click", event => {
    const saveButton = event.target.closest("[data-save-id]");
    if (saveButton) {
      toggleSaved(saveButton.dataset.saveId);
      return;
    }

    const viewButton = event.target.closest("[data-view-id]");
    if (viewButton) {
      openDocument(viewButton.dataset.viewId);
    }
  });

  $("documentClose").addEventListener("click", closeDocument);
  $("documentFooterClose").addEventListener("click", closeDocument);

  $("documentViewer").addEventListener("click", event => {
    if (event.target === $("documentViewer")) {
      closeDocument();
    }
  });

  $("backToHome").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  document.querySelectorAll(".sidebar-item").forEach(button => {
    button.addEventListener("click", () => {
      setSection(button.dataset.section);
    });
  });

  $("notificationButton").addEventListener("click", () => {
    alert("You have new ResearchIQ notifications.");
  });

  $("premiumButton").addEventListener("click", () => {
    alert("Premium intelligence features can be connected in the next phase.");
  });
});
