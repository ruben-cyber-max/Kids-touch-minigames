/* Shared helpers: celebration, sounds, drag + tap select (English comments) */

const Common = (() => {
  let audioCtx = null;
  let selectedEl = null;

  function getAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) { /* silent */ }
    }
    return audioCtx;
  }

  function tone(freq, dur, type = "sine", vol = 0.15) {
    const ctx = getAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  function playSuccess() {
    tone(523, 0.12);
    setTimeout(() => tone(659, 0.12), 100);
    setTimeout(() => tone(784, 0.2), 200);
  }

  function playPop() {
    tone(440, 0.08, "triangle", 0.1);
  }

  function playWrong() {
    tone(220, 0.1, "square", 0.06);
    setTimeout(() => tone(180, 0.12, "square", 0.05), 90);
  }

  function playCelebrate() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => tone(n, 0.18, "sine", 0.12), i * 90));
  }

  function spawnConfetti(count = 40) {
    const colors = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#a78bfa", "#60a5fa", "#fb923c", "#6ee7b7"];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "confetti";
      el.style.left = Math.random() * 100 + "vw";
      el.style.top = -10 + Math.random() * 20 + "px";
      el.style.background = colors[i % colors.length];
      el.style.width = 8 + Math.random() * 10 + "px";
      el.style.height = 8 + Math.random() * 10 + "px";
      el.style.animationDuration = 0.8 + Math.random() * 0.8 + "s";
      el.style.animationDelay = Math.random() * 0.3 + "s";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }
  }

  function showCelebrate({ title, message, onAgain, onHome }) {
    playCelebrate();
    spawnConfetti();
    let overlay = document.getElementById("celebrate");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "celebrate";
      overlay.className = "celebrate";
      overlay.innerHTML = `
        <div class="celebrate-card">
          <div class="big-emoji">🎉</div>
          <h2 id="celeb-title"></h2>
          <p id="celeb-msg"></p>
          <button type="button" class="btn-primary" id="celeb-again">עוד פעם!</button>
          <button type="button" class="btn-secondary" id="celeb-home">חזרה לתפריט</button>
        </div>`;
      document.body.appendChild(overlay);
    }
    document.getElementById("celeb-title").textContent = title || "כל הכבוד!";
    document.getElementById("celeb-msg").textContent = message || "עשית מצוין!";
    overlay.classList.add("show");

    const again = document.getElementById("celeb-again");
    const home = document.getElementById("celeb-home");
    again.onclick = () => {
      overlay.classList.remove("show");
      if (onAgain) onAgain();
    };
    home.onclick = () => {
      window.location.href = "../index.html";
      if (onHome) onHome();
    };
  }

  function clearSelection() {
    if (selectedEl) selectedEl.classList.remove("selected");
    selectedEl = null;
  }

  function getSelected() {
    return selectedEl;
  }

  function selectItem(el) {
    clearSelection();
    selectedEl = el;
    el.classList.add("selected");
    playPop();
  }

  function clientXY(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches[0]) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  /** Pointer drag; short press without move = select for tap-to-place */
  function makeDraggable(el, { onStart, onMove, onEnd, onTap }) {
    let active = false;
    let ghost = null;
    let startX = 0, startY = 0;
    let moved = false;

    function start(e) {
      if (el.classList.contains("placed")) return;
      e.preventDefault();
      active = true;
      moved = false;
      const { x, y } = clientXY(e);
      startX = x;
      startY = y;
      if (el.setPointerCapture && e.pointerId != null) {
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
      }
      el.classList.add("dragging");
      ghost = document.createElement("div");
      ghost.className = "ghost";
      ghost.innerHTML = el.innerHTML;
      ghost.style.left = x + "px";
      ghost.style.top = y + "px";
      ghost.style.opacity = "0";
      document.body.appendChild(ghost);
      if (onStart) onStart(el, x, y);
    }

    function move(e) {
      if (!active) return;
      e.preventDefault();
      const { x, y } = clientXY(e);
      const dist = Math.hypot(x - startX, y - startY);
      if (dist > 12) {
        moved = true;
        if (ghost) ghost.style.opacity = "0.9";
      }
      if (ghost) {
        ghost.style.left = x + "px";
        ghost.style.top = y + "px";
      }
      if (moved && onMove) onMove(el, x, y);
    }

    function end(e) {
      if (!active) return;
      active = false;
      el.classList.remove("dragging");
      const { x, y } = clientXY(e);
      if (ghost) { ghost.remove(); ghost = null; }
      if (!moved) {
        if (onTap) onTap(el);
        else selectItem(el);
        return;
      }
      clearSelection();
      if (onEnd) onEnd(el, x, y);
    }

    el.addEventListener("pointerdown", start);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }

  function findDropTarget(x, y, selector) {
    const stack = document.elementsFromPoint(x, y);
    for (const node of stack) {
      if (node.matches && node.matches(selector)) return node;
      const parent = node.closest && node.closest(selector);
      if (parent) return parent;
    }
    return null;
  }

  /** Wire drop zones for tap-to-place after selecting an item */
  function enableTapTargets(selector, tryPlace) {
    document.querySelectorAll(selector).forEach((target) => {
      target.addEventListener("click", (e) => {
        if (!selectedEl || selectedEl.classList.contains("placed")) return;
        e.preventDefault();
        tryPlace(selectedEl, target);
      });
    });
  }

  return {
    playSuccess,
    playPop,
    playWrong,
    playCelebrate,
    spawnConfetti,
    showCelebrate,
    makeDraggable,
    findDropTarget,
    clearSelection,
    getSelected,
    selectItem,
    enableTapTargets,
  };
})();
