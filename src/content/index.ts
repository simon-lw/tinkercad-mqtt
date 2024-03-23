import browser from 'webextension-polyfill';

let serial_output: HTMLDivElement;
let serial_input: HTMLInputElement;
let serial_send: HTMLAnchorElement;
let serial_clear: HTMLAnchorElement;
let serial_graph_toggle: HTMLAnchorElement;

// recreate the serial output element to redirect the output
let new_serial_output = createNewSerialOutput();
let new_serial_send = createNewSerialSend();
let new_serial_clear = createNewSerialClear();
let new_serial_input = createNewSerialInput();

let serial_output_content = '';
let serial_output_content_max_length = 2500;

let background_port = browser.runtime.connect({ name: 'mqtt' });
let port_connected = true;

const observer = new MutationObserver(() => {
  let text = serial_output.textContent;

  if (!text) {
    return;
  }

  // append the new text to the serial output content
  serial_output_content += text;

  // limit the serial output content to a maximum length
  if (serial_output_content.length > serial_output_content_max_length) {
    serial_output_content = serial_output_content.slice(
      serial_output_content.length - serial_output_content_max_length
    );
  }

  // update the new serial output with the new content
  new_serial_output.textContent = serial_output_content;

  // split the serial output by new line and remove empty strings
  let serial_data = text.split(/[\r\n]+/g).filter((s) => s !== '');

  console.log(serial_data);

  if (port_connected) {
    // send each line of serial output to the background script
    for (let data of serial_data) {
      background_port.postMessage(data);
    }
  }

  // temporarily disconnect the observer to update the serial output without triggering the observer
  disconnectObserver();

  // clear the serial output in order to prevent duplicate messages
  serial_clear.click();

  // reconnect the observer
  connectObserver();
});

function connectObserver() {
  observer.observe(serial_output, {
    childList: true,
  });
}

function disconnectObserver() {
  observer.disconnect();
}

background_port.onMessage.addListener((msg) => {
  console.log('Received message from background', msg);
  if (serial_input && serial_send) {
    disconnectObserver();

    sendToSerial(msg);

    connectObserver();
  }
});

background_port.onDisconnect.addListener(() => {
  port_connected = false;
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

  serial_clear = <HTMLAnchorElement>(
    Array.from(
      document.getElementsByClassName('js-code_panel__serial__clear')
    ).find((e) => e instanceof HTMLAnchorElement)
  );

  serial_graph_toggle = <HTMLAnchorElement>(
    Array.from(
      document.getElementsByClassName('js-code_panel__serial__toggle_graph')
    ).find((e) => e instanceof HTMLAnchorElement)
  );

  if (
    serial_output &&
    serial_input &&
    serial_send &&
    serial_clear &&
    serial_graph_toggle
  ) {
    console.log('Found serial output');
    // hide the original serial alements and append the new serial elements to their respective parents
    serial_output.style.display = 'none';
    serial_output.before(new_serial_output);

    serial_send.style.display = 'none';
    serial_send.before(new_serial_send);

    serial_clear.style.display = 'none';
    serial_clear.before(new_serial_clear);

    serial_input.style.display = 'none';
    serial_input.before(new_serial_input);

    serial_graph_toggle.addEventListener('click', toggleGraph);

    // make sure the serial output is empty
    serial_clear.click();

    // observe the serial output for changes
    connectObserver();

    clearInterval(interval);
  }
}, 500);

function createNewSerialOutput(): HTMLDivElement {
  let new_serial_output = document.createElement('div');
  new_serial_output.classList.add('code_panel__serial__content__text');
  new_serial_output.style.fontSize = '12px';

  return new_serial_output;
}

function createNewSerialSend(): HTMLAnchorElement {
  let new_serial_send_div = document.createElement('div');
  new_serial_send_div.classList.add('circ_btn__txt');
  new_serial_send_div.textContent = 'Send';

  let new_serial_send = document.createElement('a');
  new_serial_send.appendChild(new_serial_send_div);
  new_serial_send.classList.add(
    'circ_btn',
    'circ_btn--m',
    'circ_btn--none_accent_accent',
    'code_panel__serial__button',
    'disabled'
  );
  new_serial_send.onclick = () => {
    if (new_serial_input.value.length > 0) {
      sendToSerial(new_serial_input.value);
      new_serial_input.value = '';
      new_serial_send.classList.add('disabled');
    }
  };

  return new_serial_send;
}

function createNewSerialClear(): HTMLAnchorElement {
  let new_serial_clear_div = document.createElement('div');
  new_serial_clear_div.classList.add('circ_btn__txt');
  new_serial_clear_div.textContent = 'Clear';

  let new_serial_clear = document.createElement('a');
  new_serial_clear.appendChild(new_serial_clear_div);
  new_serial_clear.classList.add(
    'circ_btn',
    'circ_btn--m',
    'circ_btn--none_accent_accent',
    'code_panel__serial__button'
  );
  new_serial_clear.onclick = () => {
    serial_clear.click();
    serial_output_content = '';
    new_serial_output.textContent = '';
  };

  return new_serial_clear;
}

function createNewSerialInput(): HTMLInputElement {
  let new_serial_input = document.createElement('input');
  new_serial_input.classList.add('code_panel__serial__input');
  new_serial_input.type = 'text';
  new_serial_input.placeholder = 'Send data to the device';
  new_serial_input.oninput = () => {
    if (new_serial_input.value.length <= 0) {
      new_serial_send.classList.add('disabled');
    } else {
      new_serial_send.classList.remove('disabled');
    }
  };

  return new_serial_input;
}

function sendToSerial(msg: string) {
  serial_input.value = msg;
  serial_send.click();
}

// reproduce the behavior of the original serial output when the graph is toggled
function toggleGraph() {
  if (serial_graph_toggle.classList.contains('active')) {
    new_serial_output.style.width = '250px';
  } else {
    new_serial_output.style.width = '';
  }
}
