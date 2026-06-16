import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey:            "AIzaSyB6NrVAg0ehOpCpMJxAd1PES_9G14oy-94",
    authDomain:        "superpilot-73a32.firebaseapp.com",
    projectId:         "superpilot-73a32",
    storageBucket:     "superpilot-73a32.firebasestorage.app",
    messagingSenderId: "553371049637",
    appId:             "1:553371049637:web:39fa0302c0e0932c04374c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAccount(pseudo, email, password) {
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
            pseudo, email,
            bestScore:0, totalGames:0, bestStreak:0,
            xp:0, dailyStreak:0, lastPlayedDate:'',
            badges:[], onboardingDone:true, // Bypass onboarding
            trophies: 0,
            lastPlayed: new Date()
        });
        console.log(`✅ Compte créé avec succès : ${email}`);
    } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
            console.log(`ℹ️ Le compte ${email} existe déjà.`);
        } else {
            console.error(`Erreur pour ${email}:`, err.message);
        }
    }
}

async function main() {
    await createAccount("Pilote1", "p1@test.fr", "123456");
    await createAccount("Racer2", "p2@test.fr", "123456");
    process.exit(0);
}

main();
