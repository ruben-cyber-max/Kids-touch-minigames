/* Shape sorting puzzle — large colorful SVG shapes (drag or tap) */

const SHAPES = [
  {
    id: "circle",
    label: "עיגול",
    color: "#ff6b6b",
    path: '<circle cx="50" cy="50" r="42" />',
  },
  {
    id: "square",
    label: "ריבוע",
    color: "#4ecdc4",
    path: '<rect x="10" y="10" width="80" height="80" rx="8" />',
  },
  {
    id: "triangle",
    label: "משולש",
    color: "#ffe66d",
    path: '<polygon points="50,8 92,90 8,90" />',
  },
  {
    id: "star",
    label: "כוכב",
    color: "#a78bfa",
    path: '<polygon points="50,5 61,38 96,38 68,60 79,92 50,72 21,92 32,60 4,38 39,38" />',
  },
  {
    id: "heart",
    label: "לב",
    color: "#f9a8d4",
    path: '<path d="M50 88 C20 65 5 45 5 28 C5 14 16 5 28 5 C38 5 46 11 50 18 C54 11 62 5 72 5 C84 5 95 14 95 28 C95 45 80 65 50 88 Z" />',
  },
  {
    id: "diamond",
    label: "מעוין",
    color: "#60a5fa",
    path: '<polygon points="50,5 95,50 50,95 5,50" />',
  },
];

let round = 0;
let placed = 0;
let currentSet = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function svgFor(shape, outline = false) {
  const fill = outline ? "none" : shape.color;
  const stroke = outline ? shape.color : "rgba(0,0,0,0.1)";
  const sw = outline ? 4 : 2;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="${fill}" stroke="${stroke}" stroke-width="${sw}">${shape.path}</g>
  </svg>`;
}

function pickSet() {
  const start = (round * 2) % SHAPES.length;
  const set = [];
  for (let i = 0; i < 4; i++) set.push(SHAPES[(start + i) % SHAPES.length]);
  return set;
}

function tryPlace(el, target) {
  if (!target || target.classList.contains("filled")) return false;
  if (target.dataset.accepts === el.dataset.id) {
    const shape = currentSet.find((c) => c.id === el.dataset.id);
    target.classList.add("filled", "pop");
    target.innerHTML = svgFor(shape, false);
    el.classList.add("placed");
    Common.clearSelection();
    Common.playSuccess();
    placed++;
    if (placed >= currentSet.length) {
      setTimeout(() => {
        Common.showCelebrate({
          title: "יופי של צורות!",
          message: "סידרת את כולן!",
          onAgain: () => { round++; render(); },
        });
      }, 400);
    }
    return true;
  }
  Common.playWrong();
  return false;
}

function render() {
  placed = 0;
  Common.clearSelection();
  currentSet = pickSet();
  const board = document.getElementById("shapes-board");
  const tray = document.getElementById("shapes-tray");
  board.innerHTML = "";
  tray.innerHTML = "";
  board.style.gridTemplateColumns = "1fr 1fr";

  currentSet.forEach((s) => {
    const slot = document.createElement("div");
    slot.className = "shape-slot";
    slot.dataset.accepts = s.id;
    slot.innerHTML = `<div class="shape-outline">${svgFor(s, true)}</div>`;
    slot.setAttribute("aria-label", s.label);
    board.appendChild(slot);
  });

  Common.enableTapTargets(".shape-slot", tryPlace);

  shuffle(currentSet).forEach((s) => {
    const piece = document.createElement("div");
    piece.className = "shape-piece draggable-item";
    piece.style.background = "transparent";
    piece.style.boxShadow = "none";
    piece.dataset.id = s.id;
    piece.setAttribute("aria-label", s.label);
    piece.innerHTML = svgFor(s, false);
    tray.appendChild(piece);

    Common.makeDraggable(piece, {
      onMove(el, x, y) {
        document.querySelectorAll(".shape-slot").forEach((h) => h.classList.remove("highlight"));
        const t = Common.findDropTarget(x, y, ".shape-slot:not(.filled)");
        if (t) t.classList.add("highlight");
      },
      onEnd(el, x, y) {
        document.querySelectorAll(".shape-slot").forEach((h) => h.classList.remove("highlight"));
        const target = Common.findDropTarget(x, y, ".shape-slot:not(.filled)");
        if (target) tryPlace(el, target);
      },
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const inst = document.querySelector(".instructions");
  if (inst) inst.textContent = "גררו או לחצו על צורה, ואז על המקום שלה";
  render();
});
