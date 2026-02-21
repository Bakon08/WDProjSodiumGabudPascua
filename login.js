if (!localStorage.getItem("myAppUser")) {
    const dummyUser = {
        username: "admin",
        email: "admin@test.com",
        password: "password123"
    };
    localStorage.setItem("myAppUser", JSON.stringify(dummyUser));
}

// gets html elements we need to work with
const loginForm = document.getElementById('loginForm');
const messageDisplay = document.getElementById('message');

//triggers when the user clicks the login button
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); 

    const enteredUser = document.getElementById('username').value;
    const enteredPass = document.getElementById('password').value;

    const storedUserData = localStorage.getItem("myAppUser");
    const storedUser = JSON.parse(storedUserData);

    // allows the user to login using either their username or email, along with the correct password
    const isUsernameCorrect = (enteredUser === storedUser.username || enteredUser === storedUser.email);
    const isPasswordCorrect = (enteredPass === storedUser.password);

    if (isUsernameCorrect && isPasswordCorrect) {
        messageDisplay.style.color = "darkgreen";
        messageDisplay.textContent = "Login successful! Welcome back.";
        
        window.location.href = "dashboard.html"; 
    } else {
        messageDisplay.style.color = "darkred";
        messageDisplay.textContent = "Invalid credentials. Try admin / password123.";
    }
});