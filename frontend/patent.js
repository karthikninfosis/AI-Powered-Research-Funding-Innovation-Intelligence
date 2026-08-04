// ==========================================
// Patent Intelligence JavaScript
// ==========================================

// Welcome Message
window.onload = () => {

    setTimeout(() => {

        alert("🤖 AI has analyzed patents related to your research.");

    },500);

};

// ==========================
// Search Patent
// ==========================

const searchBtn = document.querySelector(".search-btn");

searchBtn.addEventListener("click", () => {

    const keyword = document.querySelector("input").value.trim();

    if(keyword === ""){

        alert("Please enter a patent keyword.");

        return;

    }

    searchBtn.innerHTML = "Searching...";
    searchBtn.disabled = true;

    setTimeout(() => {

        alert("🔍 Patent search completed for: " + keyword);

        searchBtn.innerHTML = "Search";
        searchBtn.disabled = false;

    },1500);

});

// ==========================
// View Patent Details
// ==========================

const viewButtons = document.querySelectorAll(".view-btn");

viewButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        alert(`📄 Patent Details

Title : AI Based Disease Prediction

Patent No : IN2026A001245

Status : Granted

Similarity : 95%

Technology : Artificial Intelligence

Country : India

Recommendation :
Suitable for commercialization.`);

    });

});

// ==========================
// Download Demo
// ==========================

const downloadButtons = document.querySelectorAll(".download-btn");

downloadButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        alert("⬇ Patent PDF download started (Demo).");

    });

});

// ==========================
// Patent Card Hover
// ==========================

const cards = document.querySelectorAll(".patent-item");

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-10px) scale(1.02)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px) scale(1)";

    });

});

// ==========================
// Metrics Animation
// ==========================

const metrics = document.querySelectorAll(".metric h2");

metrics.forEach(metric => {

    let target = parseInt(metric.innerText);
    let count = 0;

    let interval = setInterval(() => {

        if(count >= target){

            clearInterval(interval);

        }else{

            count++;
            metric.innerHTML = count + "%";

        }

    },20);

});

// ==========================
// Navigation
// ==========================

const nextBtn = document.querySelector(".next-btn");

nextBtn.addEventListener("click", () => {

    alert("Moving to Technology Intelligence...");

    window.location.href = "technology.html";

});

const backBtn = document.querySelector(".back-btn");

backBtn.addEventListener("click", () => {

    window.location.href = "funding.html";

});