const RESEARCHER_API_BASE = API_BASE_URL;

let currentUser = null;
let activityChart;
let trendChart;
let publicationChart;

document.addEventListener("DOMContentLoaded", async () => {
    await verifyResearcher();

    setupCharts();
    setupFunding();
    setupInnovationScore();
    setupDocuments();

    await loadPublications();
    await loadPatents();
    await loadDocuments();
});
/* =========================================================
   PUBLICATIONS
========================================================= */

async function loadPublications() {

    const container =
        document.getElementById("publicationList");

    if (!container) {
        return;
    }

    try {

        if (!currentUser || !currentUser.user_id) {
            return;
        }

        const response = await authFetch(
            `${RESEARCHER_API_BASE}/api/publications`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to fetch publications"
            );
        }

        const data = await response.json();

        console.log(
            "All publications:",
            data
        );

        /*
         IMPORTANT:
         Match using user_id only.
         Do NOT use _id.
        */

        const publications =
            Array.isArray(data)
                ? data.filter(
                    publication =>
                        String(
                            publication.user_id
                        ) ===
                        String(
                            currentUser.user_id
                        )
                )
                : [];

        console.log(
            "Current user publications:",
            publications
        );

        renderPublications(
            publications
        );

        document.getElementById(
            "overviewPublications"
        ).textContent =
            publications.length;

    } catch (error) {

        console.error(
            "Publication loading error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load publications.
            </div>
        `;
    }
}


/* =========================================================
   RENDER PUBLICATIONS
========================================================= */

function renderPublications(
    publications
) {

    const container =
        document.getElementById(
            "publicationList"
        );

    if (!container) {
        return;
    }

    if (!publications.length) {

        container.innerHTML = `
            <div class="empty-state">
                No publications found for your profile.
            </div>
        `;

        return;
    }


    container.innerHTML =
        publications
            .map(
                (publication, index) => {

                    const title =
                        publication.title ||
                        publication.name ||
                        `Publication ${index + 1}`;

                    const description =
                        publication.abstract ||
                        publication.description ||
                        publication.summary ||
                        "";

                    const journal =
                        publication.journal ||
                        publication.journal_name ||
                        publication.venue ||
                        "";

                    const year =
                        publication.year ||
                        publication.publication_year ||
                        "";

                    const date =
                        publication.published_at ||
                        publication.publication_date ||
                        publication.created_at ||
                        "";


                    return `

                        <div class="publication-card">

                            <div class="publication-number">
                                ${index + 1}
                            </div>

                            <div class="publication-content">

                                <h4>
                                    ${escapeHTML(title)}
                                </h4>

                                ${
                                    journal
                                        ? `
                                            <div class="publication-meta">
                                                ${escapeHTML(journal)}
                                            </div>
                                          `
                                        : ""
                                }

                                ${
                                    year
                                        ? `
                                            <span class="publication-year">
                                                ${escapeHTML(year)}
                                            </span>
                                          `
                                        : ""
                                }

                                ${
                                    description
                                        ? `
                                            <p>
                                                ${escapeHTML(description)}
                                            </p>
                                          `
                                        : ""
                                }

                                ${
                                    date
                                        ? `
                                            <small>
                                                ${escapeHTML(
                                                    formatDate(date)
                                                )}
                                            </small>
                                          `
                                        : ""
                                }

                            </div>

                        </div>

                    `;

                }
            )
            .join("");
}
/* =========================================================
   PATENTS
========================================================= */

async function loadPatents() {

    const container =
        document.getElementById(
            "patentList"
        );

    if (!container) {
        return;
    }


    try {

        if (!currentUser || !currentUser.user_id) {
            return;
        }


        const response =
            await authFetch(
                `${RESEARCHER_API_BASE}/api/patents`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to fetch patents"
            );

        }


        const data =
            await response.json();


        console.log(
            "All patents:",
            data
        );


        /*
         IMPORTANT:
         Match using user_id only.
         Do NOT use _id.
        */

        const patents =
            Array.isArray(data)
                ? data.filter(
                    patent =>
                        String(
                            patent.user_id
                        ) ===
                        String(
                            currentUser.user_id
                        )
                )
                : [];


        console.log(
            "Current user patents:",
            patents
        );


        renderPatents(
            patents
        );


        document.getElementById(
            "overviewPatents"
        ).textContent =
            patents.length;


    } catch (error) {

        console.error(
            "Patent loading error:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">
                Unable to load patents.
            </div>

        `;
    }
}


/* =========================================================
   RENDER PATENTS
========================================================= */

