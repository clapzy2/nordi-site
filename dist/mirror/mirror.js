const checkButton = document.querySelector("#check-button");
const finderTitle = document.querySelector("#finder-title");
const finderKicker = document.querySelector("#finder-kicker");
const status = document.querySelector("#status");
const progress = document.querySelector("#progress");
const manualLink = document.querySelector("#manual-link");
let redirectTimer;

async function loadMirrors() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch("mirrors.json", {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error("Не удалось загрузить список адресов.");
    }

    const data = await response.json();
    return Array.isArray(data.mirrors) ? data.mirrors : [];
  } finally {
    window.clearTimeout(timeout);
  }
}

function checkMirror(mirror) {
  return new Promise((resolve) => {
    const siteUrl = new URL(mirror.url);
    const probeUrl = new URL("nordi-health.svg", siteUrl);
    probeUrl.searchParams.set("check", Date.now().toString());

    const image = new Image();
    const timeout = window.setTimeout(() => finish(false), 4500);
    let finished = false;

    function finish(ok) {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      resolve(ok);
    }

    image.onload = () => finish(image.naturalWidth > 0);
    image.onerror = () => finish(false);
    image.src = probeUrl.href;
  });
}

function validMirror(mirror) {
  try {
    const url = new URL(mirror.url);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

async function findSite() {
  window.clearTimeout(redirectTimer);
  checkButton.disabled = true;
  checkButton.hidden = true;
  manualLink.hidden = true;
  progress.hidden = false;
  finderKicker.textContent = "Проверяем сайт";
  finderTitle.textContent = "Проверка соединения…";
  status.textContent = "Проверяем официальные адреса…";

  try {
    const mirrors = (await loadMirrors()).filter(validMirror);
    if (mirrors.length === 0) {
      finderKicker.textContent = "Пока без перехода";
      finderTitle.textContent = "Адреса готовятся";
      status.textContent =
        "Постоянные адреса ещё не подключены. Пока откройте бот Nordi или напишите в поддержку.";
      return;
    }

    for (const mirror of mirrors) {
      if (await checkMirror(mirror)) {
        const destination = new URL(mirror.url);
        manualLink.href = destination.href;
        manualLink.hidden = false;
        checkButton.hidden = true;
        finderKicker.textContent = "Адрес найден";
        finderTitle.textContent = "Переходим на сайт";
        status.textContent =
          "Откроем официальный сайт Nordi через пару секунд. Если переход не сработает, нажмите кнопку ниже.";
        redirectTimer = window.setTimeout(
          () => window.location.assign(destination.href),
          2000,
        );
        return;
      }
    }

    finderKicker.textContent = "Нет соединения";
    finderTitle.textContent = "Адрес не найден";
    status.textContent =
      "Сейчас ни один адрес не отвечает. Попробуйте позже или напишите в поддержку.";
  } catch {
    finderKicker.textContent = "Ошибка проверки";
    finderTitle.textContent = "Не удалось проверить";
    status.textContent =
      "Не удалось проверить адреса. Попробуйте позже или напишите в поддержку.";
  } finally {
    checkButton.disabled = false;
    checkButton.hidden = !manualLink.hidden;
    progress.hidden = true;
  }
}

checkButton.addEventListener("click", findSite);
window.setTimeout(findSite, 500);
