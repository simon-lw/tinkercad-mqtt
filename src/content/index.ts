import browser from 'webextension-polyfill';

let serial_output: HTMLDivElement;
let serial_input: HTMLInputElement;
let serial_send: HTMLAnchorElement;

let mqtt_port = browser.runtime.connect({ name: 'mqtt' });
let port_connected = true;

mqtt_port.onMessage.addListener((msg) => {
  console.log('Received message from background', msg);
  if (serial_input && serial_send) {
    serial_input.value = msg;
    serial_send.click();
  }
});

mqtt_port.onDisconnect.addListener(() => {
  port_connected = false;
});

const observer = new MutationObserver(() => {
  let text = serial_output.textContent;

  if (!text) {
    return;
  }

  // split the serial output by new line
  let serial_data = text.split('\r\n');

  //get second to last element of the array (last element is always an empty string)
  let last_serial_data = serial_data[serial_data.length - 2];

  console.log(last_serial_data);
  if (port_connected) {
    mqtt_port.postMessage(last_serial_data); // TODO: decide on a message format
  }
});

let interval = setInterval(() => {
  serial_output = <HTMLDivElement>(
    Array.from(
      document.getElementsByClassName('js-code_panel__serial__text')
    ).find((e) => e instanceof HTMLDivElement)
  );

  serial_input = <HTMLInputElement>(
    Array.from(
      document.getElementsByClassName('js-code_panel__serial__input')
    ).find((e) => e instanceof HTMLInputElement)
  );

  serial_send = <HTMLAnchorElement>(
    Array.from(
      document.getElementsByClassName('js-code_panel__serial__send')
    ).find((e) => e instanceof HTMLAnchorElement)
  );

  if (serial_output && serial_input && serial_send) {
    observer.observe(serial_output, {
      childList: true,
    });

    stopInterval();
  }
}, 500);

function stopInterval() {
  clearInterval(interval);
}