function renderPatents(
    patents
) {

    const container =
        document.getElementById(
            "patentList"
        );


    if (!container) {
        return;
    }


    if (!patents.length) {

        container.innerHTML = `

            <div class="empty-state">
                No patents found for your profile.
            </div>

        `;

        return;
    }


    container.innerHTML =
        patents
            .map(
                (patent, index) => {

                    const title =
                        patent.title ||
                        patent.name ||
                        patent.patent_title ||
                        `Patent ${index + 1}`;


                    const description =
                        patent.abstract ||
                        patent.description ||
                        patent.summary ||
                        "";


                    const status =
                        patent.status ||
                        patent.application_status ||
                        "";


                    const patentNumber =
                        patent.patent_number ||
                        patent.application_number ||
                        patent.number ||
                        "";


                    const date =
                        patent.filed_at ||
                        patent.filing_date ||
                        patent.created_at ||
                        "";


                    return `

                        <div class="patent-list-card">

                            <div class="patent-number">
                                ${index + 1}
                            </div>


                            <div class="patent-content">

                                <h4>
                                    ${escapeHTML(title)}
                                </h4>


                                ${
                                    patentNumber
                                        ? `
                                            <div class="patent-meta">
                                                Patent/Application No:
                                                ${escapeHTML(
                                                    patentNumber
                                                )}
                                            </div>
                                          `
                                        : ""
                                }


                                ${
                                    status
                                        ? `
                                            <span class="patent-status">
                                                ${escapeHTML(status)}
                                            </span>
                                          `
                                        : ""
                                }


                                ${
                                    description
                                        ? `
                                            <p>
                                                ${escapeHTML(
                                                    description
                                                )}
                                            </p>
                                          `
                                        : ""
                                }


                                ${
                                    date
                                        ? `
                                            <small>
                                                ${escapeHTML(
                                                    formatDate(date)
                                                )}
                                            </small>
                                          `
                                        : ""
                                }

                            </div>

                        </div>

                    `;

                }
            )
            .join("");
}

/* =========================================================
   AUTHENTICATION + RESEARCHER ROLE
========================================================= */

async function verifyResearcher() {
  try {
    const meResponse = await authFetch(
      `${RESEARCHER_API_BASE}/api/auth/me`,
      {
        credentials: "include"
      }
    );

    if (!meResponse.ok) {
      window.location.href = "/auth/login.html";
      return;
    }

    const me = await meResponse.json();

    const userResponse = await authFetch(
      `${RESEARCHER_API_BASE}/api/users/email/${encodeURIComponent(me.email)}`,
      {
        credentials: "include"
      }
    );

    if (!userResponse.ok) {
      throw new Error("Unable to load user");
    }

    currentUser = await userResponse.json();

    /* Get roles */
    const rolesResponse = await authFetch(
      `${RESEARCHER_API_BASE}/api/roles/get`,
      {
        credentials: "include"
      }
    );

    if (rolesResponse.ok) {
      const roles = await rolesResponse.json();

      const role = roles.find(
        r => String(r._id) === String(currentUser.role_id)
      );

      if (
        !role ||
        String(role.code).toLowerCase() !== "researcher"
      ) {
        alert("Access denied. Researcher role required.");
        window.location.href = "/auth/login.html";
        return;
      }

      currentUser.roleName = role.name;
      currentUser.roleCode = role.code;
    }

    /* Automatically use user ID as research ID */
    const researchIdInput =
      document.getElementById("researchId");

    if (
      researchIdInput &&
      currentUser.user_id
    ) {
      researchIdInput.value = currentUser.user_id;
    }

  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );

    window.location.href = "/auth/login.html";
  }
}


/* =========================================================
   CHARTS
========================================================= */

function setupCharts() {

  const chartOptions = {

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

        grid: {
          color: "#edf0f4"
        }
      },

      x: {
        grid: {
          display: false
        }
      }

    }

  };


  /* Research Activity */

  document
    .getElementById("activityChart")
    .parentElement
    .style.height = "300px";

  activityChart = new Chart(
    document.getElementById("activityChart"),
    {

      type: "line",

      data: {

        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun"
        ],

        datasets: [

          {

            data: [
              4,
              6,
              5,
              9,
              8,
              12
            ],

            tension: 0.35,

            borderWidth: 2,

            pointRadius: 3

          }

        ]

      },

      options: chartOptions

    }
  );


  /* Research Trends */

  document
    .getElementById("trendChart")
    .parentElement
    .style.height = "300px";

  trendChart = new Chart(
    document.getElementById("trendChart"),
    {

      type: "bar",

      data: {

        labels: [
          "AI",
          "Federated",
          "Edge",
          "Green",
          "Security"
        ],

        datasets: [

          {

            data: [
              92,
              84,
              78,
              71,
              67
            ],

            borderRadius: 5

          }

        ]

      },

      options: chartOptions

    }
  );


  /* Publications */

  document
    .getElementById("publicationChart")
    .parentElement
    .style.height = "300px";

  publicationChart = new Chart(
    document.getElementById("publicationChart"),
    {

      type: "line",

      data: {

        labels: [
          "2021",
          "2022",
          "2023",
          "2024",
          "2025",
          "2026"
        ],

        datasets: [

          {

            data: [
              2,
              5,
              9,
              14,
              18,
              24
            ],

            tension: 0.35,

            borderWidth: 2,

            pointRadius: 3

          }

        ]

      },

      options: chartOptions

    }
  );

}


/* =========================================================
   FUNDING RECOMMENDATIONS
========================================================= */

function setupFunding() {

  const form =
    document.getElementById("fundingForm");

  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      const button =
        document.getElementById(
          "fundingButton"
        );

      const message =
        document.getElementById(
          "fundingMessage"
        );

      const results =
        document.getElementById(
          "fundingResults"
        );


      const payload = {

        innovation_title:
          document
            .getElementById(
              "innovationTitle"
            )
            .value
            .trim(),

        innovation_description:
          document
            .getElementById(
              "innovationDescription"
            )
            .value
            .trim(),

        top_k:
          Number(
            document
              .getElementById("topK")
              .value
          ) || 5

      };


      button.disabled = true;

      button.textContent =
        "Loading...";

      message.textContent = "";

      results.innerHTML = "";


      try {

        const response =
          await authFetch(
            `${RESEARCHER_API_BASE}/funding/recommend`,
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              credentials: "include",

              body:
                JSON.stringify(payload)

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Funding recommendation failed"
          );

        }


        renderFundingResults(data);


      } catch (error) {

        console.error(error);

        message.textContent =
          error.message;

      } finally {

        button.disabled = false;

        button.textContent =
          "Get Recommendations";

      }

    }
  );

}


