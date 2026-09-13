/* Finger paint with colors, brush sizes, stamps, clear */

const COLORS = [
  "#ff6b6b", "#fb923c", "#ffe66d", "#6ee7b7",
  "#4ecdc4", "#60a5fa", "#a78bfa", "#f9a8d4",
  "#2d3436", "#ffffff",
];

const STAMPS = ["⭐", "❤️", "🌸", "🦋", "☀️", "🌈", "🎈", "🐱"];

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("paintCanvas");
  const wrap = document.getElementById("canvas-wrap");
  const ctx = canvas.getContext("2d");

  let color = COLORS[0];
  let brush = 12;
  let drawing = false;
  let lastX = 0, lastY = 0;
  let stampMode = null;

  function resize() {
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    // preserve drawing
    const prev = document.createElement("canvas");
    prev.width = canvas.width;
    prev.height = canvas.height;
    prev.getContext("2d").drawImage(canvas, 0, 0);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    if (prev.width) ctx.drawImage(prev, 0, 0, w, h);
  }

  function clearCanvas() {
    const rect = wrap.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    Common.playPop();
  }

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches[0]) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e) {
    e.preventDefault();
    const p = pos(e);
    if (stampMode) {
      ctx.font = `${brush * 3}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stampMode, p.x, p.y);
      Common.playPop();
      return;
    }
    drawing = true;
    lastX = p.x;
    lastY = p.y;
    ctx.beginPath();
    ctx.arc(p.x, p.y, brush / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function moveDraw(e) {
    if (!drawing || stampMode) return;
    e.preventDefault();
    const p = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = brush;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
  }

  function endDraw() {
    drawing = false;
  }

  // colors
  const colorRow = document.getElementById("colors");
  COLORS.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "color-swatch" + (i === 0 ? " active" : "");
    btn.style.background = c;
    if (c === "#ffffff") btn.style.border = "2px solid #ddd";
    btn.setAttribute("aria-label", "צבע");
    btn.addEventListener("click", () => {
      color = c;
      stampMode = null;
      document.querySelectorAll(".color-swatch").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".stamp-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Common.playPop();
    });
    colorRow.appendChild(btn);
  });

  // brushes
  document.querySelectorAll(".brush-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      brush = Number(btn.dataset.size);
      stampMode = null;
      document.querySelectorAll(".brush-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".stamp-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Common.playPop();
    });
  });

  // stamps
  const stampsRow = document.getElementById("stamps");
  STAMPS.forEach((s) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "stamp-btn";
    btn.textContent = s;
    btn.addEventListener("click", () => {
      stampMode = stampMode === s ? null : s;
      document.querySelectorAll(".stamp-btn").forEach((b) => b.classList.remove("active"));
      if (stampMode) btn.classList.add("active");
      Common.playPop();
    });
    stampsRow.appendChild(btn);
  });

  document.getElementById("btn-clear").addEventListener("click", clearCanvas);
  document.getElementById("btn-done").addEventListener("click", () => {
    Common.showCelebrate({
      title: "ציור יפה!",
      message: "כל הכבוד על היצירה!",
      onAgain: () => {},
    });
  });

  canvas.addEventListener("pointerdown", startDraw);
  canvas.addEventListener("pointermove", moveDraw);
  canvas.addEventListener("pointerup", endDraw);
  canvas.addEventListener("pointerleave", endDraw);
  canvas.addEventListener("pointercancel", endDraw);
  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", moveDraw, { passive: false });
  canvas.addEventListener("touchend", endDraw);

  resize();
  window.addEventListener("resize", resize);
  // fill white initially after layout
  setTimeout(resize, 50);
});
