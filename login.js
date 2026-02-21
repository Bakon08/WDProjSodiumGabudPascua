const loginForm = document.getElementById('loginForm');
const messageDisplay = document.getElementById('message');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const toggleLink = document.getElementById('toggle-link');

let isLoginMode = true;

// check if our list exists; if not, create it with the admin user
if (!localStorage.getItem("lockin_users")) {
    const defaultUsers = [
        {
            username: "admin",
            email: "admin@test.com",
            password: "password123"
        }
    ];
    localStorage.setItem("lockin_users", JSON.stringify(defaultUsers));
}

toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        formTitle.textContent = "Welcome Back";
        submitBtn.textContent = "Log In";
        toggleLink.textContent = "Create one";
    } else {
        formTitle.textContent = "Create Account";
        submitBtn.textContent = "Sign Up";
        toggleLink.textContent = "Back to Login";
    }
    messageDisplay.textContent = ""; 
});

// form submission logic
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const userIn = document.getElementById('username').value;
    const passIn = document.getElementById('password').value;

    let users = JSON.parse(localStorage.getItem("lockin_users"));

    if (isLoginMode) {
        // checks for matching username/email and password
        const foundUser = users.find(u => 
            (u.username === userIn || u.email === userIn) && u.password === passIn
        );
        
        if (foundUser) {
            messageDisplay.style.color = "darkgreen";
            messageDisplay.textContent = "Locking in...";
            setTimeout(() => { 
                window.location.href = "Public/Home.html"; 
            }, 800);
        } else {
            messageDisplay.style.color = "darkred";
            messageDisplay.textContent = "Invalid credentials. Try admin / password123";
        }
    } else {
        // sign-up logic: check if username/email already exists
        const userExists = users.some(u => u.username === userIn || u.email === userIn);
        
        if (userExists) {
            messageDisplay.style.color = "darkred";
            messageDisplay.textContent = "User already exists!";
        } else {
            //adds new user to the list and saves it to localStorage
            users.push({ 
                username: userIn, 
                email: userIn,
                password: passIn 
            });
            localStorage.setItem("lockin_users", JSON.stringify(users));
            
            messageDisplay.style.color = "darkgreen";
            messageDisplay.textContent = "Account created! Switching to Login...";
            
            // auto-switch back to login after 1.5 seconds
            setTimeout(() => { toggleLink.click(); }, 1500);
        }
    }
});