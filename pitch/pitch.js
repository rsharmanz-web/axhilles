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
const revealTargets = document.querySelectorAll(".chapter-block, .schematic-box");

revealTargets.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(16px)";
  el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

revealTargets.forEach((el) => revealObserver.observe(el));

// ---------- active chapter nav highlighting (scroll-spy) ----------
const chapters = document.querySelectorAll(".chapter[id]");
const navLinks = document.querySelectorAll(".nav-link[href^='#'], .rail-dot[href^='#']");

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
};

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
);

chapters.forEach((chapter) => spyObserver.observe(chapter));
