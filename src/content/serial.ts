export class Serial {
  private static _instance: Serial | undefined;
  private ready = false;
  private observer: MutationObserver;
  private callbacks: ((data: string[]) => void)[];

  private serial_output: HTMLDivElement | undefined;
  private serial_input: HTMLInputElement | undefined;
  private serial_send: HTMLAnchorElement | undefined;
  private serial_clear: HTMLAnchorElement | undefined;
  private serial_graph_toggle: HTMLAnchorElement | undefined;

  private new_serial_output: HTMLDivElement;
  private new_serial_send: HTMLAnchorElement;
  private new_serial_clear: HTMLAnchorElement;
  private new_serial_input: HTMLInputElement;

  private serial_output_content: string;
  private max_length: number;

  private last_element_buffer: string;

  private constructor() {
    this.new_serial_output = this.createSerialOutput();
    this.new_serial_send = this.createSerialSend();
    this.new_serial_clear = this.createSerialClear();
    this.new_serial_input = this.createSerialInput();

    this.callbacks = [];
    this.serial_output_content = '';
    this.max_length = 2500;
    this.last_element_buffer = '';

    this.observer = new MutationObserver(() => {
      let text = this.serial_output?.textContent;

      if (!text) {
        return;
      }

      // append the new text to the serial output content
      this.serial_output_content += text;

      // limit the serial output content to a maximum length
      if (this.serial_output_content.length > this.max_length) {
        this.serial_output_content = this.serial_output_content.slice(
          this.serial_output_content.length - this.max_length
        );
      }

      // update the new serial output with the new content
      this.new_serial_output.textContent = this.serial_output_content;

      // split the serial output by new line and remove empty strings
      let serial_data_split = text.split(/[\r\n]+/g);

      if (serial_data_split.length > 1) {
        serial_data_split[0] = this.last_element_buffer + serial_data_split[0];
      }

      this.last_element_buffer = serial_data_split.pop() || '';

      let serial_data = serial_data_split.filter((s) => s !== '');
      console.log(serial_data);

      for (let callback of this.callbacks) {
        callback(serial_data);
      }
      // console.log(serial_data);

      // temporarily disconnect the observer to update the serial output without triggering the observer
      this.disconnectObserver();

      // clear the serial output in order to prevent duplicate messages
      this.serial_clear?.click();

      // reconnect the observer
      this.connectObserver();
    });

    console.log('Looking for serial console...');

    let interval = setInterval(() => {
      this.serial_output = <HTMLDivElement>(
        Array.from(
          document.getElementsByClassName('js-code_panel__serial__text')
        ).find((e) => e instanceof HTMLDivElement)
      );

      this.serial_input = <HTMLInputElement>(
        Array.from(
          document.getElementsByClassName('js-code_panel__serial__input')
        ).find((e) => e instanceof HTMLInputElement)
      );

      this.serial_send = <HTMLAnchorElement>(
        Array.from(
          document.getElementsByClassName('js-code_panel__serial__send')
        ).find((e) => e instanceof HTMLAnchorElement)
      );

      this.serial_clear = <HTMLAnchorElement>(
        Array.from(
          document.getElementsByClassName('js-code_panel__serial__clear')
        ).find((e) => e instanceof HTMLAnchorElement)
      );

      this.serial_graph_toggle = <HTMLAnchorElement>(
        Array.from(
          document.getElementsByClassName('js-code_panel__serial__toggle_graph')
        ).find((e) => e instanceof HTMLAnchorElement)
      );

      if (
        this.serial_output &&
        this.serial_input &&
        this.serial_send &&
        this.serial_clear &&
        this.serial_graph_toggle
      ) {
        console.log('Found serial output');
        // hide the original serial alements and append the new serial elements to their respective parents
        this.serial_output.style.display = 'none';
        this.serial_output.before(this.new_serial_output);

        this.serial_send.style.display = 'none';
        this.serial_send.before(this.new_serial_send);

        this.serial_clear.style.display = 'none';
        this.serial_clear.before(this.new_serial_clear);

        this.serial_input.style.display = 'none';
        this.serial_input.before(this.new_serial_input);

        // reproduce the behavior of the original serial output when the graph is toggled
        this.serial_graph_toggle.addEventListener('click', () => {
          if (this.serial_graph_toggle?.classList.contains('active')) {
            this.new_serial_output.style.width = '250px';
          } else {
            this.new_serial_output.style.width = '';
          }
        });

        // make sure the serial output is empty
        this.serial_clear.click();

        // observe the serial output for changes
        this.connectObserver();

        this.ready = true;

        // stop the interval
        clearInterval(interval);
      }
    }, 500);
  }

  public static get Instance(): Serial {
    return this._instance || (this._instance = new Serial());
  }

  public get isReady(): boolean {
    return this.ready;
  }

  public addCallback(callback: (data: string[]) => void) {
    this.callbacks.push(callback);
  }

  public removeCallback(callback: (data: string[]) => void) {
    let index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  public sendToSerial(msg: string) {
    if (!this.isReady || !this.serial_input || !this.serial_send) return;
    this.serial_input.value = msg;
    this.serial_send.click();
  }

  public clearSerial() {
    if (!this.isReady || !this.serial_clear) return;
    this.serial_clear.click();
    this.serial_output_content = '';
    this.new_serial_output.textContent = '';
  }

  private createSerialOutput(): HTMLDivElement {
    let new_serial_output = document.createElement('div');
    new_serial_output.classList.add('code_panel__serial__content__text');
    new_serial_output.style.fontSize = '12px';

    return new_serial_output;
  }

  private createSerialSend(): HTMLAnchorElement {
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
      if (this.new_serial_input.value.length > 0) {
        this.sendToSerial(this.new_serial_input.value);
        this.new_serial_input.value = '';
        new_serial_send.classList.add('disabled');
      }
    };

    return new_serial_send;
  }

  private createSerialClear(): HTMLAnchorElement {
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
      this.clearSerial();
    };

    return new_serial_clear;
  }

  private createSerialInput(): HTMLInputElement {
    let new_serial_input = document.createElement('input');
    new_serial_input.classList.add('code_panel__serial__input');
    new_serial_input.type = 'text';
    new_serial_input.placeholder = 'Send data to the device';
    new_serial_input.oninput = () => {
      if (new_serial_input.value.length <= 0) {
        this.new_serial_send.classList.add('disabled');
      } else {
        this.new_serial_send.classList.remove('disabled');
      }
    };

    return new_serial_input;
  }

  private connectObserver() {
    if (!this.serial_output) return;
    this.observer.observe(this.serial_output, {
      childList: true,
    });
  }

  private disconnectObserver() {
    this.observer.disconnect();
  }
}
