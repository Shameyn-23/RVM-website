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

// Helper: Custom notification bubble
function showNotification(message, type = "success") {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.position = 'fixed';
    notif.style.top = '20px';
    notif.style.left = '50%';
    notif.style.transform = 'translateX(-50%)';
    notif.style.background = type === "success" ? '#4CAF50' : '#f44336';
    notif.style.color = '#fff';
    notif.style.padding = '12px 20px';
    notif.style.borderRadius = '10px';
    notif.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
    notif.style.zIndex = '9999';
    notif.style.opacity = '0';
    notif.style.transition = 'opacity 0.3s';
    document.body.appendChild(notif);

    setTimeout(() => { notif.style.opacity = '1'; }, 10);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}

// Get any QR code value from the URL (e.g., ?code=ALU10)
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
            showNotification(`Successfully signed in as ${user.email}`, "success");

            // Redirect with QR code if it exists
            const pendingCode = localStorage.getItem("pendingCode");
            if (pendingCode) {
                window.location.href = `points.html?code=${pendingCode}`;
                localStorage.removeItem("pendingCode");
            } else {
                window.location.href = "points.html";
            }
        })
        .catch((error) => {
            showNotification(`Login failed: ${error.message}`, "error");
        });
});
