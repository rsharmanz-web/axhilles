(() => {
  const thread = document.getElementById("thread");
  const input = document.getElementById("input");
  const send = document.getElementById("send");
  const composer = document.getElementById("composer");
  const starters = document.getElementById("starters");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const navToggle = document.getElementById("nav-toggle");
  const cursor = document.querySelector(".chat-cursor-block");

  const messages = [];
  let busy = false;

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    document.body.classList.remove("sidebar-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
    document.body.classList.add("sidebar-open");
    navToggle.setAttribute("aria-expanded", "true");
  }
  navToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) closeSidebar();
    else openSidebar();
  });
  overlay.addEventListener("click", closeSidebar);

  function resizeInput() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 200) + "px";
  }
  function syncSend() {
    const empty = !input.value.trim();
    send.disabled = empty || busy;
    cursor.classList.toggle("is-empty", empty);
  }
  input.addEventListener("input", () => {
    resizeInput();
    syncSend();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      composer.requestSubmit();
    }
  });

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function renderMarkdown(text) {
    const blocks = text.split(/\n{2,}/);
    return blocks
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        const lines = trimmed.split("\n");
        if (lines.every((l) => /^[-*]\s+/.test(l))) {
          const items = lines
            .map((l) => "<li>" + inline(l.replace(/^[-*]\s+/, "")) + "</li>")
            .join("");
          return "<ul>" + items + "</ul>";
        }
        return "<p>" + inline(trimmed.replace(/\n/g, "<br>")) + "</p>";
      })
      .join("");
  }
  function inline(s) {
    return escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );
  }

  function addUser(text) {
    const el = document.createElement("div");
    el.className = "user-message";
    el.textContent = text;
    thread.appendChild(el);
    thread.scrollTop = thread.scrollHeight;
  }
  function addAssistantShell() {
    const el = document.createElement("div");
    el.className = "assistant-message thinking-text";
    el.textContent = "Thinking";
    thread.appendChild(el);
    thread.scrollTop = thread.scrollHeight;
    return el;
  }

  function typeInto(el, full) {
    return new Promise((resolve) => {
      let i = 0;
      el.classList.remove("thinking-text");
      el.innerHTML = "";
      const tick = () => {
        i = Math.min(i + 4, full.length);
        el.innerHTML = renderMarkdown(full.slice(0, i));
        thread.scrollTop = thread.scrollHeight;
        if (i < full.length) requestAnimationFrame(tick);
        else resolve();
      };
      tick();
    });
  }

  async function sendPrompt(text) {
    const content = text.trim();
    if (!content || busy) return;
    busy = true;
    starters.classList.add("is-hidden");
    syncSend();
    addUser(content);
    messages.push({ role: "user", content });
    input.value = "";
    resizeInput();
    const bubble = addAssistantShell();
    closeSidebar();

    let assembled = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok || !res.body) {
        const err = await res.text();
        throw new Error(err || "Request failed.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        assembled += decoder.decode(value, { stream: true });
      }
      if (!assembled.trim()) throw new Error("Empty reply.");
      messages.push({ role: "assistant", content: assembled });
      await typeInto(bubble, assembled);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      bubble.classList.remove("thinking-text");
      bubble.textContent = msg;
    } finally {
      busy = false;
      syncSend();
      input.focus();
    }
  }

  composer.addEventListener("submit", (e) => {
    e.preventDefault();
    sendPrompt(input.value);
  });
  document.querySelectorAll("[data-prompt]").forEach((btn) => {
    btn.addEventListener("click", () => sendPrompt(btn.dataset.prompt));
  });
  document.querySelector('[data-action="home"]').addEventListener("click", () => {
    thread.scrollTop = 0;
    closeSidebar();
  });

  syncSend();
})();
