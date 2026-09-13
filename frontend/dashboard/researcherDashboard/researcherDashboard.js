const RESEARCHER_API_BASE = "http://192.168.1.10:8000";

let currentUser = null;
let activityChart;
let trendChart;
let publicationChart;

document.addEventListener("DOMContentLoaded", async () => {
    await verifyResearcher();

    setupCharts();
    setupFunding();
    setupInnovationScore();

    await loadPublications();
    await loadPatents();
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

        const response = await fetch(
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
            await fetch(
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
    const meResponse = await fetch(
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

    const userResponse = await fetch(
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
    const rolesResponse = await fetch(
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

    window.location.href = "../login.html";
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
          await fetch(
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

        const response = await fetch(
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
          await fetch(
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