function showConfirm(message) {
    return new Promise((resolve) => {
        const confirmed = window.confirm(message); // Simple browser confirm
        resolve(confirmed);
    });
}

// Custom success notification
function showNotification(message) {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.position = 'fixed';
    notif.style.top = '20px';
    notif.style.left = '50%';
    notif.style.transform = 'translateX(-50%)';
    notif.style.background = '#4CAF50';
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

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    collection,
    addDoc,
    serverTimestamp,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC9s5nsUHkWE8-T8pd2EFYoZeYe_nwGOn0",
    authDomain: "rvm-roboto.firebaseapp.com",
    projectId: "rvm-roboto",
    storageBucket: "rvm-roboto.firebasestorage.app",
    messagingSenderId: "936752586386",
    appId: "1:936752586386:web:407bec47effe1ead49d04b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const codePoints = { "ALU10": 10, "PLS5": 5 };

// Function to get code from URL
function getCodeFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("code");
}

// Update points display and progress bar
const pointsGoalValue = 100; // <-- set your goal here
const pointsLabel = document.getElementById("pointsLabel");

// Update the displayUserPoints function
async function displayUserPoints(uid) {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    const points = userSnap.exists() ? userSnap.data().points || 0 : 0;
    document.getElementById("pointsNumber").innerText = points;

    // Update progress bar
    const progressPercent = Math.min((points / pointsGoalValue) * 100, 100);
    const progressBar = document.getElementById("pointsProgress");
    progressBar.style.width = `${progressPercent}%`;

    // Change color if goal reached
    if (points >= pointsGoalValue) {
        progressBar.style.background = "gold";
    } else {
        progressBar.style.background = "#4CAF50"; // original green
    }

    // Update label
    pointsLabel.innerText = `${points} / ${pointsGoalValue} points toward goal`;
}

// Add points from a code in URL
async function addPointsFromCode(user) {
    const code = getCodeFromURL();
    if (!code || !codePoints[code]) return;

    const pointsToAdd = codePoints[code];
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        await updateDoc(userRef, { points: increment(pointsToAdd) });
    } else {
        await setDoc(userRef, { points: pointsToAdd });
    }

    displayUserPoints(user.uid);
    window.history.replaceState({}, document.title, "points.html");
}

function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById("confirmModal");
        const msg = document.getElementById("confirmMessage");
        const yesBtn = document.getElementById("confirmYes");
        const noBtn = document.getElementById("confirmNo");

        msg.textContent = message;
        modal.style.display = "flex";

        yesBtn.onclick = () => {
            modal.style.display = "none";
            resolve(true);
        };

        noBtn.onclick = () => {
            modal.style.display = "none";
            resolve(false);
        };
    });
}

// Spend points
document.getElementById("spendBtn").addEventListener("click", async () => {
    const spendPoints = parseInt(document.getElementById("spendAmount").value);
    const user = auth.currentUser;
    if (!user) return alert("Please log in first.");

    if (!spendPoints || spendPoints <= 0) return showNotification("Enter a valid number!");

    const confirmed = await showConfirm(`Are you sure you want to spend ${spendPoints} points?`);
    if (!confirmed) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const currentPoints = userSnap.data().points || 0;
        if (spendPoints > currentPoints) {
            showNotification("You don't have enough points!");
        } else {
            await updateDoc(userRef, { points: increment(-spendPoints) });
            await addDoc(collection(db, "users", user.uid, "transactions"), {
                type: "spend",
                points: spendPoints,
                timestamp: serverTimestamp()
            });

            showNotification(`You spent ${spendPoints} points!`);
            document.getElementById("spendAmount").value = "";
            displayUserPoints(user.uid);
        }
    }
});

// Donate points
document.getElementById("donateBtn").addEventListener("click", async () => {
    const donatePoints = parseInt(document.getElementById("donateAmount").value);
    const charity = document.getElementById("charitySelect").value;
    const user = auth.currentUser;

    if (!user) return alert("Please log in first.");
    if (!charity) return showNotification("Select a charity!");
    if (!donatePoints || donatePoints <= 0) return showNotification("Enter a valid number!");

    const confirmed = await showConfirm(`Are you sure you want to donate ${donatePoints} points to ${charity}?`);
    if (!confirmed) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const currentPoints = userSnap.data().points || 0;
        if (donatePoints > currentPoints) {
            showNotification("You don't have enough points!");
        } else {
            await updateDoc(userRef, { points: increment(-donatePoints) });

            const charityRef = doc(db, "charities", charity);
            const charitySnap = await getDoc(charityRef);

            if (charitySnap.exists()) {
                await updateDoc(charityRef, { points: increment(donatePoints) });
            } else {
                await setDoc(charityRef, { points: donatePoints });
            }

            await addDoc(collection(db, "users", user.uid, "transactions"), {
                type: "donate",
                points: donatePoints,
                charity: charity,
                timestamp: serverTimestamp()
            });

            showNotification(`You donated ${donatePoints} points to ${charity}!`);
            document.getElementById("donateAmount").value = "";
            displayUserPoints(user.uid);
        }
    }
});

async function loadTransactionHistory(uid) {
    const transactionsRef = collection(db, "users", uid, "transactions");
    const snapshot = await getDocs(transactionsRef);
    const tableBody = document.getElementById("historyTableBody");
    tableBody.innerHTML = "";

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const row = document.createElement("tr");

        const date = data.timestamp?.toDate
            ? data.timestamp.toDate().toLocaleString()
            : "N/A";

        const beneficiary = data.type === "donate" ? data.charity : "Self";

        row.innerHTML = `
        <td>${data.type || "-"}</td>
        <td>${data.points || 0}</td>
        <td>${beneficiary}</td>
        <td>${date}</td>
    `;

        tableBody.appendChild(row);
    });
}

// Toggle transaction history
document.getElementById("toggleHistoryBtn").addEventListener("click", () => {
    const content = document.getElementById("historyContent");
    const btn = document.getElementById("toggleHistoryBtn");

    if (content.style.display === "none") {
        content.style.display = "block";
        btn.textContent = "Hide Transaction History ▲";
        const user = auth.currentUser;
        if (user) loadTransactionHistory(user.uid);
    } else {
        content.style.display = "none";
        btn.textContent = "View Transaction History ▼";
    }

});

// Auth state change
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayUserPoints(user.uid);
        addPointsFromCode(user);
    } else {
        const code = getCodeFromURL();
        const redirectURL = code ? `login.html?code=${code}` : "login.html";
        window.location.href = redirectURL;
    }
});
