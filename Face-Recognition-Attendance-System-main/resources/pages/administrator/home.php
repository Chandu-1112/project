<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link href="resources/images/logo/attnlg.png" rel="icon">
    <title>Dashboard</title>
    <link rel="stylesheet" href="resources/assets/css/styles.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.2.0/remixicon.css" rel="stylesheet">
    <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Career Roadmap Selector</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #2c3e50;
      padding: 10px 20px;
      color: white;
    }

    .nav-left {
      font-size: 20px;
      font-weight: bold;
    }

    .nav-right a {
      margin-left: 15px;
      color: white;
      text-decoration: none;
      font-weight: bold;
    }

    .nav-right a:hover {
      text-decoration: underline;
    }

    .slideshow-container {
      max-width: 100%;
      position: relative;
      margin: auto;
      overflow: hidden;
    }

    .slide {
      display: none;
      width: 100%;
    }

    .slide img {
  width: 100%;
  max-height: 500px; /* adjust as needed */
  size: cover;
}


    input, button, select {
      padding: 10px;
      margin: 5px;
      font-size: 16px;
    }

    #careerResult {
      margin-top: 30px;
      text-align: left;
      max-width: 800px;
      margin: auto;
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 10px;
    }
  </style>
</head>

<body>
    <?php include 'includes/topbar.php'; ?>
  <section class="main">  
    <?php include 'includes/sidebar.php'; ?>

  <div class="slideshow-container">
 <div class="slide">
  <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?fit=crop&w=1200&q=80" alt="Career Planning">
</div>
<div class="slide">
  <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?fit=crop&w=1200&q=80" alt="Technology Career">
</div>
<div class="slide">
  <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?fit=crop&w=1200&q=80" alt="Learning and Development">
