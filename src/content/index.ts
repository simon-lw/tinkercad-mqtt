import browser from 'webextension-polyfill';
import { Serial } from './serial';
import mqtt, { IClientOptions, ISubscriptionRequest, MqttClient } from 'mqtt';
import {
  // getTinkerEnvironmentId,
  parseProtocol,
  parseUrl,
} from '../util/TabManagement';
import { MqttSettings } from '../util/MqttSettings';

const serial = Serial.Instance;
const defaultOptions: IClientOptions = {
  hostname: 'localhost',
  port: 9001,
  reconnectPeriod: 5000,
  keepalive: 60,
  clientId: 'tinkerExtension',
};

// const tinkerEnvId = getTinkerEnvironmentId(window.location.href);
let publishTopic = '';
let subscribeTopics: ISubscriptionRequest[] = [];

let mqttClient: MqttClient = createClient(defaultOptions);

function createClient(options: IClientOptions): MqttClient {
  let client = mqtt.connect(options);
  client.on('error', (error) => {
    console.error('Mqtt client error:', error);
  });
  client.on('message', (topic, message) => {
    console.log('Received: ', message.toString(), ' on Topic: ', topic);
    serial.sendToSerial(message.toString());
  });
  return client;
}

function processNewClientConnection(options: IClientOptions) {
  console.log('Processing new client connection with options: ', options);
  if (options.hostname != null) {
    console.log('Options: ', options);
    const { protocol, domain, port, path } = parseUrl(options.hostname);
    options = {
      ...defaultOptions,
      hostname: domain + (path == '/' ? '' : path),
      port: Number(port),
    };

    console.log('Parsed options: ', options);

    const parsedProtocol = parseProtocol(protocol);
    if (parsedProtocol) options.protocol = parsedProtocol;
    mqttClient.end(() => {
      console.log(
        'Closing connection in order to create connection with changed options.'
      );
    });
    console.log('Connecting with new options: ', options);
    mqttClient = createClient(options);
    for (let topicOptions of subscribeTopics) {
      mqttClient.subscribe(topicOptions.topic, { qos: topicOptions.qos });
    }
  }
}

function processTabSettings(mqttSettings: MqttSettings) {
  console.log('Mqtt Settings: ', mqttSettings);

  // What is this?
  publishTopic = mqttSettings.pubTopic;
  subscribeTopics = mqttSettings.subTopics;
  processNewClientConnection(mqttSettings.options);
}

browser.runtime.onMessage.addListener((msg) => {
  processTabSettings(msg.tabSettings);
});

serial.addCallback((serial_data) => {
  if (mqttClient.connected && publishTopic != '') {
    for (let data of serial_data) {
      mqttClient.publish(publishTopic, String(data));
    }
  }
});
