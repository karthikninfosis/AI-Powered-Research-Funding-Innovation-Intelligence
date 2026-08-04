// ==============================
// AI Login Page JavaScript
// ==============================

// Password Show / Hide
const passwordInput = document.querySelector(".password-box input");
const eye = document.querySelector(".eye");

if (eye) {
    eye.addEventListener("click", () => {

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eye.innerHTML = "🙈";
        } else {
            passwordInput.type = "password";
            eye.innerHTML = "👁️";
        }

    });
}

// ==============================
// Login Validation
// ==============================

const form = document.querySelector("form");
const loginBtn = document.querySelector(".login-btn");

form.addEventListener("submit", function (e) {

    e.preventDefault();

    const email = document.querySelector("input[type='email']").value.trim();
    const password = passwordInput.value.trim();

    if (email === "") {
        alert("Please enter your email.");
        return;
    }

    if (!email.includes("@")) {
        alert("Enter a valid email.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    loginBtn.innerHTML = "Loading...";

    loginBtn.disabled = true;

    setTimeout(() => {

        alert("Login Successful ✅");

        window.location.href = "dashboard.html";

    }, 2000);

});

// ==============================
// Google Login Demo
// ==============================

const googleBtn = document.querySelector(".google-btn");

googleBtn.addEventListener("click", () => {

    googleBtn.innerHTML = "Connecting...";

    setTimeout(() => {

        alert("Google Login Successful ✅");

        window.location.href = "dashboard.html";

    },2000);

});

// ==============================
// GitHub Login Demo
// ==============================

const githubBtn=document.querySelector(".github-btn");

githubBtn.addEventListener("click",()=>{

    githubBtn.innerHTML="Connecting...";

    setTimeout(()=>{

        alert("GitHub Login Successful ✅");

        window.location.href="dashboard.html";

    },2000);

});