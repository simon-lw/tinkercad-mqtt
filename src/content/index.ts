import browser from 'webextension-polyfill';
import { Serial } from './serial';

const serial = Serial.Instance;
let background_port = browser.runtime.connect({ name: 'mqtt' });
let port_connected = true;

background_port.onDisconnect.addListener(() => {
  port_connected = false;
});

serial.addCallback((serial_data) => {
  if (port_connected) {
    // send each line of serial output to the background script
    for (let data of serial_data) {
      background_port.postMessage(data);
    }
  }
});
