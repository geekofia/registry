// Puts the theme's `light` or `dark` class on <html> before the app starts, so
// a dark theme doesn't flash light first. Load it from <head>, before your
// app's script, with ThemeProvider's key and default if they aren't "theme"
// and "system":
//   <script src="/theme-init.js" data-storage-key="app-theme" data-default-theme="system"></script>
// A file rather than inline, so a Content-Security-Policy of `script-src 'self'`
// allows it; the settings live on the tag, so the file never needs editing.
(function () {
  var settings = (document.currentScript && document.currentScript.dataset) || {};
  var storageKey = settings.storageKey || "theme";
  var defaultTheme = settings.defaultTheme || "system";
  var valid = function (theme) {
    return theme === "light" || theme === "dark" || theme === "system";
  };

  var theme = valid(defaultTheme) ? defaultTheme : "system";
  try {
    var saved = localStorage.getItem(storageKey);
    if (valid(saved)) theme = saved;
  } catch {
    // Storage blocked: the default.
  }
  var dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.add(dark ? "dark" : "light");
})();
