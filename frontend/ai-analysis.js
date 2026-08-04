// ==========================================
// AI Analysis JavaScript
// ==========================================

// Scores
const researchScore = document.getElementById("researchScore");
const innovationScore = document.getElementById("innovationScore");
const fundingScore = document.getElementById("fundingScore");
const technologyScore = document.getElementById("technologyScore");

const loader = document.querySelector(".loading-section");
const scoreGrid = document.querySelector(".score-grid");
const recommendation = document.querySelector(".recommendation-card");
const summary = document.querySelector(".summary-card");

// Hide Results Initially
scoreGrid.style.display = "none";
recommendation.style.display = "none";
summary.style.display = "none";

// Fake AI Loading
setTimeout(() => {

    loader.style.display = "none";

    scoreGrid.style.display = "grid";
    recommendation.style.display = "block";
    summary.style.display = "block";

    animateCounter(researchScore,92);
    animateCounter(innovationScore,88);
    animateCounter(fundingScore,95);
    animateCounter(technologyScore,81);

    setTimeout(()=>{

        alert("🤖 AI Analysis Completed Successfully!");

    },1200);

},3000);

// Counter Animation
function animateCounter(element,target){

    let count=0;

    const interval=setInterval(()=>{

        if(count>=target){

            clearInterval(interval);

        }

        element.innerHTML=count+"%";

        count++;

    },20);

}

// Continue Button
const nextBtn=document.querySelector(".next-btn");

nextBtn.addEventListener("click",()=>{

    alert("Moving to Funding Recommendation...");

    window.location.href="funding.html";

});

// Back Button
const backBtn=document.querySelector(".back-btn");

backBtn.addEventListener("click",()=>{

    window.location.href="research-profile.html";

});

// Hover Animation
const cards=document.querySelectorAll(".score-card");

cards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.transform="translateY(-8px) scale(1.03)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="translateY(0px) scale(1)";

    });

});

// Welcome Message
window.onload=()=>{

    console.log("AI Analysis Started...");

};