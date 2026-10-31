// Puts the theme's `light` or `dark` class on <html> before the app starts, so
// a dark theme doesn't flash light first. Load it from <head>, before your
// app's script: <script src="/theme-init.js"></script>. A file rather than
// inline, so a Content-Security-Policy of `script-src 'self'` allows it.
// Keep STORAGE_KEY and DEFAULT_THEME the same as ThemeProvider's.
(function () {
  var STORAGE_KEY = "theme";
  var DEFAULT_THEME = "system";

  var theme = DEFAULT_THEME;
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") theme = saved;
  } catch {
    // Storage blocked: the default.
  }
  var dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.add(dark ? "dark" : "light");
})();
