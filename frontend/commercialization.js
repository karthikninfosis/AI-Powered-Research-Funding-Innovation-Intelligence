// ==========================================
// Commercialization JavaScript
// ==========================================

// Welcome Message
window.onload = () => {

    setTimeout(() => {

        alert("🚀 AI Commercialization Analysis Completed!");

    },500);

};

// ==========================================
// Startup View Buttons
// ==========================================

const viewButtons = document.querySelectorAll(".view-btn");

viewButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        alert(`🚀 Startup Details

✔ Startup Success Probability : 92%

✔ Market Demand : High

✔ Investment Required : ₹10-20 Lakhs

✔ Business Model : SaaS

✔ Recommended Investors :
• Angel Investors
• Government Grants
• Incubation Centers`);

    });

});

// ==========================================
// Recommendation Click
// ==========================================

const recommendation=document.querySelector(".recommendation");

recommendation.addEventListener("click",()=>{

    alert(`🤖 AI Recommendation

✔ Excellent Commercial Potential

✔ Ready for Startup

✔ High ROI Expected

✔ Government Funding Eligible

✔ Recommended for Incubation`);

});

// ==========================================
// Investment Cards
// ==========================================

const investCards=document.querySelectorAll(".invest-card");

investCards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.transform="translateY(-8px) scale(1.03)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="translateY(0px) scale(1)";

    });

});

// ==========================================
// Business Model
// ==========================================

const business=document.querySelector(".business-model");

business.addEventListener("click",()=>{

    alert("📈 Suggested Business Model copied successfully (Demo).");

});

// ==========================================
// Navigation
// ==========================================

const backBtn=document.querySelector(".back-btn");

backBtn.addEventListener("click",()=>{

    window.location.href="innovation-score.html";

});

const nextBtn=document.querySelector(".next-btn");

nextBtn.addEventListener("click",()=>{

    alert("Opening Reports Dashboard...");

    window.location.href="reports.html";

});