(() => {
  const thread = document.getElementById("thread");
  const input = document.getElementById("input");
  const send = document.getElementById("send");
  const composer = document.getElementById("composer");
  const chipsEl = document.getElementById("chips");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const navToggle = document.getElementById("nav-toggle");
  const cursor = document.querySelector(".chat-cursor-block");

  const OPENER_VARIANTS = [
    {
      id: "chax-intro-v2",
      text: "Hey there, I'm Chax (Chat with Axhilles). Here to get the ball rolling on redesigning your business for an AI world. Ask me about something you're struggling with or try one of the buttons to get started.",
      chips: [
        "Why aren't we seeing value",
        "Will AI eat the world?",
        "Isn't it Achilles?!",
      ],
    },
  ];

  const BOOKING_LINK = "https://calendly.com/r-sharma-nz/30min";
  const MAX_MESSAGES = 30;
  const VARIANT_KEY = "ax-opener-variant";
  const X_EGG =
    "Cos X gon' deliver to ya (Uh) Knock-knock, open up the door, it's real";
  const NAME_STORY =
    "In the myth, Thetis dipped infant Achilles in the Styx and held him by the heel. Every telling since has treated that heel as his flaw. Oddly enough, the heel isn't in the original story. Writers added it centuries later because they understood that a warrior who can't be hurt isn't much of a hero. The human part is what makes him interesting.\n\nAxhilles is built on that idea. AI transformation generally defaults to efficiency. We're more interested in the jobs to be done, and creating space for humans to thrive.\n\n" +
    X_EGG;

  function isNameXEgg(text) {
    const t = String(text || "")
      .toLowerCase()
      .replace(/['’]/g, "");
    if (/\bisnt it achilles\b/.test(t)) return true;
    const hasName = /\baxhilles\b|\bachilles\b/.test(t);
    if (!hasName) return false;
    const why =
      /\bwhy\b|\bhow come\b|\bwhats with\b|\bwhat is with\b|\bspel|\btypo\b|\bextra [hx]\b/.test(
        t
      );
    const withX =
      /\bwith an x\b|\bwith a x\b|\ban x\b|\bthe x\b|\bx in\b|\bletter x\b/.test(t);
    const bothNames = /\bachilles\b/.test(t) && /\baxhilles\b/.test(t);
    return (why && (withX || bothNames)) || withX;
  }

  const messages = [];
  let busy = false;
  let capped = false;
  let leadShown = false;
  let leadSent = false;
  let openerVariant = pickOpener();

  function pickOpener() {
    let id = null;
    try {
      id = sessionStorage.getItem(VARIANT_KEY);
    } catch (_) {}
    let variant = OPENER_VARIANTS.find((v) => v.id === id);
    if (!variant) {
      variant = OPENER_VARIANTS[Math.floor(Math.random() * OPENER_VARIANTS.length)];
      try {
        sessionStorage.setItem(VARIANT_KEY, variant.id);
      } catch (_) {}
    }
    return variant;
  }

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
    send.disabled = empty || busy || capped;
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
  function addAssistantStatic(text) {
    const el = document.createElement("div");
    el.className = "assistant-message";
    el.innerHTML = renderMarkdown(text);
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

  function looksLikeBooking(text) {
    const t = String(text || "").toLowerCase();
    if (BOOKING_LINK && t.includes(BOOKING_LINK.toLowerCase())) return true;
    if (t.includes("calendly.com")) return true;
    if (t.includes("{{booking_link}}")) return true;
    return false;
  }

  function setChips(items) {
    chipsEl.innerHTML = "";
    if (!items || !items.length) {
      chipsEl.classList.add("is-hidden");
      return;
    }
    chipsEl.classList.remove("is-hidden");
    items.forEach((chip) => {
      const btn = document.createElement("button");
      btn.className = "starter-prompt-btn";
      btn.type = "button";
      btn.textContent = chip.label;
      btn.addEventListener("click", () => {
        if (chip.id === "book") showLeadForm();
        else sendPrompt(chip.label);
      });
      chipsEl.appendChild(btn);
    });
  }

  function apiMessages() {
    return messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .filter((m) => !m.uiOnly);
  }

  function hitCap() {
    if (capped) return;
    capped = true;
    composer.classList.add("is-capped");
    input.disabled = true;
    syncSend();
    addAssistantStatic("That's a decent run. If you want to keep going, book a chat with Rahul.");
    if (!leadShown && !leadSent) {
      setChips([{ id: "book", label: "Book a chat" }]);
    }
  }

  function showLeadForm() {
    if (leadShown || leadSent) return;
    leadShown = true;
    setChips([]);

    const wrap = document.createElement("form");
    wrap.className = "lead-form";
    wrap.innerHTML =
      '<p class="lead-form-intro">Leave your details and Rahul will get back to you. No slides, no hype.</p>' +
      '<label>Name<input name="name" type="text" autocomplete="name" required></label>' +
      '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
      '<label>Business name <span class="optional">(optional)</span><input name="business" type="text" autocomplete="organization"></label>' +
      '<label class="lead-consent"><input name="consent" type="checkbox" required> I\'m happy for Axhilles to contact me about this chat.</label>' +
      '<button class="lead-submit" type="submit">Send</button>' +
      '<p class="lead-error" hidden></p>';
    thread.appendChild(wrap);
    thread.scrollTop = thread.scrollHeight;

    wrap.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(wrap);
      const errorEl = wrap.querySelector(".lead-error");
      const btn = wrap.querySelector(".lead-submit");
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const business = String(fd.get("business") || "").trim();
      const consent = fd.get("consent") === "on";
      errorEl.hidden = true;
      if (!name || !email || !consent) {
        errorEl.textContent = "Name, email, and consent are required.";
        errorEl.hidden = false;
        return;
      }
      btn.disabled = true;
      try {
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            business,
            consent,
            openerVariant: openerVariant.id,
            transcript: [{ role: "assistant", content: openerVariant.text }].concat(apiMessages()),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Could not send.");
        }
        leadSent = true;
        const thanks = document.createElement("div");
        thanks.className = "assistant-message";
        thanks.innerHTML = renderMarkdown("Sweet, Rahul will be in touch, usually within a day.");
        wrap.replaceWith(thanks);
        thread.scrollTop = thread.scrollHeight;
      } catch (err) {
        btn.disabled = false;
        errorEl.textContent = err instanceof Error ? err.message : "Could not send.";
        errorEl.hidden = false;
      }
    });
  }

  async function sendPrompt(text) {
    const content = text.trim();
    if (!content || busy || capped) return;
    if (apiMessages().length >= MAX_MESSAGES) {
      hitCap();
      return;
    }
    busy = true;
    setChips([]);
    syncSend();
    addUser(content);
    messages.push({ role: "user", content });
    input.value = "";
    resizeInput();
    const bubble = addAssistantShell();
    closeSidebar();

    const userTurn = messages.filter((m) => m.role === "user").length;
    // Only email the first question in a chat so the inbox stays quiet.
    if (userTurn === 1) {
      fetch("/api/chat-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: content,
          turn: userTurn,
          source: isNameXEgg(content) ? "name-egg" : "chat",
        }),
        keepalive: true,
      }).catch(() => {});
    }

    if (isNameXEgg(content)) {
      messages.push({ role: "assistant", content: NAME_STORY });
      await typeInto(bubble, NAME_STORY);
      busy = false;
      syncSend();
      input.focus();
      if (apiMessages().length >= MAX_MESSAGES) hitCap();
      return;
    }

    let assembled = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages() }),
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
      if (looksLikeBooking(assembled) && !leadSent) {
        showLeadForm();
      } else if (!leadSent) {
        setChips([{ id: "book", label: "Book a chat" }]);
      }
      if (apiMessages().length >= MAX_MESSAGES) hitCap();
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

  thread.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (looksLikeBooking(href) || looksLikeBooking(a.textContent)) {
      e.preventDefault();
      showLeadForm();
    }
  });

  composer.addEventListener("submit", (e) => {
    e.preventDefault();
    sendPrompt(input.value);
  });
  document.querySelector('[data-action="home"]').addEventListener("click", () => {
    thread.scrollTop = 0;
    closeSidebar();
  });

  addAssistantStatic(openerVariant.text);
  setChips(openerVariant.chips.map((label) => ({ id: "opener", label })));
  syncSend();
})();
