// Reveal each content section once. All content remains visible without JS.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const sections = document.querySelectorAll(".dark .section");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.06 },
  );
  for (const section of sections) {
    section.classList.add("reveal-section");
    observer.observe(section);
  }
  document.documentElement.classList.add("motion-ready");
}

// Ambient movement stays inside the illustration and sleeps off screen.
const scene = document.querySelector(".connection-scene");
const motionToggle = document.querySelector(".motion-toggle");
let userPaused = false;
let sceneVisible = true;

function updateSceneMotion() {
  if (!scene) return;
  scene.classList.toggle(
    "motion-paused",
    userPaused || !sceneVisible || document.hidden || reducedMotion.matches,
  );
}

if (scene && motionToggle) {
  motionToggle.addEventListener("click", () => {
    userPaused = !userPaused;
    motionToggle.setAttribute("aria-pressed", String(userPaused));
    motionToggle.textContent = userPaused
      ? "▷ Продолжить анимацию"
      : "Ⅱ Пауза анимации";
    updateSceneMotion();
  });
  document.addEventListener("visibilitychange", updateSceneMotion);
  reducedMotion.addEventListener("change", updateSceneMotion);
  if ("IntersectionObserver" in window) {
    const sceneObserver = new IntersectionObserver(([entry]) => {
      sceneVisible = entry.isIntersecting;
      updateSceneMotion();
    });
    sceneObserver.observe(scene);
  }
  updateSceneMotion();
}

// Prices are totals for the chosen term, never rounded monthly estimates.
const prices = {
  basic: { 1: 179, 3: 499, 6: 949 },
  extended: { 1: 399, 3: 1139, 6: 2159 },
};
const termLabels = { 1: "за 1 месяц", 3: "за 3 месяца", 6: "за 6 месяцев" };
const rubles = new Intl.NumberFormat("ru-RU");
const termButtons = document.querySelectorAll("[data-term]");

for (const button of termButtons) {
  button.addEventListener("click", () => {
    const term = button.dataset.term;
    for (const item of termButtons) {
      item.setAttribute("aria-pressed", String(item === button));
    }
    for (const card of document.querySelectorAll("[data-plan]")) {
      card.querySelector(".price-value").textContent = rubles.format(
        prices[card.dataset.plan][term],
      );
      card.querySelector(".price-period").textContent = termLabels[term];
      if (!reducedMotion.matches) {
        card.querySelector(".plan-cost").animate(
          [
            { opacity: 0.4, transform: "translateY(5px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 250, easing: "ease-out" },
        );
      }
    }
  });
}

const devices = {
  ios: "iPhone / iPad",
  android: "Android",
  windows: "Windows",
  macos: "macOS",
};
const deviceButtons = document.querySelectorAll("[data-os]");
for (const button of deviceButtons) {
  button.addEventListener("click", () => {
    const device = devices[button.dataset.os];
    for (const item of deviceButtons) {
      item.setAttribute("aria-pressed", String(item === button));
    }
    document.querySelector(".os-label").textContent = device;
    document.querySelector(".os-instruction").textContent =
      `Выберите ${device}. Установите VPN-приложение по инструкции из кабинета.`;
  });
}

// Pointer depth is decorative; touch scrolling and keyboard focus stay native.
if (scene && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  scene.addEventListener("pointermove", (event) => {
    if (userPaused || reducedMotion.matches) return;
    const bounds = scene.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
    scene.style.setProperty("--scene-x", `${x}px`);
    scene.style.setProperty("--scene-y", `${y}px`);
  });
  scene.addEventListener("pointerleave", () => {
    scene.style.setProperty("--scene-x", "0px");
    scene.style.setProperty("--scene-y", "0px");
  });
}