/* =========================================================
   RENDER FUNDING RESULTS
========================================================= */

function renderFundingResults(data) {

  const results =
    document.getElementById(
      "fundingResults"
    );

  const message =
    document.getElementById(
      "fundingMessage"
    );


  let items = [];


  if (Array.isArray(data)) {

    items = data;

  }

  else if (
    Array.isArray(
      data.recommendations
    )
  ) {

    items =
      data.recommendations;

  }

  else if (
    Array.isArray(data.results)
  ) {

    items =
      data.results;

  }

  else if (
    Array.isArray(
      data.funding_recommendations
    )
  ) {

    items =
      data.funding_recommendations;

  }

  else {

    items = [data];

  }


  document.getElementById(
    "overviewFunding"
  ).textContent =
    items.length;


  items.forEach(
    (item, index) => {

      const title =
        item.name ||
        item.title ||
        item.program_name ||
        item.funding_name ||
        `Funding Opportunity ${index + 1}`;


      const description =
        item.description ||
        item.reason ||
        item.details ||
        item.explanation ||
        "Recommended funding opportunity.";


      const card =
        document.createElement(
          "div"
        );

      card.className =
        "recommendation-card";


      card.innerHTML = `

        <h4>
          ${escapeHTML(title)}
        </h4>

        <p>
          ${escapeHTML(description)}
        </p>

      `;


      results.appendChild(card);

    }
  );


  message.textContent =
    `${items.length} funding recommendation(s) received.`;

}


/* =========================================================
   INNOVATION SCORE
========================================================= */

function setupInnovationScore() {

  const fileInput =
    document.getElementById(
      "researchFile"
    );

  const analyzeButton =
    document.getElementById(
      "analyzeButton"
    );

  const scoreForm =
    document.getElementById(
      "scoreForm"
    );


  /* File selection */

  fileInput.addEventListener(
    "change",
    () => {

      const file =
        fileInput.files[0];


      document.getElementById(
        "selectedFile"
      ).textContent =

        file
          ? `Selected: ${file.name}`
          : "";

    }
  );


  /* Analyze button */

  analyzeButton.addEventListener(
    "click",
    () => {

      const file =
        fileInput.files[0];


      if (!file) {

        showScoreMessage(
          "Please upload a research document first."
        );

        return;

      }


      /*
        Currently your backend does not have
        a document-analysis endpoint.

        Therefore we do NOT invent one.

        Once your AI document-analysis API
        is available, this button can send:

        const formData = new FormData();

        formData.append(
          "file",
          file
        );

        const response = await authFetch(
          "YOUR_DOCUMENT_ANALYSIS_API",
          {
            method: "POST",
            body: formData,
            credentials: "include"
          }
        );

        Then populate the five score fields.
      */


      showScoreMessage(
        "Document selected. Enter the five assessed scores, then save the result."
      );

    }
  );


  /* Save Innovation Score */

  scoreForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const values = {

        research_novelty:
          getScore("novelty"),

        patent_strength:
          getScore("patent"),

        technology_maturity:
          getScore("maturity"),

        market_potential:
          getScore("market"),

        funding_relevance:
          getScore(
            "fundingRelevance"
          )

      };


      /* Validate scores */

      if (
        Object
          .values(values)
          .some(
            value =>
              value === null
          )
      ) {

        showScoreMessage(
          "Please enter all five scores from 0 to 100."
        );

        return;

      }


      const researchId =
        document
          .getElementById(
            "researchId"
          )
          .value
          .trim();


      if (!researchId) {

        showScoreMessage(
          "Research ID is required."
        );

        return;

      }


      /* Update UI */

      updateScoreDisplay(
        values
      );


      try {

        const response =
          await authFetch(
            `${RESEARCHER_API_BASE}/api/innovation-scores`,
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              credentials: "include",

              body:
                JSON.stringify({

                  research_id:
                    researchId,

                  research_novelty:
                    values.research_novelty,

                  patent_strength:
                    values.patent_strength,

                  technology_maturity:
                    values.technology_maturity,

                  market_potential:
                    values.market_potential,

                  funding_relevance:
                    values.funding_relevance

                })

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Unable to save innovation score"
          );

        }


        showScoreMessage(
          "Innovation score saved successfully."
        );


      } catch (error) {

        console.error(error);

        showScoreMessage(
          error.message
        );

      }

    }
  );


  /* Live score calculation */

  [

    "novelty",
    "patent",
    "maturity",
    "market",
    "fundingRelevance"

  ].forEach(id => {

    document
      .getElementById(id)
      .addEventListener(
        "input",
        refreshScorePreview
      );

  });

}


/* =========================================================
   SCORE HELPERS
========================================================= */

function getScore(id) {

  const value =
    Number(
      document
        .getElementById(id)
        .value
    );


  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {

    return null;

  }


  return value;

}


