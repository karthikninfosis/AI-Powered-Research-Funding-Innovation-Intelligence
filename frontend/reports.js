// ==========================================
// Reports JavaScript
// ==========================================

// Welcome Message
window.onload = () => {

    setTimeout(() => {

        alert("📊 AI Report Generated Successfully!");

    },500);

};

// ==========================================
// Report Box Animation
// ==========================================

const reportBoxes = document.querySelectorAll(".report-box");

reportBoxes.forEach(box=>{

    box.addEventListener("mouseenter",()=>{

        box.style.transform="translateY(-10px) scale(1.03)";

    });

    box.addEventListener("mouseleave",()=>{

        box.style.transform="translateY(0px) scale(1)";

    });

});

// ==========================================
// PDF Download
// ==========================================

const pdfBtn=document.querySelector(".pdf-btn");

pdfBtn.addEventListener("click",()=>{

    alert("📄 PDF Report Download Started (Demo)");

});

// ==========================================
// Excel Download
// ==========================================

const excelBtn=document.querySelector(".excel-btn");

excelBtn.addEventListener("click",()=>{

    alert("📊 Excel Report Download Started (Demo)");

});

// ==========================================
// CSV Download
// ==========================================

const csvBtn=document.querySelector(".csv-btn");

csvBtn.addEventListener("click",()=>{

    alert("📑 CSV Report Download Started (Demo)");

});

// ==========================================
// AI Recommendation
// ==========================================

const recommendation=document.querySelector(".recommendation");

recommendation.addEventListener("click",()=>{

    alert(`🤖 AI Final Recommendation

✔ Apply for AI Research Grant

✔ File Patent

✔ Publish Research Paper

✔ Register Startup

✔ Contact Incubation Centre

✔ Prepare Investor Pitch`);

});

// ==========================================
// Final Status
// ==========================================

const status=document.querySelector(".status");

status.addEventListener("click",()=>{

    alert("🎉 Congratulations!\n\nYour project is AI validated and ready for Funding, Patent and Commercialization.");

});

// ==========================================
// Navigation
// ==========================================

const backBtn=document.querySelector(".back-btn");

backBtn.addEventListener("click",()=>{

    window.location.href="commercialization.html";

});

const finishBtn=document.querySelector(".finish-btn");

finishBtn.addEventListener("click",()=>{

    alert("✅ Demo Completed Successfully!");

    window.location.href="index.html";

});