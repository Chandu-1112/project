// firebase-init.js
// This file initializes Firebase and handles authentication.

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Global variables for Firebase instances
let app;
let auth;
let db;
let userId = null; // Will store the current user's ID
let isAuthReady = false; // Flag to indicate if auth state has been checked

// Check if __firebase_config and __app_id are defined by the Canvas environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Function to initialize Firebase
async function initializeFirebase() {
    if (app) return; // Already initialized

    if (firebaseConfig) {
        try {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            console.log("Firebase initialized successfully.");

            // Listen for authentication state changes
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    userId = user.uid;
                    console.log("User is signed in:", userId);
                } else {
                    console.log("No user is signed in. Attempting anonymous sign-in...");
                    try {
                        // If no user, and initial token is not available, sign in anonymously
                        if (typeof __initial_auth_token === 'undefined') {
                            await signInAnonymously(auth);
                            userId = auth.currentUser.uid;
                            console.log("Signed in anonymously:", userId);
                        }
                    } catch (anonError) {
                        console.error("Error signing in anonymously:", anonError);
                    }
                }
                isAuthReady = true; // Mark auth as ready after initial check
                document.dispatchEvent(new CustomEvent('firebaseAuthReady')); // Dispatch event
            });

            // Attempt to sign in with custom token if available
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                try {
                    await signInWithCustomToken(auth, __initial_auth_token);
                    console.log("Signed in with custom token.");
                } catch (error) {
                    console.error("Error signing in with custom token:", error);
                    // Fallback to anonymous sign-in if custom token fails (e.g., expired/invalid)
                    await signInAnonymously(auth);
                    console.log("Signed in anonymously after custom token failure.");
                }
            } else {
                // If no custom token provided, sign in anonymously by default
                 if (!auth.currentUser) { // Only sign in if not already signed in by onAuthStateChanged
                    await signInAnonymously(auth);
                    console.log("Signed in anonymously (no initial token).");
                }
            }

        } catch (error) {
            console.error("Failed to initialize Firebase:", error);
            // Handle initialization errors, e.g., display a message to the user
        }
    } else {
        console.warn("Firebase config not found. Firebase services will not be available.");
    }
}

// Initialize Firebase when this script loads
initializeFirebase();

// Export the Firebase instances and userId for use in other modules
export { app, auth, db, userId, isAuthReady, initializeFirebase };

// This event listener is for any modules that need to wait for Firebase auth to be ready
// Example usage in another module:
// document.addEventListener('firebaseAuthReady', () => {
//     if (isAuthReady) {
//         // Now you can safely use `db`, `auth`, `userId`
//         console.log("Firebase Auth is ready! User ID:", userId);
//     }
// });
