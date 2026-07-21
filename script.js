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
const submitButton = document.getElementById("submit-button");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitButton.disabled = true;
  submitButton.textContent = "[ sending... ]";
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
      formNote.textContent = "> message sent. we'll be in touch shortly.";
      formNote.classList.add("success");
      form.reset();
    } else {
      throw new Error(result.message || "submission failed");
    }
  } catch (err) {
    formNote.textContent = "> something went wrong — email us directly at hello@axhilles.com";
    formNote.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "[ send_message ]";
  }
});
