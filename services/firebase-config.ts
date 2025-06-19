import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD--SFY0OZ_0MlDJ64nUIijd7z9LThI7IM",
  authDomain: "safewoman-eb6e4.firebaseapp.com",
  projectId: "safewoman-eb6e4",
  storageBucket: "safewoman-eb6e4.firebasestorage.app",
  messagingSenderId: "355001070347",
  appId: "1:355001070347:web:8a8db68d295457be61a80e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
