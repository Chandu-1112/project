// Function to show a custom modal (replaces alert/confirm)
// type: 'success', 'error', 'info', 'confirm'
// message: The main message to display
// imageUrl: Optional URL for an image (e.g., student profile photo)
// studentName: Optional student name for registration success
// confirmCallback: Function to call if 'confirm' button is clicked (only for type 'confirm')
// cancelCallback: Function to call if 'cancel' button is clicked (only for type 'confirm')
function showModal(type, message, imageUrl = null, studentName = null, confirmCallback = null, cancelCallback = null) {
    let modal = document.getElementById('customModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customModal';
        modal.classList.add('modal');
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content ${type}">
            <span class="modal-close-button">&times;</span>
            <div class="modal-message"></div>
            <div class="registration-success-content" style="display:none;">
                <img src="" alt="Student Photo">
                <h3></h3>
                <p></p>
            </div>
            <div class="modal-button-container"></div>
        </div>
    `;

    const modalContent = modal.querySelector('.modal-content');
    const messageDiv = modal.querySelector('.modal-message');
    const successContentDiv = modal.querySelector('.registration-success-content');
    const successImg = successContentDiv.querySelector('img');
    const successNameH3 = successContentDiv.querySelector('h3');
    const successP = successContentDiv.querySelector('p');
    const buttonContainer = modal.querySelector('.modal-button-container');
    const closeButton = modal.querySelector('.modal-close-button');

    messageDiv.style.display = 'block';
    successContentDiv.style.display = 'none';
    messageDiv.textContent = message;
    buttonContainer.innerHTML = ''; // Clear existing buttons

    // Set modal class based on type
    modalContent.classList.remove('success', 'error', 'info', 'confirm');
    modalContent.classList.add(type);

    if (type === 'success' && imageUrl && studentName) {
        messageDiv.style.display = 'none';
        successContentDiv.style.display = 'flex';
        successImg.src = imageUrl;
        successNameH3.textContent = studentName;
        successP.textContent = "has been successfully registered!";
        // Add an OK button for success message
        const okButton = document.createElement('button');
        okButton.classList.add('modal-button', 'confirm-button');
        okButton.textContent = 'OK';
        okButton.onclick = () => hideModal();
        buttonContainer.appendChild(okButton);
    } else if (type === 'confirm') {
        const confirmButton = document.createElement('button');
        confirmButton.classList.add('modal-button', 'confirm-button');
        confirmButton.textContent = 'Confirm';
        confirmButton.onclick = () => {
            hideModal();
            if (confirmCallback) confirmCallback();
        };

        const cancelButton = document.createElement('button');
        cancelButton.classList.add('modal-button', 'cancel-button');
        cancelButton.textContent = 'Cancel';
        cancelButton.onclick = () => {
            hideModal();
            if (cancelCallback) cancelCallback();
        };
        buttonContainer.appendChild(confirmButton);
        buttonContainer.appendChild(cancelButton);
    } else {
        // For general info/error messages, just an OK button
        const okButton = document.createElement('button');
        okButton.classList.add('modal-button', 'confirm-button');
        okButton.textContent = 'OK';
        okButton.onclick = () => hideModal();
        buttonContainer.appendChild(okButton);
    }

    closeButton.onclick = () => hideModal();
    modal.style.display = 'flex'; // Use flex to center
}

// Function to hide the custom modal
function hideModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make showModal and hideModal globally accessible
window.showModal = showModal;
window.hideModal = hideModal;


// Ripple effect for buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.action-button').forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');

            // Position the ripple
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            // Add ripple to button
            this.appendChild(ripple);

            // Trigger reflow to ensure animation plays
            ripple.offsetWidth;

            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600); // Matches animation duration

            // Button click animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Check if the link is a hash link (for smooth scrolling to sections)
            // or an external/internal page link.
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Adjust for fixed header
                        behavior: 'smooth'
                    });
                }
            }
            // For actual page navigation, the default link behavior will handle it.
        });
    });

    // Logout Button Functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            // Show confirmation modal
            showModal('confirm', 'Are you sure you want to log out?', null, null, async () => {
                try {
                    const { getAuth, signOut } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
                    const auth = getAuth();
                    await signOut(auth);
                    showModal('success', 'Logged out successfully!');
                    // Redirect to login page or home page after logout
                    setTimeout(() => {
                        window.location.href = 'login.html'; // Or 'index.html'
                    }, 1500);
                } catch (error) {
                    console.error("Error signing out:", error);
                    showModal('error', 'Error logging out: ' + error.message);
                }
            });
        });
    }

    // LUSY Chatbox functionality
    const chatboxContainer = document.getElementById('chatbox-container');
    const chatboxHeader = document.getElementById('chatbox-header');
    const chatboxCloseBtn = document.getElementById('chatbox-close-btn');
    const chatboxMessages = document.getElementById('chatbox-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const openChatBtn = document.getElementById('open-chat-btn');

    let isDragging = false;
    let offsetX, offsetY;

    // Toggle chatbox visibility
    openChatBtn.addEventListener('click', () => {
        chatboxContainer.classList.toggle('active');
        if (chatboxContainer.classList.contains('active')) {
            openChatBtn.style.display = 'none'; // Hide toggle button when chat is open
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight; // Scroll to bottom
        }
    });

    chatboxCloseBtn.addEventListener('click', () => {
        chatboxContainer.classList.remove('active');
        openChatBtn.style.display = 'flex'; // Show toggle button when chat is closed
    });

    // Make chatbox draggable
    chatboxHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - chatboxContainer.getBoundingClientRect().left;
        offsetY = e.clientY - chatboxContainer.getBoundingClientRect().top;
        chatboxContainer.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        chatboxContainer.style.left = `${e.clientX - offsetX}px`;
        chatboxContainer.style.top = `${e.clientY - offsetY}px`;
        // Constrain to viewport
        const rect = chatboxContainer.getBoundingClientRect();
        if (rect.left < 0) chatboxContainer.style.left = '0px';
        if (rect.top < 0) chatboxContainer.style.top = '0px';
        if (rect.right > window.innerWidth) chatboxContainer.style.left = `${window.innerWidth - rect.width}px`;
        if (rect.bottom > window.innerHeight) chatboxContainer.style.top = `${window.innerHeight - rect.height}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        chatboxContainer.style.cursor = 'grab';
    });

    // Chat message sending logic
    sendChatBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const userMessage = chatInput.value.trim().toLowerCase();
        if (userMessage === '') return;

        appendMessage(userMessage, 'user-message');
        chatInput.value = '';
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('chat-message', 'bot-message', 'typing-indicator');
        typingIndicator.innerHTML = '<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
        chatboxMessages.appendChild(typingIndicator);
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

        // Simulate a delay for LUSY's response
        setTimeout(() => {
            typingIndicator.remove(); // Remove typing indicator
            const botResponse = getLUSYResponse(userMessage);
            appendMessage(botResponse, 'bot-message');
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
        }, 800); // 800ms delay
    }

    function appendMessage(text, className) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', className);
        messageElement.innerHTML = text; // Use innerHTML to allow for formatted content
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timestampSpan = document.createElement('span');
        timestampSpan.classList.add('message-timestamp');
        timestampSpan.textContent = timestamp;
        messageElement.appendChild(timestampSpan);

        chatboxMessages.appendChild(messageElement);
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
    }

    // Simple LUSY response logic without API
    function getLUSYResponse(prompt) {
        if (prompt.includes("hello") || prompt.includes("hi")) {
            return "Hello there! How can I help you with the Student Attendance Monitoring System?";
        } else if (prompt.includes("how to register student")) {
            return "To register a student, navigate to the 'Manage Student Information' page. You'll find a form there to fill in all the student details and upload a photo.";
        } else if (prompt.includes("how to record attendance")) {
            return "You can record attendance on the 'Record Student Attendance' page. Search for a student by name or roll number, and then use the calendar to mark days as Present or Absent.";
        } else if (prompt.includes("about this system")) {
            return "This is a Student Attendance Monitoring System designed to help educational institutions efficiently track and manage student attendance records. It simplifies administrative tasks and provides insights.";
        } else if (prompt.includes("what is lusy")) {
            return "I am LUSY, your friendly AI assistant for the Student Attendance Monitoring System! I'm here to help answer your questions about the system.";
        } else if (prompt.includes("login")) {
            return "To log in, click on the 'Login' link in the navigation bar. You can use your email and password or sign in with Google.";
        } else if (prompt.includes("logout")) {
            return "To log out, click the 'Logout' link in the navigation bar. You will be asked to confirm your action.";
        } else if (prompt.includes("help") || prompt.includes("faq")) {
            return "You can find more help and frequently asked questions on the 'Help' page. Is there something specific you need assistance with?";
        } else if (prompt.includes("thank you") || prompt.includes("thanks")) {
            return "You're most welcome! Is there anything else I can assist you with?";
        }
        else {
            return `I'm not sure how to answer that directly. You can try searching on Google for "${prompt}" <a href="https://www.google.com/search?q=${encodeURIComponent(prompt)}" target="_blank" style="color: #3498db; text-decoration: underline;">here</a>.`;
        }
    }

    // Simple Image Carousel Logic
    const imageCarousel = document.querySelector('.image-carousel');
    if (imageCarousel) {
        const images = imageCarousel.querySelectorAll('img');
        const totalImages = images.length;
        // Adjust animation duration based on number of images
        // For 5 images, 25s for full cycle (5s per image + 5s transition)
        // (totalImages * 5) seconds
        imageCarousel.style.animationDuration = `${totalImages * 5}s`;
    }
});
