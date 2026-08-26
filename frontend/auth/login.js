const login = document.getElementById("loginSection");
const register = document.getElementById("registerSection");

document.getElementById("showRegister").onclick = () => {
    login.classList.add("hidden");
    register.classList.remove("hidden");
};

document.getElementById("showLogin").onclick = () => {
    register.classList.add("hidden");
    login.classList.remove("hidden");
};

document.getElementById("signupTop").onclick = () => {
    login.classList.add("hidden");
    register.classList.remove("hidden");
};


document.getElementById("showPassword").onclick = () => {

    const input = document.getElementById("loginPassword");
    const button = document.getElementById("showPassword");

    input.type = input.type === "password"
        ? "text"
        : "password";

    button.textContent =
        input.type === "password" ? "Show" : "Hide";
};


// document.getElementById("loginForm").onsubmit = (e) => {

//     e.preventDefault();

//     const email = loginEmail.value.trim();
//     const password = loginPassword.value;

//     emailError.textContent = "";
//     passwordError.textContent = "";
//     loginMessage.textContent = "";

//     if (!email) {
//         emailError.textContent = "Enter your email.";
//         return;
//     }

//     if (!password) {
//         passwordError.textContent = "Enter your password.";
//         return;
//     }

    
//     alert("Login successful! Welcome to InnovFund.");

//     // Later connect this to your backend
// };
 // Login ApI
 
document.getElementById("loginForm").onsubmit = async (e) => {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const loginMessage = document.getElementById("loginMessage");

    emailError.textContent = "";
    passwordError.textContent = "";
    loginMessage.textContent = "";

    // Frontend validation
    if (!email) {
        emailError.textContent = "Enter your email.";
        return;
    }

    if (!password) {
        passwordError.textContent = "Enter your password.";
        return;
    }

    try {

        loginMessage.textContent = "Logging in...";

        const response = await fetch(
            "http://127.0.0.1:8000/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            loginMessage.textContent =
                data.detail || "Invalid email or password.";

            loginMessage.style.color = "#c65353";

            return;
        }

        loginMessage.textContent =
            "Login successful! Welcome to InnovFund.";

        loginMessage.style.color = "#25835a";

        console.log("Login response:", data);

        // Go to dashboard
        setTimeout(() => {
            window.location.href = "http://localhost:3000/";
        }, 1000);

    } catch (error) {

        console.error("Login error:", error);

        loginMessage.textContent =
            "Unable to connect to the server.";

        loginMessage.style.color = "#c65353";
    }
};


// document.getElementById("registerForm").onsubmit = (e) => {

//     e.preventDefault();

//     const name = document.getElementById("name").value.trim();
//     const email = registerEmail.value.trim();
//     const password = registerPassword.value;
//     const confirm = confirmPassword.value;

//     registerMessage.textContent = "";

//     if (!name || !email || !password || !confirm) {
//         registerMessage.textContent = "Please fill all fields.";
//         registerMessage.style.color = "#c65353";
//         return;
//     }

//     if (password !== confirm) {
//         registerMessage.textContent = "Passwords do not match.";
//         registerMessage.style.color = "#c65353";
//         return;
//     }

//     registerMessage.textContent = "Account created successfully.";
//     registerMessage.style.color = "#25835a";
// };

// REGISTER API


document.getElementById("registerForm").onsubmit = async (e) => {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    const registerMessage =
        document.getElementById("registerMessage");

    registerMessage.textContent = "";

    // Frontend validation
    if (!name || !email || !password || !confirm) {

        registerMessage.textContent =
            "Please fill all fields.";

        registerMessage.style.color = "#c65353";

        return;
    }

    if (password !== confirm) {

        registerMessage.textContent =
            "Passwords do not match.";

        registerMessage.style.color = "#c65353";

        return;
    }

    try {

        registerMessage.textContent = "Creating account...";
        registerMessage.style.color = "#25835a";

        const response = await fetch(
            "http://127.0.0.1:8000/api/users/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        // Registration failed
        if (!response.ok) {

            registerMessage.textContent =
             typeof data.detail === "string"
             ? data.detail
             : JSON.stringify(data.detail || data);

            registerMessage.style.color = "#c65353";

            return;
        }

        // Registration successful
        registerMessage.textContent =
            data.message || "Account created successfully.";

        registerMessage.style.color = "#25835a";

        console.log("Register response:", data);

    } catch (error) {

        console.error("Register error:", error);

        registerMessage.textContent =
            "Unable to connect to the server.";

        registerMessage.style.color = "#c65353";
    }
};


document.getElementById("forgotBtn").onclick = () => {
    const email = prompt("Enter your registered email:");

    if (email) {
        alert("Password reset instructions will be sent to your email.");
    }
};

