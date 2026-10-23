(() => {
  const cookie = (name) => {
    try {
      const match = document.cookie.match(
        new RegExp(`(?:^|; )${name}=([^;]*)`),
      );
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  };

  const saveCookie = (name, value) => {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    try {
      document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    } catch {
      // Theme selection still works when browser storage is blocked.
    }
  };

  const systemTheme = window.matchMedia?.("(prefers-color-scheme: light)")
    .matches
    ? "light"
    : "dark";
  const savedTheme = cookie("nordi_theme");
  let theme = ["light", "dark"].includes(savedTheme) ? savedTheme : systemTheme;

  const applyTheme = () => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "light" ? "#f7f9fc" : "#0c1320";

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(theme === "light"));
      button.setAttribute(
        "aria-label",
        theme === "light" ? "Включить тёмную тему" : "Включить светлую тему",
      );
    });
  };

  applyTheme();

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        theme = theme === "light" ? "dark" : "light";
        saveCookie("nordi_theme", theme);
        applyTheme();
      });
    });

    const notice = document.querySelector("[data-cookie-note]");
    if (notice && !cookie("nordi_notice")) {
      notice.hidden = false;
      notice
        .querySelector("[data-cookie-dismiss]")
        .addEventListener("click", () => {
          saveCookie("nordi_notice", "seen");
          notice.hidden = true;
        });
    }
  });
})();
