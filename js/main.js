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
  if (!copyStatus) return;
  copyStatus.textContent = message;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copyStatus.textContent = "";
  }, 2500);
}

if (copyButton) copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyButton.dataset.copy);
    showStatus("Email copied");
  } catch (error) {
    showStatus("Couldn't copy. Select the email above instead.");
  }
});

// Footer year
const yearEl = document.querySelector("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

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

// Tilt: project previews lean slightly towards the pointer (mouse devices only)
const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion;

if (canTilt) {
  document.querySelectorAll(".project .shot").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      card.style.setProperty("--ry", (x * 6).toFixed(2) + "deg");
      card.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg");
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

// Small message at the bottom of the screen
function toast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

// Command menu: Ctrl or Cmd + K, or the Search button
const cmdDialog = document.querySelector("#command-menu");
const cmdButton = document.querySelector(".cmd-btn");

if (cmdDialog && typeof cmdDialog.showModal === "function") {
  const cmdInput = cmdDialog.querySelector(".cmd-input");
  const cmdList = cmdDialog.querySelector(".cmd-list");
  const root = document.body.dataset.root || "";
  const home = root ? root + "index.html" : "";

  const go = (url) => () => {
    window.location.href = url;
  };
  const openTab = (url) => () => {
    window.open(url, "_blank", "noopener");
  };
  const EMAIL = "chinomnsougba@gmail.com";

  const commands = [
    { group: "Go to", label: "Work", run: go(home + "#work") },
    { group: "Go to", label: "Experience", run: go(home + "#experience") },
    { group: "Go to", label: "About", run: go(home + "#about") },
    { group: "Go to", label: "Now", run: go(home + "#now") },
    { group: "Go to", label: "Contact", run: go(home + "#contact") },
    { group: "Case studies", label: "PowerPlanner", keys: "electricity power", run: go(root + "projects/powerplanner.html") },
    { group: "Case studies", label: "Weather App", keys: "weather api", run: go(root + "projects/weather-app.html") },
    { group: "Case studies", label: "KeyFlow", keys: "typing speed", run: go(root + "projects/keyflow.html") },
    { group: "Live sites", label: "Open PowerPlanner", run: openTab("https://power-manager-one.vercel.app/") },
    { group: "Live sites", label: "Open Weather App", run: openTab("https://chinomnso-ugba.github.io/Weather-App/") },
    { group: "Live sites", label: "Open KeyFlow", run: openTab("https://chinomnso-ugba.github.io/Typing-Speed-App/") },
    { group: "Links", label: "GitHub", run: openTab("https://github.com/Chinomnso-Ugba") },
    { group: "Links", label: "LinkedIn", run: openTab("https://www.linkedin.com/in/chinomnso-ugba-b372222a1/") },
    { group: "Links", label: "X", keys: "twitter", run: openTab("https://x.com/nonsougba") },
    {
      group: "Actions",
      label: "Toggle dark mode",
      keys: "theme light",
      run: () => themeToggle.click(),
    },
    {
      group: "Actions",
      label: "Copy email address",
      keys: "contact",
      run: async () => {
        try {
          await navigator.clipboard.writeText(EMAIL);
          toast("Email copied");
        } catch (error) {
          toast("Couldn't copy. Email: " + EMAIL);
        }
      },
    },
    { group: "Actions", label: "Send an email", keys: "mailto contact", run: go("mailto:" + EMAIL) },
    {
      group: "Actions",
      label: "Download CV",
      keys: "resume pdf",
      run: () => {
        const link = document.createElement("a");
        link.href = root + "assets/Chinomnso-Ugba-CV.pdf";
        link.download = "";
        link.click();
      },
    },
  ];

  let visible = commands;
  let active = 0;

  function renderCommands() {
    const query = cmdInput.value.trim().toLowerCase();
    visible = commands.filter((c) => (c.label + " " + c.group + " " + (c.keys || "")).toLowerCase().includes(query));
    active = Math.min(active, Math.max(visible.length - 1, 0));
    cmdList.innerHTML = "";

    if (!visible.length) {
      const empty = document.createElement("li");
      empty.className = "cmd-empty";
      empty.textContent = "No matches";
      cmdList.appendChild(empty);
      cmdInput.removeAttribute("aria-activedescendant");
      return;
    }

    let lastGroup = "";
    visible.forEach((command, index) => {
      if (command.group !== lastGroup) {
        const heading = document.createElement("li");
        heading.className = "cmd-group";
        heading.setAttribute("role", "presentation");
        heading.textContent = command.group;
        cmdList.appendChild(heading);
        lastGroup = command.group;
      }
      const item = document.createElement("li");
      item.className = "cmd-item";
      item.id = "cmd-option-" + index;
      item.setAttribute("role", "option");
      item.textContent = command.label;
      item.addEventListener("click", () => runCommand(index));
      item.addEventListener("pointermove", () => setActive(index, false));
      cmdList.appendChild(item);
    });
    setActive(active, false);
  }

  function setActive(index, scroll) {
    active = index;
    cmdList.querySelectorAll(".cmd-item").forEach((item, i) => {
      const on = i === active;
      item.classList.toggle("is-active", on);
      item.setAttribute("aria-selected", String(on));
      if (on) {
        cmdInput.setAttribute("aria-activedescendant", item.id);
        if (scroll) item.scrollIntoView({ block: "nearest" });
      }
    });
  }

  function runCommand(index) {
    const command = visible[index];
    if (!command) return;
    cmdDialog.close();
    command.run();
  }

  function openMenu() {
    if (cmdDialog.open) return;
    cmdInput.value = "";
    active = 0;
    cmdDialog.showModal();
    renderCommands();
    cmdInput.focus();
  }

  cmdInput.addEventListener("input", () => {
    active = 0;
    renderCommands();
  });

  cmdInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (visible.length) setActive((active + 1) % visible.length, true);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (visible.length) setActive((active - 1 + visible.length) % visible.length, true);
    } else if (event.key === "Enter") {
      event.preventDefault();
      runCommand(active);
    }
  });

  // A click on the dimmed area outside the box closes the menu
  cmdDialog.addEventListener("click", (event) => {
    if (event.target === cmdDialog) cmdDialog.close();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (cmdDialog.open) cmdDialog.close();
      else openMenu();
    }
  });

  if (cmdButton) cmdButton.addEventListener("click", openMenu);
  if (/Mac|iPhone|iPad/.test(navigator.platform)) {
    document.querySelectorAll(".cmd-btn-kbd").forEach((kbd) => (kbd.textContent = "\u2318 K"));
  }
} else if (cmdButton) {
  cmdButton.hidden = true;
}
