import browser from 'webextension-polyfill';
import mqtt, { MqttClient } from 'mqtt';

export enum BACKGROUND_ACTION {
  MQTT_PUBLISH,
  MQTT_SUBSCRIBE,
}

const brokerUrl = 'ws://localhost';
const options: mqtt.IClientOptions = {
  port: 9001,
  reconnectPeriod: 5000,
  keepalive: 60,
  //clientId: 'tinkerExtension-sub',
};

let client: MqttClient;

browser.runtime.onConnect.addListener((port) => {
  console.log('CONNECTED from: ', port.sender?.tab?.id);
  client = mqtt.connect(brokerUrl, options);
  client.on('error', (error) => {
    console.error('Mqtt client error:', error);
  });

  port.onMessage.addListener((msg) => {
    console.log('Message via port:', msg);
  });

  port.postMessage('Test');
});

browser.runtime.onMessage.addListener((msg) => {
  if (client.connected) {
    if (msg.action == BACKGROUND_ACTION.MQTT_PUBLISH) {
      console.log('PUBLISHING', msg);
      client.publish(msg.topic, String(msg.content));
    } else if (msg.action == BACKGROUND_ACTION.MQTT_SUBSCRIBE) {
      console.log('SUBSCRIBING', msg.content);
      client.subscribe(msg.content, (error) => {
        if (error) console.log('Failed subscribing.');
      });
    }
  } else {
    console.log('Client is not connected yet, skipping message.');
  }
});
