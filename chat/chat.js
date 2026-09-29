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
      id: "chax-intro-v5",
      text: "Let's Chax. Pick one of the options below or enter your own question.",
      chips: [
        "Why aren't I seeing value?",
        "Will AI eat the world?",
        "What was your favourite part of the Odyssey?",
      ],
    },
  ];

  const BOOKING_LINK = "https://calendly.com/r-sharma-nz/30min";
  const MAX_MESSAGES = 30;
  // Answer this many real questions before asking who we are talking to. One buys enough goodwill to
  // be worth a name; two and most cold readers have already got what they came for and left.
  const FREE_EXCHANGES = 1;
  const VARIANT_KEY = "ax-opener-variant";
  const X_EGG =
    "Cos X gon' deliver to ya (Uh) Knock-knock, open up the door, it's real";
  const VALUE_REPLY =
    "That will probably take some diagnosing. But a good place to start is have you thought about the workflow and where AI could, should and shouldn't be applied? We find that is usually a good place to start.";
  const EAT_WORLD_REPLY =
    "Good question. Honestly, No. But if you want a hype-free independent opinion, then I think Ben Evans' presentation is a great place to start. The link is in the [articles section](/readings/) along with a few other good pieces we've come across recently.";
  const ODYSSEY_REPLY =
    "It's gotta be the dog wagging his tail when Odysseus returns.";
  const TOTTENHAM_REPLY = "S#it! What do you think of s#hit?!";

  // Set by /attribution.js. Absent if that script was blocked, in which case the lead still sends.
  function visitorAttribution() {
    try {
      return window.axhillesAttribution ? window.axhillesAttribution.get() : null;
    } catch (_) {
      return null;
    }
  }

  function normalizePrompt(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[?!.,]+$/g, "")
      .trim();
  }

  function isNameXEgg(text) {
    const t = normalizePrompt(text);
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

  function getLockedReply(text) {
    const t = normalizePrompt(text);

    if (awaitingTottenhamThanks) {
      awaitingTottenhamThanks = false;
      if (/^tottenham$/.test(t)) return { reply: "Thank you.", offerBook: false };
    }

    if (
      /\bwhat do you think of tottenham\b/.test(t) ||
      /\bthoughts on tottenham\b/.test(t)
    ) {
      awaitingTottenhamThanks = true;
      return { reply: TOTTENHAM_REPLY, offerBook: false };
    }

    if (
      /\bwhy arent (i|we) seeing value\b/.test(t) ||
      /\bwhy am i not seeing value\b/.test(t)
    ) {
      return { reply: VALUE_REPLY, offerBook: true };
    }

    if (/\bwill ai eat the world\b/.test(t) || /\bai eat the world\b/.test(t)) {
      return { reply: EAT_WORLD_REPLY, offerBook: true };
    }

    if (
      /\bfavour?ite part of the odyssey\b/.test(t) ||
      /\bodyssey\b/.test(t) && /\bfavour?ite\b/.test(t)
    ) {
      return { reply: ODYSSEY_REPLY, offerBook: false };
    }

    return null;
  }

  const messages = [];
  let busy = false;
  let capped = false;
  let leadShown = false;
  let leadSent = false;
  let sessionLogged = false;
  let gateOpen = false;
  // Easter eggs and the Odyssey answer do not count. Being walled after a joke reads as a bait.
  let realExchanges = 0;
  let visitor = null;
  let userTurnsAtCapture = 0;
  let awaitingTottenhamThanks = false;
  let idleTimer = null;
  const IDLE_MS = 5 * 60 * 1000;
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
    send.disabled = empty || busy || capped || gateOpen;
    cursor.classList.toggle("is-empty", empty);
  }
  input.addEventListener("input", () => {
    resizeInput();
    syncSend();
    bumpIdle();
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
    thread.appendChild(chipsEl);
    items.forEach((chip) => {
      const btn = document.createElement("button");
      btn.className = "starter-prompt-btn";
      btn.type = "button";
      btn.textContent = chip.label;
      btn.addEventListener("click", () => {
        setChips([]);
        if (chip.id !== "book") sendPrompt(chip.label);
        else if (leadSent) window.open(BOOKING_LINK, "_blank", "noopener");
        else showLeadForm("booking");
      });
      chipsEl.appendChild(btn);
    });
    thread.scrollTop = thread.scrollHeight;
  }

  function apiMessages() {
    return messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .filter((m) => !m.uiOnly);
  }

  function clearIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  function bumpIdle() {
    if (sessionLogged || capped) return;
    const users = messages.filter((m) => m.role === "user");
    if (!users.length) return;
    clearIdleTimer();
    idleTimer = setTimeout(() => flushSessionLog("inactive"), IDLE_MS);
  }

  function sessionTranscript() {
    return [{ role: "assistant", content: openerVariant.text }].concat(apiMessages());
  }

  function flushSessionLog(reason) {
    if (sessionLogged) return;
    const transcript = sessionTranscript();
    const users = transcript.filter((m) => m.role === "user");
    if (!users.length) return;
    // Details captured mid-chat already emailed the transcript so far. Only send the rest if the
    // conversation actually carried on, otherwise the same exchange arrives twice.
    if (visitor && users.length <= userTurnsAtCapture) return;
    sessionLogged = true;
    clearIdleTimer();
    const normalized =
      reason === "turn-limit" ? "turn-limit" : reason === "inactive" ? "inactive" : "session-end";
    const payload = JSON.stringify({
      reason: normalized,
      source: "chat",
      question: users[0].content,
      transcript,
      visitor,
      attribution: visitorAttribution(),
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/chat-log", new Blob([payload], { type: "application/json" }));
        return;
      }
    } catch (_) {}
    fetch("/api/chat-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }

  function hitCap() {
    if (capped) return;
    capped = true;
    clearIdleTimer();
    composer.classList.add("is-capped");
    input.disabled = true;
    syncSend();
    addAssistantStatic("That's a decent run. If you want to keep going, book a chat with Rahul.");
    flushSessionLog("turn-limit");
    setChips([{ id: "book", label: "Book a Discovery session" }]);
  }

  function offerBooking() {
    setChips([{ id: "book", label: leadSent ? "Book a Discovery session" : "Book a chat" }]);
  }

  function lockComposer() {
    gateOpen = true;
    composer.classList.add("is-locked");
    input.disabled = true;
    syncSend();
  }

  function unlockComposer() {
    gateOpen = false;
    composer.classList.remove("is-locked");
    if (!capped) {
      input.disabled = false;
      input.focus();
    }
    syncSend();
  }

  function gateDue() {
    return !leadShown && !leadSent && realExchanges >= FREE_EXCHANGES;
  }

  function firstName(name) {
    const first = String(name || "").trim().split(/\s+/)[0] || "";
    return first.slice(0, 40);
  }

  // reason is "gate" when we stopped them to ask, "booking" when they asked for a call. It decides the
  // copy here and the subject line of the email, so Rahul can tell a hand-raise from a curious reader.
  function showLeadForm(reason) {
    if (leadShown || leadSent) return;
    leadShown = true;
    setChips([]);

    const gating = reason === "gate" || reason === "booking-gate";
    const wantsCall = reason === "booking" || reason === "booking-gate";
    if (gating) lockComposer();

    const intro = gating
      ? "Happy to keep going. First though, who am I talking to?"
      : "Leave your details and Rahul will get back to you. No slides, no hype.";
    const note = gating
      ? '<p class="lead-form-note">Rahul reads every one of these himself. Without a name and an email he can&rsquo;t pick up where I leave off.</p>'
      : "";

    const wrap = document.createElement("form");
    wrap.className = "lead-form";
    wrap.innerHTML =
      '<p class="lead-form-intro">' + intro + "</p>" +
      note +
      '<label>Name<input name="name" type="text" autocomplete="name" required></label>' +
      '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
      '<label>Business name <span class="optional">(optional)</span><input name="business" type="text" autocomplete="organization"></label>' +
      '<label class="lead-consent"><input name="consent" type="checkbox" required> I\'m happy for Axhilles to contact me about this chat.</label>' +
      '<button class="lead-submit" type="submit">' + (gating ? "Continue" : "Send") + "</button>" +
      '<p class="lead-error" hidden></p>';
    thread.appendChild(wrap);
    thread.scrollTop = thread.scrollHeight;
    const firstField = wrap.querySelector('input[name="name"]');
    if (firstField) firstField.focus();

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
            reason: wantsCall ? "booking" : "gate",
            openerVariant: openerVariant.id,
            transcript: [{ role: "assistant", content: openerVariant.text }].concat(apiMessages()),
            attribution: visitorAttribution(),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Could not send.");
        }
        leadSent = true;
        visitor = { name, email };
        userTurnsAtCapture = apiMessages().filter((m) => m.role === "user").length;
        const thanks = document.createElement("div");
        thanks.className = "assistant-message";
        if (gating) {
          // The transcript so far went out with the lead. Leave session logging armed so whatever they
          // say next arrives too, otherwise the useful half of the conversation is never seen.
          thanks.innerHTML = renderMarkdown(
            "Thanks " +
              firstName(name) +
              (wantsCall
                ? ". Rahul will sort a time with you. Keep going in the meantime if you like."
                : ". Ask away.")
          );
          wrap.replaceWith(thanks);
          unlockComposer();
          bumpIdle();
        } else {
          sessionLogged = true;
          clearIdleTimer();
          thanks.innerHTML = renderMarkdown("Sweet, Rahul will be in touch, usually within a day.");
          wrap.replaceWith(thanks);
        }
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
    // gateOpen is checked here as well as on the disabled textarea: the lock has to hold in logic, not
    // just in CSS, so nothing that reaches sendPrompt can slip a message past it.
    if (!content || busy || capped || gateOpen) return;
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

    const locked = getLockedReply(content);
    if (locked) {
      messages.push({ role: "assistant", content: locked.reply });
      await typeInto(bubble, locked.reply);
      busy = false;
      syncSend();
      bumpIdle();
      input.focus();
      // offerBook marks the answers that engage with the business question. The Odyssey and Tottenham
      // replies do not, so they never trip the gate.
      if (locked.offerBook) realExchanges += 1;
      if (apiMessages().length >= MAX_MESSAGES) hitCap();
      else if (gateDue()) showLeadForm("gate");
      else if (locked.offerBook) offerBooking();
      return;
    }

    if (isNameXEgg(content)) {
      awaitingTottenhamThanks = false;
      messages.push({ role: "assistant", content: X_EGG });
      await typeInto(bubble, X_EGG);
      busy = false;
      syncSend();
      bumpIdle();
      input.focus();
      if (apiMessages().length >= MAX_MESSAGES) hitCap();
      return;
    }

    awaitingTottenhamThanks = false;

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
      realExchanges += 1;
      const offeredCall = looksLikeBooking(assembled);
      if (apiMessages().length >= MAX_MESSAGES) hitCap();
      else if (gateDue()) showLeadForm(offeredCall ? "booking-gate" : "gate");
      else if (offeredCall && !leadSent) showLeadForm("booking");
      else offerBooking();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      bubble.classList.remove("thinking-text");
      bubble.textContent = msg;
    } finally {
      busy = false;
      syncSend();
      bumpIdle();
      input.focus();
    }
  }

  thread.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (looksLikeBooking(href) || looksLikeBooking(a.textContent)) {
      e.preventDefault();
      // Once we know who they are the form has nothing left to ask, so send them to the calendar.
      if (leadSent) window.open(BOOKING_LINK, "_blank", "noopener");
      else showLeadForm("booking");
    }
  });

  composer.addEventListener("submit", (e) => {
    e.preventDefault();
    sendPrompt(input.value);
  });

  // Someone who closes the tab rather than fill in the gate used to be lost entirely: the idle log only
  // fires after five minutes. pagehide covers tab close and navigation away, so the question still lands.
  window.addEventListener("pagehide", () => flushSessionLog("session-end"));
  document.querySelector('[data-action="home"]').addEventListener("click", () => {
    thread.scrollTop = 0;
    closeSidebar();
  });

  addAssistantStatic(openerVariant.text);
  setChips(openerVariant.chips.map((label) => ({ id: "opener", label })));
  syncSend();

  const contactToggle = document.getElementById("contact-toggle");
  const contactEmail = document.getElementById("contact-email");
  if (contactToggle && contactEmail) {
    contactToggle.addEventListener("click", () => {
      const open = contactEmail.classList.toggle("is-hidden") === false;
      contactToggle.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll("[data-booking]").forEach((link) => {
    link.setAttribute("href", BOOKING_LINK);
  });
})();
