const API_URL = "http://127.0.0.1:8000";

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");

let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

function showWebsite(name) {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("websiteContent").style.display = "block";

  const hour = new Date().getHours();
  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  const welcomeText = document.getElementById("welcomeText");
  if (welcomeText) {
    welcomeText.textContent = `${greeting}, ${name} 👋`;
  }

  updateProfileDashboard();
}

function loginUser() {
  const name = document.getElementById("loginName").value.trim();

  if (!name) {
    alert("Name is required");
    return;
  }

  localStorage.setItem("userName", name);
  showWebsite(name);
}

function logoutUser() {
  localStorage.removeItem("userName");
  localStorage.removeItem("chatHistory");
  location.reload();
}

window.onload = function () {
  const userName = localStorage.getItem("userName");

  if (userName) {
    showWebsite(userName);
  }
};

function renderChat() {
  chatBox.innerHTML = "";

  chatHistory.forEach(chat => {
    addMessage(chat.text, chat.sender, false);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

function saveChat() {
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function addMessage(text, sender, save = true) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;

  chatBox.appendChild(div);

  if (save) {
    chatHistory.push({ text, sender });
    saveChat();
  }

  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

async function sendMessage(event) {
  if (event) event.preventDefault();

  const message = userInput.value.trim();
  if (!message) return false;

  addMessage(message, "user");
  userInput.value = "";

  const loadingMessage = addMessage("Typing...", "bot", false);

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    loadingMessage.remove();

    addMessage(data.bot_response || "No response from chatbot", "bot");

  } catch (error) {
    console.error(error);
    loadingMessage.remove();
    addMessage("API connection failed. Please make sure the backend server is running.", "bot");
  }

  return false;
}

async function getSymptomGuidance() {
  const age = document.getElementById("ageInput").value.trim();
  const symptoms = document.getElementById("symptomInput").value.trim();
  const result = document.getElementById("symptomResult");

  if (!age || !symptoms) {
    alert("Please enter age and symptoms first");
    return;
  }

  result.innerHTML = "Analyzing symptoms based on age...";

  try {
    const response = await fetch(`${API_URL}/api/symptom-guidance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ age, symptoms })
    });

    const data = await response.json();
    result.innerHTML = `<pre>${data.result}</pre>`;
  } catch (error) {
    console.error(error);
    result.innerHTML = "Failed to get symptom guidance.";
  }
}

async function getHealthTips() {
  const result = document.getElementById("tipsResult");
  result.innerHTML = "Generating health tips...";

  try {
    const response = await fetch(`${API_URL}/api/health-tips`);
    const data = await response.json();

    result.innerHTML = `<pre>${data.result}</pre>`;
  } catch (error) {
    console.error(error);
    result.innerHTML = "Failed to get health tips.";
  }
}

async function getMedicationInfo() {
  const medicine = document.getElementById("medicineInput").value.trim();
  const result = document.getElementById("medicineResult");

  if (!medicine) {
    alert("Please enter the medicine name");
    return;
  }

  result.innerHTML = "Searching medication information...";

  try {
    const response = await fetch(`${API_URL}/api/medication-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ medicine })
    });

    const data = await response.json();
    result.innerHTML = `<pre>${data.result}</pre>`;
  } catch (error) {
    console.error(error);
    result.innerHTML = "Failed to get medication information.";
  }
}

async function getPreventiveCare() {
  const result = document.getElementById("preventiveResult");
  result.innerHTML = "Generating preventive care suggestions...";

  try {
    const response = await fetch(`${API_URL}/api/preventive-care`);
    const data = await response.json();

    result.innerHTML = `<pre>${data.result}</pre>`;
  } catch (error) {
    console.error(error);
    result.innerHTML = "Failed to get preventive care suggestions.";
  }
}

