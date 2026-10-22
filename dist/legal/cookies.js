"use strict";

document.querySelector("#clear-preferences")?.addEventListener("click", () => {
  const result = document.querySelector("#storage-result");
  try {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    for (const name of ["nordi_theme", "nordi_notice"]) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
    }
    const remaining = document.cookie.split(";").some((entry) =>
      /^(nordi_theme|nordi_notice)=/.test(entry.trim()),
    );
    result.textContent = remaining
      ? "Браузер не разрешил сброс. Удалите настройки сайта через меню браузера."
      : "Настройки сайта сброшены. При следующем открытии будет выбрана системная тема.";
  } catch {
    result.textContent = "Хранилище недоступно. Настройками можно управлять через меню браузера.";
  }
});
