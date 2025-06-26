// attendance.js
// This script handles searching for students, displaying attendance calendar,
// and recording attendance.

import { db, userId, isAuthReady } from './firebase-init.js';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const attendanceSearchForm = document.getElementById('attendanceSearchForm');
    const searchStudentNameInput = document.getElementById('searchStudentName');
    const searchRollNoInput = document.getElementById('searchRollNo');
    const studentDetailsDiv = document.getElementById('studentDetails');
    const displayStudentName = document.getElementById('displayStudentName');
    const displayRollNo = document.getElementById('displayRollNo');
    const displayClassOfStudy = document.getElementById('displayClassOfStudy');
    const displayUserId = document.getElementById('displayUserId'); // To show the userId
    const attendanceCalendarContainer = document.getElementById('attendanceCalendarContainer');
    const currentMonthYearHeader = document.getElementById('currentMonthYear');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const noStudentMessage = document.getElementById('noStudentMessage');

    let currentStudent = null; // Stores the found student's data
    let currentCalendarDate = new Date(); // Tracks the month displayed in the calendar

    // Function to show custom modal (defined in script.js)
    function showModal(type, message, imageUrl = null, studentName = null, confirmCallback = null, cancelCallback = null) {
        if (typeof window.showModal === 'function') {
            window.showModal(type, message, imageUrl, studentName, confirmCallback, cancelCallback);
        } else {
            console.error("showModal function not found. Please ensure script.js is loaded correctly.");
            alert(message); // Fallback for testing
        }
    }

    // Function to fetch student data
    async function searchStudent(name, rollNo) {
        if (!isAuthReady || !userId) {
            showModal('error', 'Authentication not ready. Please wait a moment and try again.');
            console.error("Firebase Auth not ready or user not logged in.");
            return null;
        }

        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const studentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/students`);
            let studentQuery = query(studentsCollectionRef);

            // Add conditions based on provided input
            if (name) {
                studentQuery = query(studentQuery, where('studentName', '==', name));
            }
            if (rollNo) {
                studentQuery = query(studentQuery, where('rollNo', '==', rollNo));
            }

            const querySnapshot = await getDocs(studentQuery);

            if (querySnapshot.empty) {
                showModal('info', 'No student found with the provided details.');
                return null;
            } else if (querySnapshot.docs.length > 1) {
                showModal('info', 'Multiple students found. Please provide more specific details (e.g., exact name and roll number).');
                return null; // Return null if not unique
            } else {
                const studentDoc = querySnapshot.docs[0];
                return { id: studentDoc.id, ...studentDoc.data() };
            }
        } catch (error) {
            console.error("Error searching student:", error);
            showModal('error', `Error searching for student: ${error.message}`);
            return null;
        }
    }

    // Function to render the calendar
    async function renderCalendar(date) {
        if (!currentStudent) {
            noStudentMessage.style.display = 'block';
            studentDetailsDiv.style.display = 'none';
            attendanceCalendarContainer.style.display = 'none';
            return;
        }

        noStudentMessage.style.display = 'none';
        studentDetailsDiv.style.display = 'block';
        attendanceCalendarContainer.style.display = 'block';

        currentMonthYearHeader.textContent = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        calendarGrid.innerHTML = `
            <div class="calendar-day-header">Sun</div>
            <div class="calendar-day-header">Mon</div>
            <div class="calendar-day-header">Tue</div>
            <div class="calendar-day-header">Wed</div>
            <div class="calendar-day-header">Thu</div>
            <div class="calendar-day-header">Fri</div>
            <div class="calendar-day-header">Sat</div>
        `; // Reset grid, keep headers

        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed month

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0); // Last day of current month
        const daysInMonth = lastDayOfMonth.getDate();
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday...

        // Add empty days for the beginning of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty-day');
            calendarGrid.appendChild(emptyDay);
        }

        // Fetch attendance for the current month
        const attendanceData = await getAttendanceForMonth(currentStudent.id, year, month);

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day', 'current-month');
            dayElement.dataset.date = `${year}-${month + 1}-${day}`; // YYYY-M-D format

            const attendanceStatus = attendanceData[`${month + 1}-${day}`]; // Check for M-D key
            if (attendanceStatus === true) {
                dayElement.classList.add('present');
                dayElement.innerHTML = `<span class="day-number">${day}</span><span class="attendance-status">Present</span>`;
            } else if (attendanceStatus === false) {
                dayElement.classList.add('absent');
                dayElement.innerHTML = `<span class="day-number">${day}</span><span class="attendance-status">Absent</span>`;
            } else {
                dayElement.innerHTML = `<span class="day-number">${day}</span><span class="attendance-status"></span>`;
            }

            dayElement.addEventListener('click', () => toggleAttendance(dayElement, currentStudent.id, year, month + 1, day));
            calendarGrid.appendChild(dayElement);
        }
    }

    // Function to get attendance data for a specific month
    async function getAttendanceForMonth(studentId, year, month) {
        if (!isAuthReady || !userId) {
            console.error("Firebase Auth not ready or user not logged in.");
            return {};
        }
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            // Path: /artifacts/{appId}/users/{userId}/students/{studentId}/attendance/{YYYY-MM}
            const attendanceDocRef = doc(db, `artifacts/${appId}/users/${userId}/students/${studentId}/attendance`, `${year}-${String(month + 1).padStart(2, '0')}`);
            const docSnap = await getDoc(attendanceDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Firestore can store numbers or booleans directly in map fields
                // We convert `day` from `M-D` to `D` for easy lookup in calendar,
                // and store it as JSON string if it contains arrays or complex objects.
                // Assuming attendance status is a boolean per day: { "1-5": true, "1-6": false }
                return data.days || {}; // Ensure it's an object, default to empty
            } else {
                return {}; // No attendance record for this month
            }
        } catch (error) {
            console.error("Error fetching attendance for month:", error);
            showModal('error', `Error fetching attendance: ${error.message}`);
            return {};
        }
    }

    // Function to toggle attendance status
    async function toggleAttendance(dayElement, studentId, year, month, day) {
        if (!isAuthReady || !userId) {
            showModal('error', 'Authentication not ready. Please wait a moment and try again.');
            console.error("Firebase Auth not ready or user not logged in.");
            return;
        }

        const dateKey = `${month}-${day}`; // Format for Firestore field (M-D)

        let newStatus;
        if (dayElement.classList.contains('present')) {
            newStatus = false; // Change from Present to Absent
        } else if (dayElement.classList.contains('absent')) {
            newStatus = null; // Change from Absent to Undefined (remove status)
        } else {
            newStatus = true; // Change from Undefined to Present
        }

        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const attendanceDocRef = doc(db, `artifacts/${appId}/users/${userId}/students/${studentId}/attendance`, `${year}-${String(month).padStart(2, '0')}`);

            // To update a specific field within a document (a day's attendance)
            // Use an object to update or set if it doesn't exist
            const updateData = {
                [`days.${dateKey}`]: newStatus // Use dot notation for nested fields
            };

            await setDoc(attendanceDocRef, updateData, { merge: true }); // Merge to avoid overwriting other days/months

            // Update UI immediately
            dayElement.classList.remove('present', 'absent');
            if (newStatus === true) {
                dayElement.classList.add('present');
                dayElement.querySelector('.attendance-status').textContent = 'Present';
                showModal('success', `Attendance recorded for ${currentStudent.studentName} on ${month}/${day}/${year}: Present`);
            } else if (newStatus === false) {
                dayElement.classList.add('absent');
                dayElement.querySelector('.attendance-status').textContent = 'Absent';
                showModal('info', `Attendance recorded for ${currentStudent.studentName} on ${month}/${day}/${year}: Absent`);
            } else {
                dayElement.querySelector('.attendance-status').textContent = '';
                showModal('info', `Attendance status cleared for ${currentStudent.studentName} on ${month}/${day}/${year}.`);
            }
            console.log("Attendance updated successfully!");

        } catch (error) {
            console.error("Error toggling attendance:", error);
            showModal('error', `Failed to update attendance: ${error.message}`);
        }
    }

    // Event listener for search form
    attendanceSearchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = searchStudentNameInput.value.trim();
        const rollNo = searchRollNoInput.value.trim();

        if (!name && !rollNo) {
            showModal('info', 'Please enter either student name or roll number to search.');
            return;
        }

        currentStudent = await searchStudent(name, rollNo);

        if (currentStudent) {
            displayStudentName.textContent = currentStudent.studentName;
            displayRollNo.textContent = currentStudent.rollNo;
            displayClassOfStudy.textContent = currentStudent.classOfStudy;
            displayUserId.textContent = currentStudent.registeredBy; // Show the user ID
            currentCalendarDate = new Date(); // Reset calendar to current month
            renderCalendar(currentCalendarDate);
        } else {
            studentDetailsDiv.style.display = 'none';
            attendanceCalendarContainer.style.display = 'none';
            noStudentMessage.style.display = 'block';
            calendarGrid.innerHTML = `
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
            `;
        }
    });

    // Navigation for calendar
    prevMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar(currentCalendarDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar(currentCalendarDate);
    });

    // Initial render or message on load
    if (!currentStudent) {
        noStudentMessage.style.display = 'block';
        studentDetailsDiv.style.display = 'none';
        attendanceCalendarContainer.style.display = 'none';
    }

    // Wait for Firebase Auth to be ready before enabling functionality
    document.addEventListener('firebaseAuthReady', () => {
        console.log("attendance.js: Firebase Auth is ready. User ID:", userId);
        // If there's a student in cache (e.g., navigated back), re-render calendar
        if (currentStudent) {
            renderCalendar(currentCalendarDate);
        }
    });
});
