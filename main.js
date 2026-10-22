// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

function setMenu(open) {
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
}

toggle.addEventListener("click", () => {
  setMenu(toggle.getAttribute("aria-expanded") !== "true");
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

// Copy email
const copyButton = document.querySelector("[data-copy]");
const copyStatus = document.querySelector(".copy-status");
let copyTimer;

function showStatus(message) {
  copyStatus.textContent = message;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copyStatus.textContent = "";
  }, 2500);
}

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyButton.dataset.copy);
    showStatus("Email copied");
  } catch (error) {
    showStatus("Couldn't copy. Select the email above instead.");
  }
});

// Footer year
document.querySelector("#year").textContent = new Date().getFullYear();
