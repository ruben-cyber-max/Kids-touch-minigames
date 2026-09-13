/* Animals → habitats matching game (drag or tap) */

const LEVELS = [
  {
    habitats: [
      { id: "farm", label: "חווה", emoji: "🏡", animal: "cow" },
      { id: "sea", label: "ים", emoji: "🌊", animal: "fish" },
      { id: "forest", label: "יער", emoji: "🌳", animal: "bear" },
      { id: "sky", label: "שמיים", emoji: "☁️", animal: "bird" },
    ],
    animals: [
      { id: "cow", emoji: "🐄", name: "פרה" },
      { id: "fish", emoji: "🐟", name: "דג" },
      { id: "bear", emoji: "🐻", name: "דוב" },
      { id: "bird", emoji: "🐦", name: "ציפור" },
    ],
  },
  {
    habitats: [
      { id: "desert", label: "מדבר", emoji: "🏜️", animal: "camel" },
      { id: "arctic", label: "קוטב", emoji: "❄️", animal: "penguin" },
      { id: "jungle", label: "ג׳ונגל", emoji: "🌴", animal: "monkey" },
      { id: "pond", label: "אגם", emoji: "🪷", animal: "frog" },
    ],
    animals: [
      { id: "camel", emoji: "🐪", name: "גמל" },
      { id: "penguin", emoji: "🐧", name: "פינגווין" },
      { id: "monkey", emoji: "🐵", name: "קוף" },
      { id: "frog", emoji: "🐸", name: "צפרדע" },
    ],
  },
  {
    habitats: [
      { id: "kennel", label: "מלונה", emoji: "🏠", animal: "dog" },
      { id: "basket", label: "סל", emoji: "🧺", animal: "cat" },
      { id: "hive", label: "כוורת", emoji: "🌼", animal: "bee" },
      { id: "stable", label: "אורווה", emoji: "🪵", animal: "horse" },
    ],
    animals: [
      { id: "dog", emoji: "🐶", name: "כלב" },
      { id: "cat", emoji: "🐱", name: "חתול" },
      { id: "bee", emoji: "🐝", name: "דבורה" },
      { id: "horse", emoji: "🐴", name: "סוס" },
    ],
  },
];

let levelIndex = 0;
let matched = 0;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function tryPlace(el, target) {
  if (!target || target.classList.contains("filled")) return false;
  if (target.dataset.accepts === el.dataset.id) {
    target.classList.add("filled", "pop");
    target.querySelector(".habitat-slot").textContent = el.textContent;
    el.classList.add("placed");
    Common.clearSelection();
    Common.playSuccess();
    matched++;
    const level = LEVELS[levelIndex % LEVELS.length];
    if (matched >= level.animals.length) {
      setTimeout(() => {
        Common.showCelebrate({
          title: "כל הכבוד!",
          message: "החיות במקום הנכון!",
          onAgain: nextLevel,
        });
      }, 400);
    }
    return true;
  }
  Common.playWrong();
  target.classList.add("pop");
  setTimeout(() => target.classList.remove("pop"), 350);
  return false;
}

function renderLevel() {
  matched = 0;
  Common.clearSelection();
  const level = LEVELS[levelIndex % LEVELS.length];
  const habitatsEl = document.getElementById("habitats");
  const tray = document.getElementById("animals-tray");
  habitatsEl.innerHTML = "";
  tray.innerHTML = "";

  level.habitats.forEach((h) => {
    const div = document.createElement("div");
    div.className = "habitat";
    div.dataset.accepts = h.animal;
    div.innerHTML = `
      <span style="font-size:1.75rem">${h.emoji}</span>
      <span class="habitat-label">${h.label}</span>
      <div class="habitat-slot" aria-label="${h.label}"></div>`;
    habitatsEl.appendChild(div);
  });

  Common.enableTapTargets(".habitat", tryPlace);

  shuffle(level.animals).forEach((a) => {
    const item = document.createElement("div");
    item.className = "draggable-item";
    item.dataset.id = a.id;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", a.name);
    item.textContent = a.emoji;
    tray.appendChild(item);
    Common.makeDraggable(item, {
      onMove(el, x, y) {
        document.querySelectorAll(".habitat").forEach((h) => h.classList.remove("highlight"));
        const t = Common.findDropTarget(x, y, ".habitat:not(.filled)");
        if (t) t.classList.add("highlight");
      },
      onEnd(el, x, y) {
        document.querySelectorAll(".habitat").forEach((h) => h.classList.remove("highlight"));
        const target = Common.findDropTarget(x, y, ".habitat:not(.filled)");
        if (target) tryPlace(el, target);
      },
    });
  });
}

function nextLevel() {
  levelIndex++;
  renderLevel();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("instructions") || null;
  const inst = document.querySelector(".instructions");
  if (inst) inst.textContent = "גררו או לחצו על חיה, ואז על הבית שלה";
  renderLevel();
});
