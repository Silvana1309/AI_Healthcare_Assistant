const userName = localStorage.getItem("userName");

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

document.getElementById("greetingText").textContent =
  `${getGreeting()}, ${userName || "User"} 👋`;

function logout() {
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
}