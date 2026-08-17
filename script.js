// ---------- booking URL ----------
// Swap this for Calendly / Cal.com when ready, e.g. "https://cal.com/your-link"
const BOOKING_URL = "https://calendly.com/r-sharma-nz/30min";

document.querySelectorAll("[data-booking]").forEach((link) => {
  link.setAttribute("href", BOOKING_URL);
});

// ---------- footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- mobile nav toggle ----------
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("nav.topbar .links");

if (navToggle && nav) {
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
}

// ---------- scroll reveal ----------
const revealTargets = document.querySelectorAll(".schematic-box, .data-table, .way-card, .cta-panel");

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
  { threshold: 0.1 }
);

revealTargets.forEach((el) => observer.observe(el));

// ---------- nav scroll spy ----------
const sectionIds = ["why", "ways-in", "about", "contact"];
const navLinks = document.querySelectorAll("nav.topbar .links a.nav-link");

function setActiveNav() {
  const scrollY = window.scrollY + 120;
  let current = sectionIds[0];

  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section && section.offsetTop <= scrollY) {
      current = id;
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    link.classList.toggle("active", href === `#${current}`);
  });
}

window.addEventListener("scroll", setActiveNav, { passive: true });
setActiveNav();

// ---------- contact form ----------
const form = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
const submitButton = document.getElementById("submit-button");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    formNote.classList.remove("success", "error");
    formNote.textContent = "";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        formNote.textContent = "Message sent. We'll be in touch shortly.";
        formNote.classList.add("success");
        form.reset();
      } else {
        throw new Error(result.message || "submission failed");
      }
    } catch (err) {
      formNote.textContent = "Something went wrong — email us directly at hello@axhilles.com";
      formNote.classList.add("error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send message";
    }
  });
}


