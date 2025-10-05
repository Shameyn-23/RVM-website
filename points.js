import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";



// ------------------- Firebase Config -------------------
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
const db = getFirestore(app);

// Get code from URL or localStorage
let code = new URLSearchParams(window.location.search).get("code") || localStorage.getItem("pendingCode");

// After using it, clear it so it doesn’t get applied again
if (code) {
    localStorage.removeItem("pendingCode");
}

if (code && codePoints[code]) {
    const pointsToAdd = codePoints[code];
    // Add points to user in Firestore...
}

// ------------------- QR Code Points Mapping -------------------
const codePoints = {
    "ALU10": 10,  // aluminum can
    "PLS5": 5,    // plastic bottle
    "GLS8": 8     // glass bottle
};

// ------------------- Helper Functions -------------------
function getCodeFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("code");
}

async function displayUserPoints(uid) {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        document.getElementById("pointsDisplay").innerText = `Your Points: ${userSnap.data().points || 0}`;
    } else {
        document.getElementById("pointsDisplay").innerText = `Your Points: 0`;
    }
}

// ------------------- Add Points from QR Code -------------------
async function addPointsFromCode(user) {
    const code = getCodeFromURL();
    if (!code || !codePoints[code]) return;

    const pointsToAdd = codePoints[code];
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        await updateDoc(userRef, {
            points: increment(pointsToAdd)
        });
    } else {
        await setDoc(userRef, { points: pointsToAdd });
    }

    displayUserPoints(user.uid);
}

// ------------------- Spend Points for User -------------------
document.getElementById("spendBtn").addEventListener("click", async () => {
    const spendPoints = parseInt(document.getElementById("spendAmount").value);
    const user = auth.currentUser;
    if (!user) return alert("Please log in first.");

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const currentPoints = userSnap.data().points || 0;

        if (spendPoints > currentPoints) {
            alert("You don't have enough points!");
        } else {
            await updateDoc(userRef, {
                points: increment(-spendPoints)
            });
            alert(`You used ${spendPoints} points for yourself!`);
            displayUserPoints(user.uid);
        }
    }
});

// ------------------- Donate Points to Charity -------------------
document.getElementById("donateBtn").addEventListener("click", async () => {
    const donatePoints = parseInt(document.getElementById("donateAmount").value);
    const charity = document.getElementById("charitySelect").value;
    const user = auth.currentUser;

    if (!user) return alert("Please log in first.");
    if (!charity) return alert("Please select a charity.");

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const currentPoints = userSnap.data().points || 0;

        if (donatePoints > currentPoints) {
            alert("You don't have enough points!");
        } else {
            // Subtract from user points
            await updateDoc(userRef, { points: increment(-donatePoints) });

            // Add to charity collection
            const charityRef = doc(db, "charities", charity);
            const charitySnap = await getDoc(charityRef);

            if (charitySnap.exists()) {
                await updateDoc(charityRef, { points: increment(donatePoints) });
            } else {
                await setDoc(charityRef, { points: donatePoints });
            }

            alert(`You donated ${donatePoints} points to ${charity}!`);
            displayUserPoints(user.uid);
        }
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        displayUserPoints(user.uid);
        addPointsFromCode(user);
    } else {
        window.location.href = "login.html"; // redirect if not logged in
    }
});