</div>

  </div>

  <div style="text-align:center; padding: 30px; background-color: #f4f4f4;">
    <h2 style="color: #2c3e50;">Plan Your Future with Confidence</h2>
    <p style="font-size: 18px; color: #333;">
      Discover your strengths, explore career options, and get personalized guidance to build the future you deserve.
    </p>
  </div>

  <div style="text-align:center; padding: 30px;">
    <h3>Select Your Career Path</h3>
    <select id="careerSelect">
      <option value="">-- Select a Career --</option>
      <option value="webdev">Web Designer</option>
      <option value="frontend">Front-End Developer</option>
      <option value="backend">Back-End Developer</option>
      <option value="fullstack">Full Stack Developer</option>
      <option value="ml">Machine Learning Engineer</option>
      <option value="ai">AI Engineer</option>
      <option value="android">Android Developer</option>
      <option value="cybersecurity">Cybersecurity Analyst</option>
      <option value="datasci">Data Scientist</option>
      <option value="cloud">Cloud Engineer</option>
    </select>
    <button onclick="showRoadmap()">Get Roadmap</button>

    <div id="careerResult"></div>
  </div>

  <script>
    function showRoadmap() {
  const career = document.getElementById("careerSelect").value;
  const resultDiv = document.getElementById("careerResult");

  const roadmaps = {
    webdev: {
      title: "Web Designer",
      about: "Focuses on the visual aspects and layout of websites.",
      skills: ["HTML", "CSS", "JavaScript", "UI/UX", "Responsive Design"],
      subjects: ["Web Technologies", "Graphics", "HCI"],
      resources: [
        "https://www.freecodecamp.org/",
        "https://www.w3schools.com/",
        "https://developer.mozilla.org/"
      ]
    },
    frontend: {
      title: "Front-End Developer",
      about: "Builds the client-side interface of websites and applications.",
      skills: ["HTML", "CSS", "JavaScript", "React/Vue", "Git"],
      subjects: ["Web Programming", "Software Engineering"],
      resources: [
        "https://reactjs.org/",
        "https://frontendmasters.com/",
        "https://css-tricks.com/"
      ]
    },
    backend: {
      title: "Back-End Developer",
      about: "Handles server-side logic and database management.",
      skills: ["Node.js", "Python/PHP", "SQL", "REST APIs", "Authentication"],
      subjects: ["Databases", "Algorithms", "Operating Systems"],
      resources: [
        "https://nodejs.dev/",
        "https://www.geeksforgeeks.org/",
        "https://www.udemy.com/"
      ]
    },
    fullstack: {
      title: "Full Stack Developer",
      about: "Manages both front-end and back-end development.",
      skills: ["HTML", "CSS", "JavaScript", "Node.js", "React", "MongoDB"],
      subjects: ["Web Development", "Databases", "Networks"],
      resources: [
        "https://www.fullstackopen.com/",
        "https://www.codecademy.com/",
        "https://www.theodinproject.com/"
      ]
    },
    ml: {
      title: "Machine Learning Engineer",
      about: "Creates ML models and systems that learn from data.",
      skills: ["Python", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow"],
      subjects: ["Linear Algebra", "Statistics", "AI", "Data Mining"],
      resources: [
        "https://www.coursera.org/learn/machine-learning",
        "https://www.kaggle.com/",
        "https://developers.google.com/machine-learning"
      ]
    },
    ai: {
      title: "AI Engineer",
      about: "Builds intelligent systems using advanced algorithms.",
      skills: ["Deep Learning", "Python", "PyTorch", "Computer Vision", "NLP"],
      subjects: ["Neural Networks", "Cognitive Science", "AI Ethics"],
      resources: [
        "https://www.udacity.com/course/ai-for-everyone--ud005",
        "https://ai.google/education/",
        "https://www.deeplearning.ai/"
      ]
    },
    android: {
      title: "Android Developer",
      about: "Develops apps for Android smartphones and tablets.",
      skills: ["Java", "Kotlin", "XML", "Android Studio", "Firebase"],
      subjects: ["Mobile Development", "UI Design"],
      resources: [
        "https://developer.android.com/",
        "https://www.udacity.com/course/new-android-fundamentals--ud851",
        "https://developer.android.com/courses"
      ]
    },
    cybersecurity: {
      title: "Cybersecurity Analyst",
      about: "Protects systems and networks from digital attacks.",
      skills: ["Network Security", "Linux", "Firewalls", "Penetration Testing"],
      subjects: ["Cryptography", "Operating Systems", "Ethical Hacking"],
      resources: [
        "https://www.cybrary.it/",
        "https://www.edx.org/learn/cybersecurity",
        "https://www.tryhackme.com/"
      ]
    },
    datasci: {
      title: "Data Scientist",
      about: "Analyzes data to extract insights and drive decisions.",
      skills: ["Python", "Pandas", "Data Visualization", "SQL", "ML Basics"],
      subjects: ["Statistics", "Data Mining", "Big Data"],
      resources: [
        "https://www.datacamp.com/",
        "https://jovian.com/",
        "https://www.kaggle.com/learn"
      ]
    },
    cloud: {
      title: "Cloud Engineer",
      about: "Builds and manages cloud infrastructure (AWS, Azure, GCP).",
      skills: ["AWS/GCP", "Docker", "Kubernetes", "Linux", "DevOps Tools"],
      subjects: ["Cloud Computing", "Virtualization", "Networks"],
      resources: [
        "https://cloud.google.com/training",
        "https://aws.amazon.com/training/",
        "https://www.udemy.com/"
      ]
    }
  };

  if (!career || !roadmaps[career]) {
    resultDiv.innerHTML = "⚠️ Please select a valid career option.";
    return;
  }

  const data = roadmaps[career];
  resultDiv.innerHTML = `
    <h2><i class="fas fa-user-tie"></i> ${data.title}</h2>
    <h3><i class="fas fa-info-circle"></i> About</h3>
    <p>${data.about}</p>
    <h3><i class="fas fa-tools"></i> Skills Required</h3>
    <ul>${data.skills.map(skill => `<li><i class="fas fa-check-circle"></i> ${skill}</li>`).join("")}</ul>
    <h3><i class="fas fa-book"></i> Important Subjects</h3>
    <ul>${data.subjects.map(sub => `<li><i class="fas fa-book-reader"></i> ${sub}</li>`).join("")}</ul>
    <h3><i class="fas fa-globe"></i> Top Online Resources</h3>
    <ul>${data.resources.map(link => `<li><a href="${link}" target="_blank"><i class="fas fa-external-link-alt"></i> ${link}</a></li>`).join("")}</ul>
  `;
}


    // Slideshow
    let slideIndex = 0;
    function showSlides() {
      let slides = document.getElementsByClassName("slide");
      for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
      }
      slideIndex++;
      if (slideIndex > slides.length) { slideIndex = 1 }    
      slides[slideIndex - 1].style.display = "block";  
      setTimeout(showSlides, 3000);
    }
    showSlides();
  </script>

</section>


    <?php js_asset(["active_link", "delete_request"]) ?>


</body>

</html>