// Navbar Shadow

window.addEventListener("scroll",function(){

const navbar=document.querySelector(".custom-navbar");

if(window.scrollY>60){

navbar.style.background="#081321";

navbar.style.boxShadow="0 10px 30px rgba(0,0,0,.35)";

}

else{

navbar.style.background="rgba(8,19,33,.75)";

navbar.style.boxShadow="none";

}

});


// Hero Image Animation

const hero=document.querySelector(".hero-image img");

setInterval(()=>{

hero.style.transform="translateY(-10px)";

setTimeout(()=>{

hero.style.transform="translateY(0px)";

},900);

},1800);

const buttons = document.querySelectorAll(".fund-card button");

buttons.forEach(btn => {

    btn.addEventListener("click", () => {

        alert("Application portal will be available soon!");

    });

});

// Timeline Hover Animation

document.querySelectorAll(".timeline-card").forEach(card=>{

card.addEventListener("mouseenter",()=>{

card.style.transform="translateY(-12px) scale(1.04)";

});

card.addEventListener("mouseleave",()=>{

card.style.transform="translateY(0px) scale(1)";

});

});