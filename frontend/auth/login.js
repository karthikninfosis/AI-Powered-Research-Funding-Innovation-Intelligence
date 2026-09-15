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

    const email =
        document.getElementById("loginEmail")
            .value
            .trim();

    const password =
        document.getElementById("loginPassword")
            .value;

    const emailError =
        document.getElementById("emailError");

    const passwordError =
        document.getElementById("passwordError");

    const loginMessage =
        document.getElementById("loginMessage");


    /* Clear old messages */

    emailError.textContent = "";
    passwordError.textContent = "";
    loginMessage.textContent = "";


    /* =========================================
       VALIDATION
    ========================================= */

    if (!email) {

        emailError.textContent =
            "Enter your email.";

        return;

    }


    if (!password) {

        passwordError.textContent =
            "Enter your password.";

        return;

    }


    try {

        loginMessage.textContent =
            "Logging in...";

        loginMessage.style.color =
            "#25835a";


        /* =========================================
           LOGIN API
        ========================================= */

        const response =
            await fetch(
                "http://192.168.1.13:8000/api/auth/login",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({

                        email: email,

                        password: password

                    })

                }
            );


        const data =
            await response.json();


        /* =========================================
           LOGIN FAILED
        ========================================= */

        if (!response.ok) {

            loginMessage.textContent =
                typeof data.detail === "string"
                    ? data.detail
                    : "Invalid email or password.";

            loginMessage.style.color =
                "#c65353";

            return;

        }


        console.log(
            "Login response:",
            data
        );


        /* =========================================
           GET LOGGED-IN USER
        ========================================= */

        const loggedInUser =
            data.user;


        if (!loggedInUser) {

            loginMessage.textContent =
                "Login successful, but user information was not returned.";

            loginMessage.style.color =
                "#c65353";

            return;

        }


        console.log(
            "Logged-in user:",
            loggedInUser
        );


        console.log(
            "User role ID:",
            loggedInUser.role_id
        );


        /* =========================================
           GET ALL ROLES
        ========================================= */

        loginMessage.textContent =
            "Checking account role...";


        const rolesResponse =
            await fetch(
                "http://192.168.1.13:8000/api/roles/get",
                {

                    method: "GET",

                    credentials: "include"

                }
            );


        if (!rolesResponse.ok) {

            throw new Error(
                "Unable to load user roles."
            );

        }


        const roles =
            await rolesResponse.json();


        console.log(
            "Available roles:",
            roles
        );


        /* =========================================
           FIND USER ROLE
        ========================================= */

        const userRole =
            roles.find(
                role =>
                    String(role._id) ===
                    String(loggedInUser.role_id)
            );


        if (!userRole) {

            loginMessage.textContent =
                "Unable to identify your account role.";

            loginMessage.style.color =
                "#c65353";

            return;

        }


        console.log(
            "Matched role:",
            userRole
        );


        /* =========================================
           CHECK ADMIN
        ========================================= */

        const isAdmin =

            String(
                userRole.name || ""
            )
            .toLowerCase()
            .trim() === "admin"

            ||

            String(
                userRole.code || ""
            )
            .toLowerCase()
            .trim() === "admin";


        console.log(
            "Is Admin:",
            isAdmin
        );


        /* =========================================
           SUCCESS MESSAGE
        ========================================= */

        loginMessage.textContent =
            `Login successful! Welcome to InnovFund.`;

        loginMessage.style.color =
            "#25835a";


        /* =========================================
           REDIRECT
        ========================================= */

        setTimeout(
            () => {

                if (isAdmin) {

                    /*
                     * ADMIN
                     */

                    window.location.href =
                        "http://192.168.1.13:5500/dashboard/admin/overview.html";

                }

                else {

                    /*
                     * ALL OTHER ROLES
                     */

                    window.location.href =
                        "http://192.168.1.13:5500/dashboard/researcherDashboard/researcherDashboard.html";

                }

            },
            700
        );


    }

    catch (error) {

        console.error(
            "Login error:",
            error
        );


        loginMessage.textContent =
            "Unable to connect to the server.";

        loginMessage.style.color =
            "#c65353";

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
            "http://192.168.1.13:8000/api/users/",
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

