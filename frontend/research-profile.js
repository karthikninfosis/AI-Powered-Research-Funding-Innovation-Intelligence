// ======================================
// Research Profile JavaScript
// ======================================

// Form
const form = document.getElementById("researchForm");

// File Inputs
const fileInputs = document.querySelectorAll("input[type='file']");

// ================================
// Show Selected File Name
// ================================

fileInputs.forEach(input => {

    input.addEventListener("change", function () {

        if (this.files.length > 0) {

            alert("Selected File: " + this.files[0].name);

        }

    });

});

// ================================
// Save Profile
// ================================

form.addEventListener("submit", function (e) {

    e.preventDefault();

    const name = document.querySelector("input[type='text']").value;
    const email = document.querySelector("input[type='email']").value;

    if (name === "") {

        alert("Please enter your Full Name.");
        return;

    }

    if (email === "") {

        alert("Please enter your Email.");
        return;

    }

    if (!email.includes("@")) {

        alert("Enter a valid Email Address.");
        return;

    }

    alert("✅ Research Profile Saved Successfully!");

});

// ================================
// Skills Selection Effect
// ================================

const skills = document.querySelectorAll(".skills label");

skills.forEach(skill => {

    skill.addEventListener("click", function () {

        this.classList.toggle("selected");

    });

});

// ================================
// Next Button
// ================================

const nextBtn = document.querySelector(".next-btn");

nextBtn.addEventListener("click", () => {

    const confirmMove = confirm(
        "Proceed to AI Analysis?"
    );

    if (confirmMove) {

        window.location.href = "ai-analysis.html";

    }

});

// ================================
// Input Animation
// ================================

const inputs = document.querySelectorAll("input, textarea, select");

inputs.forEach(input => {

    input.addEventListener("focus", () => {

        input.style.transform = "scale(1.02)";

    });

    input.addEventListener("blur", () => {

        input.style.transform = "scale(1)";

    });

});

// ================================
// Welcome Message
// ================================

window.onload = () => {

    setTimeout(() => {

        alert("👋 Welcome! Complete your Research Profile.");

    }, 500);

};