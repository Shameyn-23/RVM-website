// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

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

// ✅ Get QR code value if exists in URL
const urlParams = new URLSearchParams(window.location.search);
const qrCode = urlParams.get("code");

// Submit button event
const submit = document.getElementById('submit');
submit.addEventListener("click", function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            alert("Account created for " + user.email);

            // ✅ Redirect to points with QR if exists
            if (qrCode) {
                window.location.href = `points.html?code=${qrCode}`;
            } else {
                window.location.href = "points.html";
            }
        })
        .catch((error) => {
            alert("Bad Credentials.: " + error.message);
        });
});