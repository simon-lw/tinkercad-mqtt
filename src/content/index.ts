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

let subscriberClient: MqttClient = createClient(defaultOptions);
let publisherClient: MqttClient = subscriberClient;

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

function parseClientOptions(options: IClientOptions): IClientOptions {
  if (options.hostname != null) {
    const { protocol, domain, port, path } = parseUrl(options.hostname);
    options = {
      ...defaultOptions,
      hostname: domain + (path == '/' ? '' : path),
      port: Number(port),
    };
    const parsedProtocol = parseProtocol(protocol);
    if (parsedProtocol) options.protocol = parsedProtocol;
  }
  return options;
}

function processTabSettings(tabSettings: TabSettings) {
  publishEnabled = tabSettings.publishEnabled;
  subscribeEnabled = tabSettings.subscribeEnabled;
  const publisherSettings = tabSettings.publishBrokerSettings;
  const subscriberSettings = tabSettings.subscribeBrokerSettings;

  publishTopics = publisherSettings.topics.map((element) => element.topic);
  subscribeTopics = subscriberSettings.topics;

  let newOptions: IClientOptions[] = [
    parseClientOptions(subscriberSettings.options),
  ];
  if (publisherSettings.options !== subscriberSettings.options) {
    newOptions.push(parseClientOptions(publisherSettings.options));
  }
  refreshMqttClients(newOptions);
}

function refreshMqttClients(clientOptions: IClientOptions[]) {
  subscriberClient.end(() => {
    console.log(
      'Closing connection in order to create connection with changed options.'
    );
  });
  console.log('Connecting with new options: ', clientOptions[0]);
  subscriberClient = createClient(clientOptions[0]);
  for (let topicOptions of subscribeTopics) {
    subscriberClient.subscribe(topicOptions.topic, { qos: topicOptions.qos });
  }
  if (clientOptions.length == 1) {
    publisherClient = subscriberClient;
  } else {
    if (publisherClient.connected)
      publisherClient.end(() => {
        console.log(
          'Closing Publisher connection in order to create connection with changed options.'
        );
      });
    publisherClient = createClient(clientOptions[1]);
  }
}

browser.runtime.onMessage.addListener((msg) => {
  if (subscriberClient.connected || publisherClient.connected) {
    processTabSettings(msg.tabSettings);
  } else {
    console.log('Client is not connected yet, skipping message.');
  }
});

serial.addCallback((serial_data) => {
  if (publisherClient.connected && publishEnabled) {
    for (let topic of publishTopics) {
      for (let data of serial_data) {
        publisherClient.publish(topic, String(data));
      }
    }
  }
});
