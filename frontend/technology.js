// ==========================================
// Technology Intelligence JavaScript
// ==========================================

// Welcome Message
window.onload = () => {

    setTimeout(() => {

        alert("🤖 AI Technology Analysis Completed Successfully!");

    },500);

};

// ==========================================
// Search Technology
// ==========================================

const searchBtn = document.querySelector(".search-btn");

searchBtn.addEventListener("click",()=>{

    const keyword=document.querySelector("input").value.trim();

    if(keyword===""){

        alert("Please enter a technology keyword.");

        return;

    }

    searchBtn.innerHTML="Analyzing...";

    searchBtn.disabled=true;

    setTimeout(()=>{

        alert("⚙ AI analyzed: "+keyword);

        searchBtn.innerHTML="Analyze";

        searchBtn.disabled=false;

    },1500);

});

// ==========================================
// Card Animation
// ==========================================

const cards=document.querySelectorAll(".tech-card");

cards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.transform="translateY(-10px) scale(1.03)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="translateY(0px) scale(1)";

    });

});

// ==========================================
// Counter Animation
// ==========================================

const values=document.querySelectorAll(".tech-card h2");

values.forEach(value=>{

    let target=parseInt(value.innerText);

    let count=0;

    const interval=setInterval(()=>{

        if(count>=target){

            clearInterval(interval);

        }else{

            count++;

            value.innerHTML=count+"%";

        }

    },20);

});

// ==========================================
// Recommendation Click
// ==========================================

const recommendation=document.querySelector(".recommendation");

recommendation.addEventListener("click",()=>{

    alert(`🤖 AI Recommendation

✔ High Technology Readiness

✔ Strong Industry Adoption

✔ Commercialization Ready

✔ Recommended for Global Funding

✔ Innovation Potential : Excellent`);

});

// ==========================================
// Navigation
// ==========================================

const backBtn=document.querySelector(".back-btn");

backBtn.addEventListener("click",()=>{

    window.location.href="patent.html";

});

const nextBtn=document.querySelector(".next-btn");

nextBtn.addEventListener("click",()=>{

    alert("Moving to Innovation Score...");

    window.location.href="innovation-score.html";

});
