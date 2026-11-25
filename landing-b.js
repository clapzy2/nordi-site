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

(() => {
  const scene = document.querySelector(".hero");
  const canvas = scene?.querySelector(".aurora-canvas");
  const context = canvas?.getContext("2d");
  if (!scene || !canvas || !context) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let frame = 0;
  let visible = true;
  let elapsed = 0;
  let previousTime = null;

  function draw(time) {
    context.clearRect(0, 0, width, height);
    const mobile = width < 600;
    const centerX = mobile ? width * 0.6 : width * 0.75;
    const centerY = mobile ? height * 0.74 : height * 0.48;
    const scale = mobile ? width * 1.35 : width * 0.7;
    context.globalCompositeOperation = "screen";
    for (let ribbon = 0; ribbon < 4; ribbon++) {
      for (let layer = 0; layer < 24; layer++) {
        const depth = layer / 24;
        const alpha = Math.sin(depth * Math.PI) * 0.025;
        context.beginPath();
        for (let step = 0; step <= 100; step++) {
          const u = step / 100;
          const x = centerX + (u - 0.5) * scale;
          const wave =
            Math.sin(u * 5.2 + ribbon * 0.7 + time * 0.1) * 0.14 +
            Math.sin(u * 10 - time * 0.08 + ribbon) * 0.025;
          const y =
            centerY + (wave - 0.28 + ribbon * 0.06 + depth * 0.23) * scale;
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.lineWidth = 2 + depth * 11;
        context.strokeStyle =
          ribbon === 3
            ? "rgba(95,126,234," + alpha + ")"
            : "rgba(77,230,182," + alpha + ")";
        context.stroke();
      }
    }
    for (let star = 0; star < 85; star++) {
      const x = (Math.sin(star * 45.17) + 1) * 0.5 * width;
      const y = (Math.sin(star * 17.61 + 7) + 1) * 0.5 * height;
      context.fillStyle =
        "rgba(188,226,232," +
        (0.13 + 0.12 * Math.sin(star + time * 0.25)) +
        ")";
      context.fillRect(
        x,
        y,
        star % 9 === 0 ? 1.5 : 0.8,
        star % 9 === 0 ? 1.5 : 0.8,
      );
    }
    context.globalCompositeOperation = "source-over";
  }

  function animate(now) {
    if (previousTime !== null) elapsed += Math.min(now - previousTime, 100);
    previousTime = now;
    draw(elapsed / 1000);
    frame = requestAnimationFrame(animate);
  }

  function updateMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = null;
    const paused = document.hidden || !visible || reduced.matches;
    scene.classList.toggle("motion-paused", paused);
    draw(reduced.matches ? 0 : elapsed / 1000);
    if (!paused) frame = requestAnimationFrame(animate);
  }

  function resize() {
    width = scene.clientWidth;
    height = scene.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(reduced.matches ? 0 : elapsed / 1000);
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(scene);
  } else {
    window.addEventListener("resize", resize);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateMotion();
    }).observe(scene);
  }
  document.addEventListener("visibilitychange", updateMotion);
  reduced.addEventListener("change", updateMotion);
  resize();
  updateMotion();
})();

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
