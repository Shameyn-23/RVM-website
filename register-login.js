// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyC9s5nsUHkWE8-T8pd2EFYoZeYe_nwGOn0",
    authDomain: "rvm-roboto.firebaseapp.com",
    projectId: "rvm-roboto",
    storageBucket: "rvm-roboto.firebasestorage.app",
    messagingSenderId: "936752586386",
    appId: "1:936752586386:web:407bec47effe1ead49d04b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get any QR code value from the URL (e.g., ?code=ALU10)
const urlParams = new URLSearchParams(window.location.search);
const qrCode = urlParams.get("code");

const params = new URLSearchParams(window.location.search);
const code = params.get("code");
if (code) {
    localStorage.setItem("pendingCode", code);
}

// Submit button event
const submit = document.getElementById('submit');
submit.addEventListener("click", function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            alert("Account Signed In For " + user.email);

            // Redirect to points page, code will be read from localStorage
            window.location.href = "points.html";
        })
        .catch((error) => {
            alert("Account Not Found." + error.message);
        });
});