async function getSymptomSeverity() {
  const symptoms = document.getElementById("severitySymptomInput").value.trim();
  const duration = document.getElementById("durationInput").value;
  const severity = document.getElementById("severityLevelInput").value;
  const result = document.getElementById("severityResult");

  if (!symptoms || !duration || !severity) {
    alert("Please complete symptoms, duration, and severity level");
    return;
  }

  result.innerHTML = "Checking symptom severity...";

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `
Symptoms: ${symptoms}
Duration: ${duration}
Severity level: ${severity}

Classify the symptom severity as Low, Moderate, or High risk.
Provide safe general recommendations.
Do not diagnose.
Answer in English.
`
      })
    });

    const data = await response.json();
    result.innerHTML = `<pre>${data.bot_response}</pre>`;
  } catch (error) {
    console.error(error);
    result.innerHTML = "Failed to check symptom severity.";
  }
}

function calculateBMI() {
  const height = Number(document.getElementById("heightInput").value);
  const weight = Number(document.getElementById("weightInput").value);
  const result = document.getElementById("bmiResult");

  if (!height || !weight) {
    alert("Please enter height and weight");
    return;
  }

  const heightMeter = height / 100;
  const bmi = weight / (heightMeter * heightMeter);

  let category = "";

  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obesity";

  result.innerHTML = `
    <h4>BMI Result</h4>
    <p><strong>BMI:</strong> ${bmi.toFixed(1)}</p>
    <p><strong>Category:</strong> ${category}</p>
    <p>This result is general information and does not replace professional medical advice.</p>
  `;
}

async function getHealthRisk() {
  const age = document.getElementById("riskAgeInput").value.trim();
  const smoking = document.getElementById("smokingInput").value;
  const exercise = document.getElementById("exerciseInput").value;
  const familyHistory = document.getElementById("familyHistoryInput").value.trim();
  const result = document.getElementById("riskResult");

  if (!age || !smoking || !exercise) {
    alert("Please complete age, smoking habit, and exercise frequency");
    return;
  }

  result.innerHTML = "Analyzing health risk...";

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `
Age: ${age}
Smoking: ${smoking}
Exercise: ${exercise}
Family disease history: ${familyHistory || "None"}

Provide general health risk assessment and prevention suggestions.
`
      })
    });

    const data = await response.json();
    result.innerHTML = `<pre>${data.bot_response}</pre>`;
  } catch (error) {
    console.error(error);
    result.innerHTML = "Failed to analyze health risk.";
  }
}

async function explainMedicalTerm() {
  const term = document.getElementById("medicalTermInput").value.trim();
  const result = document.getElementById("medicalTermResult");

  if (!term) {
    alert("Please enter a medical term");
    return;
  }

  result.innerHTML = "Explaining medical term...";

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Explain this medical term in simple language: ${term}`
      })
    });

    const data = await response.json();
    result.innerHTML = `<pre>${data.bot_response}</pre>`;
  } catch (error) {
    console.error(error);
    result.innerHTML = "Failed to explain medical term.";
  }
}

function calculateWaterIntake() {
  const weight = Number(document.getElementById("waterWeightInput").value);
  const result = document.getElementById("waterResult");

  if (!weight || weight <= 0) {
    alert("Please enter a valid weight");
    return;
  }

  const waterLiter = (weight * 35) / 1000;

  result.innerHTML = `
    <h4>Water Intake Result</h4>
    <p><strong>Recommended intake:</strong> ${waterLiter.toFixed(2)} liters/day</p>
  `;
}

function calculateCalories() {
  const age = Number(document.getElementById("calorieAge").value);
  const weight = Number(document.getElementById("calorieWeight").value);
  const height = Number(document.getElementById("calorieHeight").value);
  const gender = document.getElementById("calorieGender").value;
  const activity = Number(document.getElementById("calorieActivity").value);
  const result = document.getElementById("calorieResult");

  if (!age || !weight || !height || !gender || !activity) {
    alert("Please complete all calorie calculator fields.");
    return;
  }

  let bmr;

  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const calories = Math.round(bmr * activity);

  result.innerHTML = `
    <h4>Daily Calorie Result</h4>
    <p><strong>Estimated Calories:</strong> ${calories} kcal/day</p>
    <p>This is a general estimate and does not replace professional nutrition advice.</p>
  `;
}

function updateProfileDashboard() {
  const userName = localStorage.getItem("userName") || "User";
  const profileName = document.getElementById("profileName");

  if (profileName) {
    profileName.textContent = userName;
  }
}

updateProfileDashboard();

if (userInput) {
  userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage(event);
    }
  });
}

renderChat();