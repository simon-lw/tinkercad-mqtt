import browser from 'webextension-polyfill';

import Notify from 'simple-notify';
import 'simple-notify/dist/simple-notify.css';

import mqtt, { IClientOptions, MqttClient } from 'mqtt';
import {
  getTinkerEnvironmentId,
  parseProtocol,
  parseUrl,
} from '../util/TabManagement';
import { MqttSettings } from '../util/MqttSettings';
import { Serial } from './serial';

const tinkerEnvId = getTinkerEnvironmentId(window.location.href);

let mqttOptions: IClientOptions = {
  hostname: undefined,
  port: undefined,
  reconnectPeriod: 5000,
  keepalive: 60,
  clientId: 'tinkerExtension-' + tinkerEnvId,
};

browser.storage.local.get(tinkerEnvId).then((result) => {
  if (result[tinkerEnvId]) {
    const settings: MqttSettings = result[tinkerEnvId];
    processNewClientConnection(settings);
  } else {
    new Notify({
      status: 'info',
      title: 'No MQTT Settings Found',
      text: 'Please configure the MQTT settings to use the extension.',
      effect: 'slide',
      speed: 300,
      autotimeout: 5000,
      type: 'outline',
      position: 'left bottom',
    });
  }
});

let mqttClient: MqttClient | undefined = undefined;
const serial = Serial.Instance;

serial.onSimulationStart(() => {
  if (mqttOptions.hostname != undefined) {
    if (!mqttClient) {
      mqttClient = createClient(mqttOptions);
    } else {
      mqttClient.reconnect(mqttOptions);
    }
  } else {
    new Notify({
      status: 'warning',
      title: 'Missing MQTT Broker URL',
      text: 'Disabling MQTT Connection. Please set the broker URL to use the extension.',
      effect: 'slide',
      speed: 300,
      autotimeout: 5000,
      type: 'outline',
      position: 'left bottom',
    });
  }
});

serial.onSimulationStop(disconnectClient);

// const tinkerEnvId = getTinkerEnvironmentId(window.location.href);
let publishTopic = '';
let subscribeTopic = '';

function createClient(options: IClientOptions): MqttClient | undefined {
  console.log('Creating client with options: ', options);
  let client;
  try {
    client = mqtt.connect(options);
    client.on('error', (error) => {
      console.error('Error connecting to broker: ', error);
      new Notify({
        status: 'error',
        title: 'Mqtt client error',
        text: error.message,
        effect: 'slide',
        speed: 300,
        autotimeout: 5000,
        type: 'outline',
        position: 'left bottom',
      });
    });
    client.on('message', (topic, message) => {
      console.log('Received: ', message.toString(), ' on Topic: ', topic);
      serial.sendToSerial(message.toString());
    });
    client.on('connect', () => {
      new Notify({
        status: 'success',
        title: 'Connection Established',
        text:
          'Connected to MQTT Broker at ' +
          options.protocol +
          '://' +
          options.hostname +
          ':' +
          options.port +
          '.',
        effect: 'slide',
        speed: 300,
        autotimeout: 5000,
        type: 'outline',
        position: 'left bottom',
      });
    });
    client.on('disconnect', () => {
      new Notify({
        status: 'info',
        title: 'Disconnected from Broker',
        effect: 'slide',
        speed: 300,
        autotimeout: 5000,
        type: 'outline',
        position: 'left bottom',
      });
    });

    if (client.stream) {
      client.stream.on('error', (err) => {
        new Notify({
          status: 'error',
          title: 'Error connecting to broker',
          text: err.message + '. Please check the broker URL.',
          effect: 'slide',
          speed: 300,
          autotimeout: 5000,
          type: 'outline',
          position: 'left bottom',
        });
      });
    }

    if (subscribeTopic != '') {
      client.subscribe(subscribeTopic, { qos: 0 });
    }
    return client;
  } catch (error) {
    console.error('Error connecting to broker: ', error);
    new Notify({
      status: 'error',
      title: 'Error connecting to Broker',
      text: error.message,
      effect: 'slide',
      speed: 300,
      autotimeout: 5000,
      type: 'outline',
      position: 'left bottom',
    });
    return undefined;
  }
}

function disconnectClient() {
  if (mqttClient != undefined) {
    const connected = mqttClient.connected;
    mqttClient.end((error) => {
      if (error) {
        console.error('Error while disconnecting from broker: ', error);
        new Notify({
          status: 'error',
          title: 'Error',
          text: error.message,
          effect: 'slide',
          speed: 300,
          autotimeout: 5000,
          type: 'outline',
          position: 'left bottom',
        });
      } else {
        if (connected) {
          new Notify({
            status: 'warning',
            title: 'Disconnected from Broker',
            effect: 'slide',
            speed: 300,
            autotimeout: 5000,
            type: 'outline',
            position: 'left bottom',
          });
        }
      }
    });
  }
}

function processNewClientConnection(mqttSettings: MqttSettings) {
  console.log('Processing new client connection: ', mqttSettings);

  if (!mqttSettings.authenticationEnabled) {
    mqttSettings.options.username = undefined;
    mqttSettings.options.password = undefined;
  }

  publishTopic = mqttSettings.pubTopic;
  subscribeTopic = mqttSettings.subTopic;
  let options = mqttSettings.options;

  if (options.hostname != undefined) {
    const { protocol, domain, port, path } = parseUrl(options.hostname);
    options = {
      ...mqttOptions,
      hostname: domain + (path == '/' ? '' : path),
      port: Number(port),
    };

    const parsedProtocol = parseProtocol(protocol);
    if (parsedProtocol) {
      options.protocol = parsedProtocol;
    }

    mqttOptions = options;

    if (serial.isSimulationActive()) {
      disconnectClient();
      mqttClient = createClient(options);
    }
  } else {
    if (mqttClient != undefined) {
      disconnectClient();
    }

    new Notify({
      status: 'warning',
      title: 'Missing MQTT Broker URL',
      text: 'Disabling MQTT Connection. Please set the broker URL to use the extension.',
      effect: 'slide',
      speed: 300,
      autotimeout: 5000,
      type: 'outline',
      position: 'left bottom',
    });
  }
}

browser.runtime.onMessage.addListener((msg) => {
  processNewClientConnection(msg.tabSettings);
});

serial.addCallback((serial_data) => {
  if (mqttClient) {
    if (mqttClient.connected && publishTopic != '') {
      mqttClient.publish(publishTopic, String(serial_data));
    }
  }
});
