// ==========================================
// Funding Recommendation JavaScript
// ==========================================

// Welcome Message
window.onload = () => {

    setTimeout(() => {

        alert("🤖 AI has found the best funding opportunities for you!");

    },500);

};

// ==========================
// Search Funding
// ==========================

const searchBtn = document.querySelector(".search-btn");

searchBtn.addEventListener("click", () => {

    const keyword = document.querySelector("input").value;

    if(keyword.trim()==""){

        alert("Please enter a funding keyword.");

        return;

    }

    alert("🔍 Searching for: " + keyword);

});

// ==========================
// View Details
// ==========================

const viewButtons = document.querySelectorAll(".view-btn");

viewButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        alert(
`Funding Details

✔ Eligibility : Research Students & Faculty

✔ Funding Amount : As mentioned

✔ Duration : 1 Year

✔ Documents Required :

• Resume
• Research Proposal
• Publications

✔ AI Match Score : High`
        );

    });

});

// ==========================
// Apply Button
// ==========================

const applyButtons=document.querySelectorAll(".apply-btn");

applyButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        const confirmApply=confirm(
            "Do you want to apply for this funding?"
        );

        if(confirmApply){

            btn.innerHTML="✅ Applied";

            btn.style.background="#22c55e";

            btn.style.color="white";

            btn.disabled=true;

        }

    });

});

// ==========================
// Funding Card Hover
// ==========================

const cards=document.querySelectorAll(".fund-card");

cards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.transform="translateY(-10px) scale(1.02)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="translateY(0px) scale(1)";

    });

});

// ==========================
// Navigation
// ==========================

const nextBtn=document.querySelector(".next-btn");

nextBtn.addEventListener("click",()=>{

    alert("Moving to Patent Intelligence...");

    window.location.href="patent.html";

});

const backBtn=document.querySelector(".back-btn");

backBtn.addEventListener("click",()=>{

    window.location.href="ai-analysis.html";

});

// ==========================
// Search Animation
// ==========================

searchBtn.addEventListener("click",()=>{

    searchBtn.innerHTML="Searching...";

    searchBtn.disabled=true;

    setTimeout(()=>{

        searchBtn.innerHTML="Search";

        searchBtn.disabled=false;

    },1500);

});