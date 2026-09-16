
// ============================================================
// RESEARCHIQ - COMMERCIALIZATION FRONTEND
// ============================================================

// FastAPI backend URL
const API_URL = API_BASE_URL;


// ============================================================
// DOM ELEMENTS
// ============================================================

const form =
    document.getElementById("commercializationForm");

const analyzeButton =
    document.getElementById("analyzeButton");

const analyzeButtonText =
    document.getElementById("analyzeButtonText");

const analyzeSpinner =
    document.getElementById("analyzeSpinner");

const errorBox =
    document.getElementById("commercializationError");

const resultsSection =
    document.getElementById("commercializationResults");

const overallScore =
    document.getElementById("overallScore");

const readinessLevel =
    document.getElementById("readinessLevel");

const scoreCircleValue =
    document.getElementById("scoreCircleValue");


// ============================================================
// RECOMMENDATION CONTAINERS
// ============================================================

const productRecommendations =
    document.getElementById("productRecommendations");

const licensingRecommendations =
    document.getElementById("licensingRecommendations");

const startupRecommendations =
    document.getElementById("startupRecommendations");

const industryRecommendations =
    document.getElementById("industryRecommendations");

const nextStepsRecommendations =
    document.getElementById("nextStepsRecommendations");


// ============================================================
// FORM SUBMIT
// ============================================================

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            hideError();

            // ==================================================
            // GET FORM VALUES
            // ==================================================

            const innovationTitle =
                document
                    .getElementById("innovationTitle")
                    .value
                    .trim();

            const innovationDescription =
                document
                    .getElementById("innovationDescription")
                    .value
                    .trim();

            const technology =
                document
                    .getElementById("technology")
                    .value
                    .trim();

            /*
             * IMPORTANT
             *
             * Your new API expects:
             *
             * domain: "Automotive"
             *
             * Your existing HTML does not have a separate
             * domain field. It currently has targetMarket.
             *
             * Therefore targetMarket is being used as domain.
             *
             * If you add a separate domain input later,
             * replace this with:
             *
             * const domain =
             *     document.getElementById("domain").value.trim();
             */

            const domain =
                document
                    .getElementById("targetMarket")
                    .value
                    .trim();


            // ==================================================
            // VALIDATION
            // ==================================================

            if (innovationTitle.length < 2) {

                showError(
                    "Please enter a valid innovation title."
                );

                return;
            }


            if (innovationDescription.length < 10) {

                showError(
                    "Innovation abstract must contain at least 10 characters."
                );

                return;
            }


            if (technology.length < 2) {

                showError(
                    "Please enter the technology."
                );

                return;
            }


            if (domain.length < 2) {

                showError(
                    "Please enter the domain."
                );

                return;
            }


            // ==================================================
            // LOADING
            // ==================================================

            setLoading(true);


            try {

                // ==================================================
                // CREATE NEW API REQUEST
                // ==================================================

                const requestBody = {

                    user_id: "USR001",

                    title: innovationTitle,

                    abstract: innovationDescription,

                    technology: technology,

                    domain: domain
                };


                console.log(
                    "Commercialization Request:",
                    requestBody
                );


                // ==================================================
                // SEND REQUEST
                // ==================================================

                const response =
                    await fetch(
                        `${API_URL}/api/commercialization/recommendations`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    requestBody
                                )
                        }
                    );


                // ==================================================
                // RESPONSE ERROR
                // ==================================================

                if (!response.ok) {

                    let errorMessage =
                        "Unable to analyze commercialization potential.";


                    try {

                        const errorData =
                            await response.json();


                        if (errorData.detail) {

                            if (
                                Array.isArray(
                                    errorData.detail
                                )
                            ) {

                                errorMessage =
                                    errorData.detail
                                        .map(
                                            item =>
                                                item.msg ||
                                                "Validation error"
                                        )
                                        .join(", ");

                            } else {

                                errorMessage =
                                    errorData.detail;
                            }
                        }

                    } catch (error) {

                        console.error(
                            "Error reading backend response:",
                            error
                        );
                    }


                    throw new Error(
                        errorMessage
                    );
                }


                // ==================================================
                // JSON RESULT
                // ==================================================

                const data =
                    await response.json();


                console.log(
                    "Commercialization Response:",
                    data
                );


                // ==================================================
                // SUCCESS VALIDATION
                // ==================================================

                if (
                    data.success === false
                ) {

                    throw new Error(
                        "Commercialization analysis failed."
                    );
                }


                // ==================================================
                // VERIFY RECOMMENDATIONS
                // ==================================================

                if (
                    !Array.isArray(
                        data.recommendations
                    )
                ) {

                    throw new Error(
                        "Invalid response format: recommendations array not found."
                    );
                }


                // ==================================================
                // DISPLAY RESULTS
                // ==================================================

                displayResults(data);

            } catch (error) {

                console.error(
                    "Commercialization Error:",
                    error
                );


                showError(
                    error.message ||
                    "Unable to analyze commercialization potential. Please make sure the ResearchIQ FastAPI backend is running on port 8001."
                );

            } finally {

                setLoading(false);
            }
        }
    );
}


