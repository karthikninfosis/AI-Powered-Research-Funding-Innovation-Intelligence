// ============================
// Dashboard JavaScript
// ============================

// Welcome Animation

window.onload = function(){

    setTimeout(()=>{

        alert("👋 Welcome to AI Powered Research Funding Dashboard");

    },500);

};

// ============================
// Sidebar Active Menu
// ============================

const menuItems=document.querySelectorAll(".sidebar ul li");

menuItems.forEach(item=>{

    item.addEventListener("click",()=>{

        menuItems.forEach(i=>{

            i.classList.remove("active");

        });

        item.classList.add("active");

    });

});

// ============================
// Apply Button
// ============================

const applyBtn=document.querySelector(".recommendation button");

applyBtn.addEventListener("click",()=>{

    alert("🎉 Application Submitted Successfully");

});

// ============================
// Profile Button
// ============================

const profileBtn=document.querySelector(".profile-btn");

profileBtn.addEventListener("click",()=>{

    alert("👤 Profile Page Coming Soon");

});

// ============================
// Logout
// ============================

menuItems[8].addEventListener("click",()=>{

    if(confirm("Do you want to Logout?")){

        window.location.href="login.html";

    }

});

// ============================
// Card Hover Animation
// ============================

const cards=document.querySelectorAll(".card");

cards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.transform="translateY(-10px)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="translateY(0px)";

    });

});

// ============================
// Counter Animation
// ============================

const counters=document.querySelectorAll(".card h1");

counters.forEach(counter=>{

let target=parseInt(counter.innerText);

let count=0;

let speed=target/60;

let update=()=>{

if(count<target){

count+=speed;

counter.innerText=Math.floor(count);

requestAnimationFrame(update);

}

else{

counter.innerText=target;

}

};

update();

});