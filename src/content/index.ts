import browser from "webextension-polyfill";

browser.storage.local.set({
  [window.location.hostname]: document.title,
}).then(() => {
  browser.runtime.sendMessage(`Saved document title for ${window.location.hostname}`);
});

// Check if the user is on the Tinkercad page
if (window.location.href.includes('tinkercad.com')) {
  // Send a message to the background script to initiate MQTT subscription
  browser.runtime.sendMessage({ action: 'subscribeToMQTT' });
}
