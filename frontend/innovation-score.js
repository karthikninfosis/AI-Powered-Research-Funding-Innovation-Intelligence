// ==========================================
// Innovation Score JavaScript
// ==========================================

// Welcome Message
window.onload = () => {

    setTimeout(() => {

        alert("🤖 AI has calculated your Innovation Score!");

        animateOverallScore(91);

    },500);

};

// ==========================================
// Overall Score Animation
// ==========================================

function animateOverallScore(target){

    const score=document.getElementById("overallScore");

    let count=0;

    const interval=setInterval(()=>{

        if(count>=target){

            clearInterval(interval);

        }else{

            count++;

            score.innerHTML=count+"%";

        }

    },20);

}

// ==========================================
// Score Cards Animation
// ==========================================

const cards=document.querySelectorAll(".score-card h2");

cards.forEach(card=>{

    let target=parseInt(card.innerText);

    let count=0;

    const interval=setInterval(()=>{

        if(count>=target){

            clearInterval(interval);

        }else{

            count++;

            card.innerHTML=count+"%";

        }

    },20);

});

// ==========================================
// Card Hover
// ==========================================

const scoreCards=document.querySelectorAll(".score-card");

scoreCards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.transform="translateY(-10px) scale(1.03)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="translateY(0px) scale(1)";

    });

});

// ==========================================
// AI Recommendation Click
// ==========================================

const recommendation=document.querySelector(".recommendation");

recommendation.addEventListener("click",()=>{

    alert(`🤖 AI Recommendation

✔ Excellent Innovation Potential

✔ High Patent Readiness

✔ Startup Ready

✔ High Funding Success Probability

✔ Commercialization Recommended`);

});

// ==========================================
// SWOT Click
// ==========================================

const swot=document.querySelector(".swot");

swot.addEventListener("click",()=>{

    alert("📊 SWOT Analysis generated successfully.");

});

// ==========================================
// Navigation
// ==========================================

const backBtn=document.querySelector(".back-btn");

backBtn.addEventListener("click",()=>{

    window.location.href="technology.html";

});

const nextBtn=document.querySelector(".next-btn");

nextBtn.addEventListener("click",()=>{

    alert("Moving to Commercialization...");

    window.location.href="commercialization.html";

});