import browser from 'webextension-polyfill';
import { Serial } from './serial';
import mqtt, { IClientOptions, ISubscriptionRequest, MqttClient } from 'mqtt';
import {
  getTinkerEnvironmentId,
  parseProtocol,
  parseUrl,
} from '../util/TabManagement';
import { TabSettings } from '../util/TabSettings';

const serial = Serial.Instance;
const defaultOptions: IClientOptions = {
  hostname: 'localhost',
  port: 9001,
  reconnectPeriod: 5000,
  keepalive: 60,
  clientId: 'tinkerExtension',
};

const tinkerEnvId = getTinkerEnvironmentId(window.location.href);
let publishEnabled = false;
let subscribeEnabled = true;
let publishTopics = [tinkerEnvId];
let subscribeTopics: ISubscriptionRequest[] = [];

let mqttClient: MqttClient = createClient(defaultOptions);

function createClient(options: IClientOptions): MqttClient {
  let client = mqtt.connect(options);
  client.on('error', (error) => {
    console.error('Mqtt client error:', error);
  });
  client.on('message', (topic, message) => {
    if (subscribeEnabled)
      console.log('Received: ', message.toString(), ' on Topic: ', topic);
  });
  return client;
}

function processNewClientConnection(options: IClientOptions) {
  if (options.hostname != null) {
    const { protocol, domain, port, path } = parseUrl(options.hostname);
    options = {
      ...defaultOptions,
      hostname: domain + (path == '/' ? '' : path),
      port: Number(port),
    };
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

function processTabSettings(tabSettings: TabSettings) {
  publishEnabled = tabSettings.publishEnabled;
  subscribeEnabled = tabSettings.subscribeEnabled;
  const publisherSettings = tabSettings.publishBrokerSettings;
  const subscriberSettings = tabSettings.subscribeBrokerSettings;

  if (
    publisherSettings.options.hostname === subscriberSettings.options.hostname
  ) {
    publishTopics = publisherSettings.topics.map((element) => element.topic);
    subscribeTopics = subscriberSettings.topics;
    processNewClientConnection(subscriberSettings.options);
  }
}

browser.runtime.onMessage.addListener((msg) => {
  if (mqttClient.connected) {
    processTabSettings(msg.tabSettings);
    //TODO: If multiple Brokers should be possible, then multiple client instances are needed.
  } else {
    console.log('Client is not connected yet, skipping message.');
  }
});

serial.addCallback((serial_data) => {
  if (mqttClient.connected && publishEnabled) {
    for (let topic of publishTopics) {
      for (let data of serial_data) {
        mqttClient.publish(topic, String(data));
      }
    }
  }
});
