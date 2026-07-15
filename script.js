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

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("field-name").value.trim();
  const email = document.getElementById("field-email").value.trim();
  const message = document.getElementById("field-message").value.trim();

  const subject = encodeURIComponent(`Enquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);

  window.location.href = `mailto:r.sharma.nz@gmail.com?subject=${subject}&body=${body}`;

  formNote.textContent = "> opening your mail client...";
  formNote.classList.add("success");
});