function refreshScorePreview() {

  const ids = [

    "novelty",
    "patent",
    "maturity",
    "market",
    "fundingRelevance"

  ];


  const values =
    ids.map(getScore);


  if (
    values.some(
      value => value === null
    )
  ) {

    document.getElementById(
      "overallScore"
    ).textContent = "--";

    return;

  }


  const score =
    Math.round(
      values.reduce(
        (a, b) => a + b,
        0
      ) / values.length
    );


  document.getElementById(
    "overallScore"
  ).textContent =
    score;


  updateRing(
    document.querySelector(
      ".large-score-ring"
    ),
    score
  );


  document.getElementById(
    "overviewInnovationScore"
  ).textContent =
    score;


  document.getElementById(
    "ringScore"
  ).textContent =
    score;


  updateRing(
    document.getElementById(
      "overviewScoreRing"
    ),
    score
  );

}

/* =====================================================
   RESEARCH INTELLIGENCE SEARCH
===================================================== */

const INTELLIGENCE_API_BASE = API_BASE_URL;

let selectedSearchType = "papers";
let currentSearchPage = 1;
const SEARCH_PAGE_SIZE = 20;
let currentSearchTerm = "";


/* =====================================================
   SELECT SEARCH TYPE
===================================================== */

function selectSearchType(type, button) {

    selectedSearchType = type;
    currentSearchPage = 1;

    document
        .querySelectorAll(".search-type-button")
        .forEach(item => {
            item.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }

    const input = document.getElementById(
        "intelligenceSearchInput"
    );

    if (!input) {
        return;
    }

    if (type === "papers") {
        input.placeholder =
            "Search research papers, topics, authors, keywords...";
    }

    if (type === "funding") {
        input.placeholder =
            "Search funding opportunities, programs, topics...";
    }

    if (type === "patents") {
        input.placeholder =
            "Search patents, technologies, inventions...";
    }
}


/* =====================================================
   SEARCH
===================================================== */

async function searchIntelligence(page = 1) {

    const input = document.getElementById(
        "intelligenceSearchInput"
    );

    const resultsContainer = document.getElementById(
        "intelligenceSearchResults"
    );

    const status = document.getElementById(
        "intelligenceSearchStatus"
    );

    const searchButton = document.getElementById(
        "intelligenceSearchButton"
    );


    if (!input || !resultsContainer) {

        console.error(
            "Intelligence search HTML elements are missing."
        );

        return;
    }


    const search = input.value.trim();


    if (!search) {

        resultsContainer.innerHTML = `
            <div class="search-empty">

                <div class="search-empty-icon">
                    🔎
                </div>

                <h3>
                    Enter a search term
                </h3>

                <p>
                    Please enter a topic, keyword or technology.
                </p>

            </div>
        `;

        if (status) {
            status.textContent =
                "Please enter something to search.";

            status.style.color =
                "#bd5050";
        }

        input.focus();

        return;
    }


    currentSearchTerm = search;
    currentSearchPage = page;


    /* -------------------------------------------------
       LOADING
    ------------------------------------------------- */

    if (searchButton) {

        searchButton.disabled = true;

        searchButton.textContent =
            "Searching...";
    }


    if (status) {

        status.textContent =
            "Searching...";

        status.style.color =
            "#7d8999";
    }


    resultsContainer.innerHTML = `
        <div class="search-loading">

            <div class="search-loading-spinner">
                ⏳
            </div>

            Searching for
            <strong>
                ${escapeHTML(search)}
            </strong>

        </div>
    `;


    /* -------------------------------------------------
       SELECT ENDPOINT
    ------------------------------------------------- */

    let endpoint = "";


    if (selectedSearchType === "papers") {

        endpoint =
            "/api/datasets-data/search";

    }

    else if (selectedSearchType === "funding") {

        endpoint =
            "/api/grants-data/search";

    }

    else if (selectedSearchType === "patents") {

        endpoint =
            "/api/patents-data/search";

    }

    else {

        if (status) {
            status.textContent =
                "Invalid search type.";
        }

        return;
    }


    try {

        /* ---------------------------------------------
           BUILD URL
        --------------------------------------------- */

        const params =
            new URLSearchParams();

        params.set(
            "search",
            search
        );

        params.set(
            "page",
            String(page)
        );

        params.set(
            "page_size",
            String(SEARCH_PAGE_SIZE)
        );


        const url =
            `${INTELLIGENCE_API_BASE}${endpoint}?${params.toString()}`;


        console.log(
            "===================================="
        );

        console.log(
            "INTELLIGENCE SEARCH REQUEST"
        );

        console.log(
            "Type:",
            selectedSearchType
        );

        console.log(
            "Search:",
            search
        );

        console.log(
            "Page:",
            page
        );

        console.log(
            "URL:",
            url
        );

        console.log(
            "===================================="
        );


        /* ---------------------------------------------
           API REQUEST
        --------------------------------------------- */

        const response =
            await authFetch(
                url,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        console.log(
            "Response status:",
            response.status
        );


        /* ---------------------------------------------
           READ RESPONSE
        --------------------------------------------- */

        const text =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(text);

        }

        catch (error) {

            data =
                text;

        }


        console.log(
            "RAW API RESPONSE:",
            data
        );


        /* ---------------------------------------------
           ERROR
        --------------------------------------------- */

        if (!response.ok) {

            throw new Error(
                extractAPIError(
                    data,
                    response.status
                )
            );
        }


        /* ---------------------------------------------
           IMPORTANT
           
           YOUR API RETURNS:

           {
               page: 1,
               page_size: 20,
               total_matches: 100,
               records: [...]
           }

        --------------------------------------------- */

        const records =
            getResearchIntelligenceRecords(
                data
            );


        const total =
            getResearchIntelligenceTotal(
                data
            );


        console.log(
            "SEARCH RECORDS:",
            records
        );

        console.log(
            "RECORD COUNT:",
            records.length
        );

        console.log(
            "TOTAL MATCHES:",
            total
        );


        /* ---------------------------------------------
           RENDER
        --------------------------------------------- */

        renderResearchIntelligenceResults(
            data
        );


        /* ---------------------------------------------
           STATUS
        --------------------------------------------- */

        if (status) {

            if (records.length > 0) {

                const start =
                    ((page - 1) *
                        SEARCH_PAGE_SIZE) + 1;

                const end =
                    start +
                    records.length -
                    1;


                status.textContent =
                    `Showing ${start}-${end} of ${total} results`;

                status.style.color =
                    "#25835a";

            }

            else {

                status.textContent =
                    "No matching results found.";

                status.style.color =
                    "#7d8999";
            }
        }


        /* ---------------------------------------------
           PAGINATION
        --------------------------------------------- */

        updateSearchPagination(
            data
        );

    }


    catch (error) {

        console.error(
            "Intelligence search error:",
            error
        );


        resultsContainer.innerHTML = `
            <div class="search-error">

                <strong>
                    Search failed
                </strong>

                <br><br>

                ${escapeHTML(
                    error.message
                )}

            </div>
        `;


        if (status) {

            status.textContent =
                "Unable to complete search.";

            status.style.color =
                "#bd5050";
        }


        const pagination =
            document.getElementById(
                "intelligencePagination"
            );


        if (pagination) {

            pagination.classList.add(
                "hidden"
            );
        }

    }


    finally {

        if (searchButton) {

            searchButton.disabled =
                false;

            searchButton.textContent =
                "Search";
        }

    }

}


/* =====================================================
   GET SEARCH RECORDS
===================================================== */

function getResearchIntelligenceRecords(data) {

    if (!data) {
        return [];
    }


    /*
     * PRIMARY FORMAT
     *
     * {
     *     page: 1,
     *     page_size: 20,
     *     total_matches: 100,
     *     records: [...]
     * }
     */

    if (
        Array.isArray(
            data.records
        )
    ) {

        return data.records;
    }


    /* ---------------------------------------------
       ARRAY RESPONSE
    --------------------------------------------- */

    if (Array.isArray(data)) {

        return data;
    }


    /* ---------------------------------------------
       NESTED RECORDS
    --------------------------------------------- */

    if (
        data.data &&
        Array.isArray(
            data.data.records
        )
    ) {

        return data.data.records;
    }


    /* ---------------------------------------------
       OTHER FALLBACKS
    --------------------------------------------- */

    if (
        data.data &&
        Array.isArray(data.data)
    ) {

        return data.data;
    }


    if (
        Array.isArray(
            data.results
        )
    ) {

        return data.results;
    }


    if (
        Array.isArray(
            data.items
        )
    ) {

        return data.items;
    }


    if (
        Array.isArray(
            data.documents
        )
    ) {

        return data.documents;
    }


    /* ---------------------------------------------
       STRING JSON
    --------------------------------------------- */

    if (
        typeof data === "string"
    ) {

        try {

            const parsed =
                JSON.parse(data);


            if (
                parsed &&
                Array.isArray(
                    parsed.records
                )
            ) {

                return parsed.records;
            }


            if (
                parsed &&
                Array.isArray(
                    parsed.results
                )
            ) {

                return parsed.results;
            }

        }

        catch (error) {

            console.warn(
                "Unable to parse response string."
            );
        }
    }


    return [];
}


/* =====================================================
   GET TOTAL MATCHES
===================================================== */

function getResearchIntelligenceTotal(data) {

    if (!data) {
        return 0;
    }


    if (
        typeof data.total_matches ===
        "number"
    ) {

        return data.total_matches;
    }


    if (
        data.data &&
        typeof data.data.total_matches ===
        "number"
    ) {

        return data.data.total_matches;
    }


    return getResearchIntelligenceRecords(
        data
    ).length;
}


/* =====================================================
   RENDER SEARCH RESULTS
===================================================== */

function renderResearchIntelligenceResults(
    data
) {

    const container =
        document.getElementById(
            "intelligenceSearchResults"
        );


    if (!container) {

        console.error(
            "intelligenceSearchResults element not found."
        );

        return;
    }


    const records =
        getResearchIntelligenceRecords(
            data
        );


    console.log(
        "Rendering:",
        records.length,
        "records"
    );


    /* ---------------------------------------------
       NO RESULTS
    --------------------------------------------- */

    if (!records.length) {

        container.innerHTML = `
            <div class="search-empty">

                <div class="search-empty-icon">
                    🔎
                </div>

                <h3>
                    No results found
                </h3>

                <p>
                    Try another keyword or search term.
                </p>

            </div>
        `;

        updateSearchPagination(
            data
        );

        return;
    }


    /* ---------------------------------------------
       CLEAR RESULTS
    --------------------------------------------- */

    container.innerHTML = "";


    /* ---------------------------------------------
       CREATE CARDS
    --------------------------------------------- */

    records.forEach(
        (item, index) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "intelligence-result-card";


            card.innerHTML =
                buildResearchIntelligenceCard(
                    item,
                    index
                );


            container.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   BUILD RESULT CARD
===================================================== */

function buildResearchIntelligenceCard(
    item,
    index
) {

    let title =
        "Untitled";

    let description =
        "";

    let metadata =
        [];

    let link =
        "";


    /* =================================================
       RESEARCH PAPERS
    ================================================= */

    if (
        selectedSearchType ===
        "papers"
    ) {

        title =
            item.title ||
            "Untitled Research Paper";


        description =
            item.abstract ||
            "No abstract available.";


        metadata = [

            item.authors
                ? `Authors: ${formatResearchValue(
                    item.authors
                )}`
                : "",

            item.venue
                ? `Venue: ${formatResearchValue(
                    item.venue
                )}`
                : "",

            item.year
                ? `Year: ${formatResearchValue(
                    item.year
                )}`
                : "",

            item.n_citation !== undefined &&
            item.n_citation !== null
                ? `Citations: ${item.n_citation}`
                : ""

        ].filter(Boolean);


        link =
            item.url ||
            item.link ||
            "";
    }


    /* =================================================
       FUNDING
    ================================================= */

    else if (
        selectedSearchType ===
        "funding"
    ) {

        title =
            item.opportunity_title ||
            "Untitled Funding Opportunity";


        description =
            item.category_of_funding_activity ||
            item.opportunity_category ||
            "Funding opportunity";


        metadata = [

            item.opportunity_number
                ? `Opportunity: ${formatResearchValue(
                    item.opportunity_number
                )}`
                : "",

            item.agency_name
                ? `Agency: ${formatResearchValue(
                    item.agency_name
                )}`
                : "",

            item.funding_instrument_type
                ? `Instrument: ${formatResearchValue(
                    item.funding_instrument_type
                )}`
                : "",

            item.eligible_applicants
                ? `Eligible: ${formatResearchValue(
                    item.eligible_applicants
                )}`
                : "",

            item.post_date
                ? `Posted: ${formatResearchValue(
                    item.post_date
                )}`
                : "",

            item.close_date
                ? `Closes: ${formatResearchValue(
                    item.close_date
                )}`
                : "",

            item.award_ceiling !== undefined &&
            item.award_ceiling !== null
                ? `Award Ceiling: ${formatResearchValue(
                    item.award_ceiling
                )}`
                : ""

        ].filter(Boolean);


        link =
            item.url ||
            item.source_url ||
            "";
    }


    /* =================================================
       PATENTS
    ================================================= */

    else if (
        selectedSearchType ===
        "patents"
    ) {

        title =
            item.title ||
            "Untitled Patent";


        description =
            item.abstract ||
            item.description ||
            "Patent information";


        metadata = [

            item.patent_number
                ? `Patent: ${formatResearchValue(
                    item.patent_number
                )}`
                : "",

            item.country
                ? `Country: ${formatResearchValue(
                    item.country
                )}`
                : "",

            item.assignee
                ? `Assignee: ${formatResearchValue(
                    item.assignee
                )}`
                : "",

            item.grant_year
                ? `Year: ${formatResearchValue(
                    item.grant_year
                )}`
                : "",

            item.times_cited !== undefined &&
            item.times_cited !== null
                ? `Citations: ${item.times_cited}`
                : "",

            item.status
                ? `Status: ${formatResearchValue(
                    item.status
                )}`
                : ""

        ].filter(Boolean);


        link =
            item.url ||
            "";
    }


    /* =================================================
       DESCRIPTION LIMIT
    ================================================= */

    description =
        formatResearchValue(
            description
        );


    if (
        description.length > 600
    ) {

        description =
            description.substring(
                0,
                600
            ) + "...";
    }


    /* =================================================
       METADATA HTML
    ================================================= */

    const metadataHTML =
        metadata.length
            ? `
                <div class="result-card-meta">

                    ${metadata
                        .map(
                            value => `
                                <span class="result-meta-item">
                                    ${escapeHTML(
                                        value
                                    )}
                                </span>
                            `
                        )
                        .join("")
                    }

                </div>
            `
            : "";


    /* =================================================
       LINK HTML
    ================================================= */

    const linkHTML =
        link
            ? `
                <a
                    href="${escapeAttribute(
                        link
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="result-link"
                >
                    View source →
                </a>
            `
            : "";


    /* =================================================
       TYPE LABEL
    ================================================= */

    let typeLabel =
        "RESULT";


    if (
        selectedSearchType ===
        "papers"
    ) {

        typeLabel =
            "RESEARCH PAPER";

    }

    else if (
        selectedSearchType ===
        "funding"
    ) {

        typeLabel =
            "FUNDING OPPORTUNITY";

    }

    else if (
        selectedSearchType ===
        "patents"
    ) {

        typeLabel =
            "PATENT";
    }


    /* =================================================
       FINAL CARD
    ================================================= */

    return `

        <div class="result-card-top">

            <div class="result-card-number">
                ${index + 1}
            </div>


            <div class="result-card-main">

                <div class="result-card-type">
                    ${typeLabel}
                </div>


                <h3 class="result-card-title">
                    ${escapeHTML(
                        title
                    )}
                </h3>


                ${
                    description
                        ? `
                            <p class="result-card-description">
                                ${escapeHTML(
                                    description
                                )}
                            </p>
                        `
                        : ""
                }


                ${metadataHTML}


                ${linkHTML}

            </div>

        </div>

    `;
}


/* =====================================================
   FORMAT VALUE
===================================================== */

function formatResearchValue(
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";
    }


    if (
        Array.isArray(value)
    ) {

        return value
            .map(
                item =>
                    formatResearchValue(
                        item
                    )
            )
            .join(", ");
    }


    if (
        typeof value === "object"
    ) {

        try {

            return JSON.stringify(
                value
            );

        }

        catch (error) {

            return String(value);
        }
    }


    return String(value);
}


/* =====================================================
   PAGINATION
===================================================== */

function updateSearchPagination(
    data
) {

    const pagination =
        document.getElementById(
            "intelligencePagination"
        );

    const pageNumber =
        document.getElementById(
            "searchPageNumber"
        );

    const previous =
        document.getElementById(
            "previousSearchPage"
        );

    const next =
        document.getElementById(
            "nextSearchPage"
        );


    if (
        !pagination ||
        !pageNumber ||
        !previous ||
        !next
    ) {

        return;
    }


    const totalMatches =
        getResearchIntelligenceTotal(
            data
        );


    const totalPages =
        Math.ceil(
            totalMatches /
            SEARCH_PAGE_SIZE
        );


    /* ---------------------------------------------
       ONLY ONE PAGE
    --------------------------------------------- */

    if (
        totalPages <= 1
    ) {

        pagination.classList.add(
            "hidden"
        );

        return;
    }


    /* ---------------------------------------------
       SHOW PAGINATION
    --------------------------------------------- */

    pagination.classList.remove(
        "hidden"
    );


    pageNumber.textContent =
        `Page ${currentSearchPage} of ${totalPages}`;


    previous.disabled =
        currentSearchPage <= 1;


    next.disabled =
        currentSearchPage >= totalPages;
}


/* =====================================================
   CHANGE PAGE
===================================================== */

function changeSearchPage(
    direction
) {

    const newPage =
        currentSearchPage +
        direction;


    if (
        newPage < 1
    ) {

        return;
    }


    if (
        !currentSearchTerm
    ) {

        return;
    }


    const input =
        document.getElementById(
            "intelligenceSearchInput"
        );


    if (input) {

        input.value =
            currentSearchTerm;
    }


    searchIntelligence(
        newPage
    );
}


/* =====================================================
   API ERROR
===================================================== */

function extractAPIError(
    data,
    status
) {

    if (
        typeof data === "string" &&
        data.trim()
    ) {

        return data;
    }


    if (
        data &&
        typeof data.detail === "string"
    ) {

        return data.detail;
    }


    if (
        data &&
        data.message
    ) {

        return data.message;
    }


    return (
        `Server returned status ${status}`
    );
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    if (
        value === undefined ||
        value === null
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
   ESCAPE ATTRIBUTE
===================================================== */

function escapeAttribute(
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );
}


/* =====================================================
   ENTER KEY SEARCH
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "intelligenceSearchInput"
            );


        if (!input) {
            return;
        }


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    searchIntelligence(
                        1
                    );
                }

            }
        );

    }
);
/* =========================================================
   UPDATE SCORE DISPLAY
========================================================= */

function updateScoreDisplay(
  values
) {

  const map = {

    novelty:
      values.research_novelty,

    patent:
      values.patent_strength,

    maturity:
      values.technology_maturity,

    market:
      values.market_potential,

    fundingRelevance:
      values.funding_relevance

  };


  Object.entries(map)
    .forEach(
      ([id, value]) => {

        const output =
          document.getElementById(
            id ===
            "fundingRelevance"
              ? "fundingValue"
              : `${id}Value`
          );


        if (output) {

          output.textContent =
            value;

        }

      }
    );


  refreshScorePreview();

}


/* =========================================================
   SCORE RING
========================================================= */

function updateRing(
  element,
  score
) {

  if (!element) return;


  const degrees =
    score * 3.6;


  element.style.background =
    `conic-gradient(
      #27364d ${degrees}deg,
      #e9edf3 ${degrees}deg
    )`;

}


/* =========================================================
   MESSAGE
========================================================= */

function showScoreMessage(
  text
) {

  document.getElementById(
    "scoreMessage"
  ).textContent =
    text;

}


/* =========================================================
   NAVIGATION
========================================================= */

function scrollToSection(
  id
) {

  const section =
    document.getElementById(id);


  if (section) {

    section.scrollIntoView({
      behavior: "smooth"
    });

  }

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
   DOCUMENTS (RESEARCH PAPERS / PATENTS / OTHER)
========================================================= */

function setupDocuments() {

    const uploadButton =
        document.getElementById("uploadDocButton");

    const fileInput =
        document.getElementById("documentFile");

    const filterSelect =
        document.getElementById("documentFilter");

    if (fileInput) {

        fileInput.addEventListener(
            "change",
            () => {

                const selectedFile =
                    document.getElementById("selectedDocFile");

                const file = fileInput.files[0];

                if (!selectedFile) {
                    return;
                }

                selectedFile.textContent = file
                    ? `Selected: ${file.name}`
                    : "";
            }
        );

    }

    if (uploadButton) {

        uploadButton.addEventListener(
            "click",
            () => {
                uploadDocument();
            }
        );

    }

    if (filterSelect) {

        filterSelect.addEventListener(
            "change",
            () => {
                loadDocuments(filterSelect.value);
            }
        );

    }

}


async function uploadDocument() {

    const message =
        document.getElementById("documentMessage");

    const fileInput =
        document.getElementById("documentFile");

    const typeSelect =
        document.getElementById("documentType");

    if (message) {
        message.textContent = "";
    }

    if (!currentUser || !currentUser.user_id) {

        if (message) {
            message.textContent =
                "User session is not available.";
            message.style.color = "#c65353";
        }

        return;
    }

    const file = fileInput && fileInput.files[0];

    if (!file) {

        if (message) {
            message.textContent =
                "Please choose a PDF file to upload.";
            message.style.color = "#c65353";
        }

        return;
    }

    if (file.type !== "application/pdf") {

        if (message) {
            message.textContent =
                "Only PDF files are supported.";
            message.style.color = "#c65353";
        }

        return;
    }

    const uploadButton =
        document.getElementById("uploadDocButton");

    if (message) {
        message.textContent = "Uploading document...";
        message.style.color = "#25835a";
    }

    if (uploadButton) {
        uploadButton.disabled = true;
    }

    try {

        const formData = new FormData();

        formData.append("file", file);
        formData.append("user_id", currentUser.user_id);
        formData.append(
            "document_type",
            typeSelect ? typeSelect.value : "research_paper"
        );

        const response = await authFetch(
            `${RESEARCHER_API_BASE}/api/documents`,
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {

            const detail =
                typeof data.detail === "string"
                    ? data.detail
                    : "Document upload failed.";

            throw new Error(detail);
        }

        console.log(
            "Uploaded document:",
            data
        );

        if (message) {
            message.textContent =
                "Document uploaded successfully.";
            message.style.color = "#25835a";
        }

        if (fileInput) {
            fileInput.value = "";
        }

        const selectedFile =
            document.getElementById("selectedDocFile");

        if (selectedFile) {
            selectedFile.textContent = "";
        }

        await loadDocuments("");

    } catch (error) {

        console.error(
            "Document upload error:",
            error
        );

        if (message) {
            message.textContent = error.message;
            message.style.color = "#c65353";
        }

    } finally {

        if (uploadButton) {
            uploadButton.disabled = false;
        }

    }

}


async function loadDocuments(documentType) {

    const container =
        document.getElementById("documentList");

    if (!container) {
        return;
    }

    if (!currentUser || !currentUser.user_id) {
        return;
    }

    try {

        let url =
            `${RESEARCHER_API_BASE}/api/documents?user_id=` +
            encodeURIComponent(currentUser.user_id);

        if (documentType) {
            url +=
                "&document_type=" +
                encodeURIComponent(documentType);
        }

        const response = await authFetch(
            url,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to fetch documents"
            );
        }

        const documents =
            await response.json();

        console.log(
            "User documents:",
            documents
        );

        renderDocuments(
            Array.isArray(documents)
                ? documents
                : []
        );

        const overviewElement =
            document.getElementById("overviewDocuments");

        if (overviewElement) {

            const filterValue =
                document.getElementById("documentFilter");

            if (!filterValue || !filterValue.value) {
                overviewElement.textContent =
                    String(Array.isArray(documents) ? documents.length : 0);
            }

        }

    } catch (error) {

        console.error(
            "Document loading error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load documents.
            </div>
        `;
    }

}


function renderDocuments(
    documents
) {

    const container =
        document.getElementById(
            "documentList"
        );

    if (!container) {
        return;
    }

    if (!documents.length) {

        container.innerHTML = `
            <div class="empty-state">
                No documents found. Upload a research paper or patent to get started.
            </div>
        `;

        return;
    }

    const documentTypeLabels = {
        research_paper: "Research Paper",
        patent: "Patent",
        other: "Other"
    };

    container.innerHTML =
        documents
            .map(
                (document, index) => {

                    const title =
                        document.title ||
                        document.file_information?.original_filename ||
                        `Document ${index + 1}`;

                    const authors =
                        Array.isArray(document.authors)
                            ? document.authors.join(", ")
                            : "";

                    const keywords =
                        Array.isArray(document.keywords)
                            ? document.keywords.join(", ")
                            : "";

                    const type =
                        document.document_type ||
                        "other";

                    const typeLabel =
                        documentTypeLabels[type] ||
                        "Other";

                    const created =
                        document.created_at
                            ? formatDateTime(document.created_at)
                            : "";

                    const fileUrl =
                        document.file_information?.file_url ||
                        "";

                    return `
                        <div class="publication-card">

                            <div class="publication-number">
                                ${index + 1}
                            </div>

                            <div class="publication-content">

                                <h4>
                                    ${escapeHTML(title)}
                                </h4>

                                <div class="publication-meta">
                                    ${
                                        authors
                                            ? `Authors: ${escapeHTML(authors)}`
                                            : "No authors detected"
                                    }
                                </div>

                                ${
                                    document.abstract
                                        ? `<p>${escapeHTML(document.abstract)}</p>`
                                        : ""
                                }

                                ${
                                    document.research_domain
                                        ? `
                                            <span class="publication-year">
                                                ${escapeHTML(document.research_domain)}
                                            </span>
                                          `
                                        : ""
                                }

                                <span class="publication-year">
                                    ${escapeHTML(typeLabel)}
                                </span>

                                ${
                                    document.year
                                        ? `
                                            <span class="publication-year">
                                                ${escapeHTML(document.year)}
                                            </span>
                                          `
                                        : ""
                                }

                                <div style="margin-top:8px;">

                                    ${
                                        keywords
                                            ? `<small>${escapeHTML(keywords)}</small>`
                                            : ""
                                    }

                                    ${
                                        created
                                            ? `<small style="display:block;margin-top:4px;">Added: ${escapeHTML(created)}</small>`
                                            : ""
                                    }

                                    ${
                                        fileUrl
                                            ? `<a href="${fileUrl}" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:700;color:#202d42;text-decoration:none;">Open PDF Γåù</a>`
                                            : ""
                                    }

                                </div>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(
    value
) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


/* =====================================================
   FORMAT DATE TIME
===================================================== */

function formatDateTime(
    value
) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}
