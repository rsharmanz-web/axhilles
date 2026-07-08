// ---------- footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- mobile nav toggle ----------
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- hero typewriter ----------
const COMMAND = "cat mission.txt";
const OUTPUT = "AI fluency, by design. Not by accident.";

const typedEl = document.getElementById("typed");
const typedCursor = document.getElementById("typed-cursor");
const outputEl = document.getElementById("typed-output");

function typeText(el, text, speed, onDone) {
  let i = 0;
  (function step() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(step, speed);
    } else if (onDone) {
      onDone();
    }
  })();
}

window.addEventListener("DOMContentLoaded", () => {
  typeText(typedEl, COMMAND, 55, () => {
    typedCursor.style.display = "none";
    setTimeout(() => {
      typeText(outputEl, OUTPUT, 25);
    }, 250);
  });
});

// ---------- scroll reveal ----------
const revealTargets = document.querySelectorAll(".step, .who-card, .terminal-form, .direct-contact");

revealTargets.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(16px)";
  el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealTargets.forEach((el) => observer.observe(el));

// ---------- contact form ----------
const form = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("field-name").value.trim();
  const email = document.getElementById("field-email").value.trim();
  const message = document.getElementById("field-message").value.trim();

  const subject = encodeURIComponent(`Enquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);

  window.location.href = `mailto:hello@axhillies.com?subject=${subject}&body=${body}`;

  formNote.textContent = "> opening your mail client...";
  formNote.classList.add("success");
});
