import browser from 'webextension-polyfill';
import { Serial } from './serial';
import mqtt, { IClientOptions, MqttClient } from 'mqtt';
import {
  getTinkerEnvironmentId,
  parseProtocol,
  parseUrl,
} from '../util/TabManagement';
import { MqttSettings } from '../util/MqttSettings';

const tinkerEnvId = getTinkerEnvironmentId(window.location.href);

let mqttOptions: IClientOptions = {
  hostname: '',
  port: 9001,
  reconnectPeriod: 5000,
  keepalive: 60,
  clientId: 'tinkerExtension-' + tinkerEnvId,
};

browser.storage.local.get(tinkerEnvId).then((result) => {
  if (result[tinkerEnvId]) {
    const settings: MqttSettings = result[tinkerEnvId];
    processTabSettings(settings);
  } else {
    console.log('No settings found for tinker environment: ', tinkerEnvId);
  }
});

let mqttClient: MqttClient | undefined = undefined;
const serial = Serial.Instance;

serial.onSimulationStart(() => {
  console.log('Simulation started.');
  if (mqttOptions.hostname != '') {
    if (!mqttClient) {
      mqttClient = createClient(mqttOptions);
    } else {
      mqttClient.reconnect(mqttOptions);
    }
  }
});

serial.onSimulationStop(() => {
  console.log('Simulation stopped.');
  disconnectClient();
});

// const tinkerEnvId = getTinkerEnvironmentId(window.location.href);
let publishTopic = '';
let subscribeTopic = '';

function createClient(options: IClientOptions): MqttClient {
  let client = mqtt.connect(options);
  client.on('error', (error) => {
    console.error('Mqtt client error:', error);
  });
  client.on('message', (topic, message) => {
    console.log('Received: ', message.toString(), ' on Topic: ', topic);
    serial.sendToSerial(message.toString());
  });
  client.on('connect', () => {
    console.log('Connected to mqtt broker.');
  });
  client.on('disconnect', () => {
    console.log('Disconnected from mqtt broker.');
  });

  if (subscribeTopic != '') {
    client.subscribe(subscribeTopic, { qos: 0 });
  }

  return client;
}

function disconnectClient() {
  if (mqttClient) {
    mqttClient.end();
  }
}

function processNewClientConnection(options: IClientOptions) {
  console.log('Processing new client connection with options: ', options);
  if (options.hostname != null) {
    console.log('Options: ', options);
    const { protocol, domain, port, path } = parseUrl(options.hostname);
    options = {
      ...mqttOptions,
      hostname: domain + (path == '/' ? '' : path),
      port: Number(port),
    };

    console.log('Parsed options: ', options);

    const parsedProtocol = parseProtocol(protocol);
    if (parsedProtocol) {
      options.protocol = parsedProtocol;
    }

    mqttOptions = options;

    if (serial.isSimulationActive()) {
      disconnectClient();

      console.log('Connecting with new options: ', options);

      mqttClient = createClient(options);
    }

    console.log('Subscribing to topics: ', subscribeTopic);
  } else {
    if (mqttClient) {
      disconnectClient();
      mqttClient = undefined;
    }
  }
}

function processTabSettings(mqttSettings: MqttSettings) {
  console.log('Mqtt Settings: ', mqttSettings);

  publishTopic = mqttSettings.pubTopic;
  subscribeTopic = mqttSettings.subTopic;
  processNewClientConnection(mqttSettings.options);
}

browser.runtime.onMessage.addListener((msg) => {
  processTabSettings(msg.tabSettings);
});

serial.addCallback((serial_data) => {
  if (mqttClient) {
    if (mqttClient.connected && publishTopic != '') {
      for (let data of serial_data) {
        mqttClient.publish(publishTopic, String(data));
      }
    }
  }
});
