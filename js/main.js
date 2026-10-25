// Dark mode
const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function applyTheme(theme, save) {
  root.dataset.theme = theme;
  themeToggle.setAttribute("aria-checked", String(theme === "dark"));
  themeColor.setAttribute("content", theme === "dark" ? "#111113" : "#d3d3d9");
  if (save) {
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      // Storage can be blocked; the theme still changes for this visit.
    }
  }
}

applyTheme(root.dataset.theme || "light", false);

themeToggle.addEventListener("click", () => {
  if (!reduceMotion) {
    root.classList.add("theme-anim");
    setTimeout(() => root.classList.remove("theme-anim"), 400);
  }
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
});

// Follow the system setting until the visitor picks a theme themselves
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  let saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch (error) {}
  if (!saved) applyTheme(event.matches ? "dark" : "light", false);
});

// Header turns grey after scrolling
const header = document.querySelector(".site-header");

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

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

// Scroll reveal: elements with data-reveal fade in as they enter the screen
const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Hero glow follows the pointer (mouse and pen only, and not for reduced motion)
const hero = document.querySelector(".hero");

if (hero && !reduceMotion) {
  let frame = null;
  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const box = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", event.clientX - box.left + "px");
      hero.style.setProperty("--my", event.clientY - box.top + "px");
      frame = null;
    });
  });
}
