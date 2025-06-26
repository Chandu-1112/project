// student-info.js
// This script handles student registration form submission and image preview.

import { db, userId, isAuthReady } from './firebase-init.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('studentRegistrationForm');
    const studentImageInput = document.getElementById('studentImage');
    const imagePreview = document.getElementById('imagePreview');

    // Function to show custom modal (defined in script.js)
    function showModal(type, message, imageUrl = null, studentName = null, confirmCallback = null, cancelCallback = null) {
        if (typeof window.showModal === 'function') {
            window.showModal(type, message, imageUrl, studentName, confirmCallback, cancelCallback);
        } else {
            console.error("showModal function not found. Please ensure script.js is loaded correctly.");
            alert(message); // Fallback for testing
        }
    }

    // Image preview functionality
    studentImageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.classList.add('hidden');
            imagePreview.src = '#';
        }
    });

    // Form submission handler
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isAuthReady || !userId) {
            showModal('error', 'Authentication not ready. Please wait a moment and try again.');
            console.error("Firebase Auth not ready or user not logged in.");
            return;
        }

        const studentName = document.getElementById('studentName').value;
        const parentName = document.getElementById('parentName').value;
        const rollNo = document.getElementById('rollNo').value;
        const classOfStudy = document.getElementById('classOfStudy').value;
        const studentAddress = document.getElementById('studentAddress').value;
        const contactInfo = document.getElementById('contactInfo').value;
        const studentImageFile = studentImageInput.files[0];

        let imageUrl = '';
        if (studentImageFile) {
            // In a real application, you would upload this image to Firebase Storage
            // and get a downloadable URL. For this example, we'll convert it to Base64
            // and store it directly in Firestore (with a warning about size limits).
            // For production, always use Firebase Storage for large files.
            imageUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(studentImageFile);
            });
            if (imageUrl.length > 500 * 1024) { // Warning for images larger than 500KB (Firestore doc limit is 1MB)
                showModal('error', 'Warning: Image is too large. For production, please use Firebase Storage for images. This image might not be saved.');
                imageUrl = ''; // Clear image to prevent saving very large base64
            }
        }

        const studentData = {
            studentName: studentName,
            parentName: parentName,
            rollNo: rollNo,
            classOfStudy: classOfStudy,
            studentAddress: studentAddress,
            contactInfo: contactInfo,
            imageUrl: imageUrl, // Store base64 or URL from storage
            registeredBy: userId,
            registeredAt: new Date()
        };

        try {
            // Save student data to Firestore
            // Path: /artifacts/{appId}/users/{userId}/students
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const studentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/students`);
            await addDoc(studentsCollectionRef, studentData);

            showModal('success', 'Student registered successfully!', imageUrl, studentName);
            registrationForm.reset(); // Clear the form
            imagePreview.classList.add('hidden'); // Hide image preview
            imagePreview.src = '#'; // Clear image source
        } catch (error) {
            console.error("Error registering student:", error);
            showModal('error', `Failed to register student: ${error.message}`);
        }
    });

    // Reset button functionality (handled by form type="reset" but can add custom logic if needed)
    registrationForm.addEventListener('reset', () => {
        imagePreview.classList.add('hidden');
        imagePreview.src = '#';
        showModal('info', 'Form has been reset.');
    });

    // Ensure Firebase is initialized and auth state is ready before Firestore operations
    document.addEventListener('firebaseAuthReady', () => {
        console.log("student-info.js: Firebase Auth is ready. User ID:", userId);
        // You can add logic here that depends on authentication being ready
    });
});