// ============================================================
// DISPLAY RESULTS
// ============================================================

function displayResults(data) {

    // ==========================================================
    // CALCULATE OVERALL SCORE
    // ==========================================================

    const recommendations =
        Array.isArray(data.recommendations)
            ? data.recommendations
            : [];


    let overall = 0;


    if (recommendations.length > 0) {

        const scores =
            recommendations
                .map(
                    recommendation =>
                        Number(
                            recommendation.recommendation_score || 0
                        )
                )
                .filter(
                    score =>
                        !isNaN(score)
                );


        if (scores.length > 0) {

            overall =
                scores.reduce(
                    (sum, score) =>
                        sum + score,
                    0
                ) / scores.length;
        }
    }


    // ==========================================================
    // OVERALL SCORE
    // ==========================================================

    if (overallScore) {

        overallScore.textContent =
            overall.toFixed(1);
    }


    if (scoreCircleValue) {

        scoreCircleValue.textContent =
            Math.round(overall);
    }


    // ==========================================================
    // READINESS
    // ==========================================================

    if (readinessLevel) {

        readinessLevel.textContent =
            getReadinessLevel(overall);
    }


    // ==========================================================
    // CLEAR OLD RESULTS
    // ==========================================================

    if (productRecommendations) {

        productRecommendations.innerHTML =
            "";
    }


    if (licensingRecommendations) {

        licensingRecommendations.innerHTML =
            "";
    }


    if (startupRecommendations) {

        startupRecommendations.innerHTML =
            "";
    }


    if (industryRecommendations) {

        industryRecommendations.innerHTML =
            "";
    }


    if (nextStepsRecommendations) {

        nextStepsRecommendations.innerHTML =
            "";
    }


    // ==========================================================
    // DISPLAY RECOMMENDATIONS
    // ==========================================================

    recommendations.forEach(
        function (recommendation) {

            const card =
                createRecommendationCard(
                    recommendation
                );


            const path =
                String(
                    recommendation.commercialization_path ||
                    ""
                ).toLowerCase();


            // ==================================================
            // PRODUCT DEVELOPMENT
            // ==================================================

            if (
                path.includes("product")
            ) {

                if (productRecommendations) {

                    productRecommendations.appendChild(
                        card
                    );
                }

            }


            // ==================================================
            // LICENSING
            // ==================================================

            else if (
                path.includes("licens")
            ) {

                if (licensingRecommendations) {

                    licensingRecommendations.appendChild(
                        card
                    );
                }

            }


            // ==================================================
            // STARTUP
            // ==================================================

            else if (
                path.includes("startup") ||
                path.includes("spin-off") ||
                path.includes("spinoff")
            ) {

                if (startupRecommendations) {

                    startupRecommendations.appendChild(
                        card
                    );
                }

            }


            // ==================================================
            // INDUSTRY PARTNERSHIP
            // ==================================================

            else if (
                path.includes("partnership") ||
                path.includes("industry")
            ) {

                if (industryRecommendations) {

                    industryRecommendations.appendChild(
                        card
                    );
                }

            }


            // ==================================================
            // OTHER / NEXT STEPS
            // ==================================================

            else {

                if (nextStepsRecommendations) {

                    nextStepsRecommendations.appendChild(
                        card
                    );
                }
            }

        }
    );


    // ==========================================================
    // SHOW RESULTS
    // ==========================================================

    if (resultsSection) {

        resultsSection.style.display =
            "block";
    }


    // ==========================================================
    // SCROLL TO RESULTS
    // ==========================================================

    setTimeout(
        function () {

            if (resultsSection) {

                resultsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        },
        100
    );
}


// ============================================================
// CREATE RECOMMENDATION CARD
// ============================================================

function createRecommendationCard(
    recommendation
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "recommendation-card";


    // ==========================================================
    // COMMERCIALIZATION PATH
    // ==========================================================

    const strategy =
        document.createElement(
            "span"
        );


    strategy.className =
        "recommendation-strategy";


    strategy.textContent =
        recommendation.commercialization_path ||
        "Commercialization Path";


    // ==========================================================
    // TECHNOLOGY
    // ==========================================================

    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        recommendation.technology ||
        "Recommended Technology";


    // ==========================================================
    // REASON
    // ==========================================================

    const description =
        document.createElement(
            "p"
        );


    description.textContent =
        recommendation.reason ||
        "";


    // ==========================================================
    // RECOMMENDATION SCORE
    // ==========================================================

    const score =
        document.createElement(
            "div"
        );


    score.className =
        "recommendation-score";


    score.innerHTML = `
        <strong>
            ${Number(
                recommendation.recommendation_score || 0
            ).toFixed(0)}
        </strong>

        <span>
            Recommendation Score
        </span>
    `;


    // ==========================================================
    // TARGET MARKET
    // ==========================================================

    const market =
        document.createElement(
            "div"
        );


    market.className =
        "recommendation-detail";


    market.innerHTML = `
        <span>
            Target Market
        </span>

        <strong>
            ${escapeHtml(
                recommendation.target_market ||
                "Not specified"
            )}
        </strong>
    `;


    // ==========================================================
    // APPEND ELEMENTS
    // ==========================================================

    card.appendChild(
        strategy
    );


    card.appendChild(
        title
    );


    card.appendChild(
        description
    );


    card.appendChild(
        score
    );


    card.appendChild(
        market
    );


    return card;
}


// ============================================================
// READINESS LEVEL
// ============================================================

function getReadinessLevel(
    score
) {

    if (score >= 80) {

        return "Highly Commercializable";

    }

    if (score >= 60) {

        return "Commercialization Ready";

    }

    if (score >= 40) {

        return "Moderate Potential";

    }

    if (score >= 20) {

        return "Early Potential";

    }

    return "Low Commercialization Potential";
}


// ============================================================
// LOADING STATE
// ============================================================

function setLoading(
    isLoading
) {

    if (
        !analyzeButton
    ) {

        return;
    }


    if (isLoading) {

        analyzeButton.disabled =
            true;


        if (analyzeButtonText) {

            analyzeButtonText.style.display =
                "none";
        }


        if (analyzeSpinner) {

            analyzeSpinner.style.display =
                "inline";
        }

    } else {

        analyzeButton.disabled =
            false;


        if (analyzeButtonText) {

            analyzeButtonText.style.display =
                "inline";
        }


        if (analyzeSpinner) {

            analyzeSpinner.style.display =
                "none";
        }
    }
}


// ============================================================
// ERROR
// ============================================================

function showError(
    message
) {

    if (!errorBox) {

        console.error(
            message
        );

        return;
    }


    errorBox.textContent =
        message;


    errorBox.style.display =
        "block";
}


function hideError() {

    if (!errorBox) {

        return;
    }


    errorBox.textContent =
        "";


    errorBox.style.display =
        "none";
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(
    value
) {

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


// ============================================================
// BACK TO HOME
// ============================================================

const backToHome =
    document.getElementById(
        "backToHome"
    );


if (backToHome) {

    backToHome.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );
}


// ============================================================
// NOTIFICATION
// ============================================================

const notificationButton =
    document.getElementById(
        "notificationButton"
    );


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        function () {

            alert(
                "No new notifications."
            );

        }
    );
}


// ============================================================
// PREMIUM
// ============================================================

const premiumButton =
    document.getElementById(
        "premiumButton"
    );


if (premiumButton) {

    premiumButton.addEventListener(
        "click",
        function () {

            alert(
                "Premium features coming soon."
            );

        }
    );
}


// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

const sidebarItems =
    document.querySelectorAll(
        ".sidebar-item[data-section]"
    );


sidebarItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                const section =
                    item.getAttribute(
                        "data-section"
                    );


                // ==================================================
                // COMMERCIALIZATION
                // ==================================================

                if (
                    section ===
                    "commercialization"
                ) {

                    // Already on this page.
                    return;
                }


                // ==================================================
                // OTHER INTELLIGENCE SECTIONS
                // ==================================================

                if (
                    section === "research" ||
                    section === "patent" ||
                    section === "ai"
                ) {

                    window.location.href =
                        "funding.html";
                }

            }
        );
    }
);

