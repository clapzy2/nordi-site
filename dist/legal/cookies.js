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
      : "Готово. При следующем посещении сайт применит тему устройства и снова покажет уведомление о cookie.";
  } catch {
    result.textContent = "Хранилище недоступно. Настройками можно управлять через меню браузера.";
  }
});
