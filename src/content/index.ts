import browser from "webextension-polyfill";

browser.storage.local.set({
  [window.location.hostname]: document.title,
}).then(() => {
  browser.runtime.sendMessage(`Saved document title for ${window.location.hostname}`);
});