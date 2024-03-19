import browser from "webextension-polyfill";

let serial_output: HTMLDivElement;
let serial_input: HTMLInputElement;
let serial_send: HTMLAnchorElement;

const observer = new MutationObserver(() => {
  let text = serial_output.textContent;

  if (!text) {
    return;
  }

  // split the serial output by new line
  let serial_data = text.split("\r\n");

  //get last element of the array
  let last_serial_data = serial_data[serial_data.length - 2];
  console.log(last_serial_data);
  browser.runtime.sendMessage(last_serial_data); // TODO: decide on a message format
});

let interval = setInterval(() => {
  serial_output = <HTMLDivElement>(
    Array.from(
      document.getElementsByClassName("js-code_panel__serial__text")
    ).find((e) => e instanceof HTMLDivElement)
  );

  serial_input = <HTMLInputElement>(
    Array.from(
      document.getElementsByClassName("js-code_panel__serial__input")
    ).find((e) => e instanceof HTMLInputElement)
  );

  serial_send = <HTMLAnchorElement>(
    Array.from(
      document.getElementsByClassName("js-code_panel__serial__send")
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

// TODO: decide on a message format
browser.runtime.onMessage.addListener((message) => {
  console.log(message);
  if (serial_input && serial_send) {
    serial_input.value = message;
    serial_send.click();
  }
});
