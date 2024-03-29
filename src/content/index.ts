import browser from 'webextension-polyfill';
import { Serial } from './serial';
import mqtt from 'mqtt';

export enum BACKGROUND_ACTION {
  MQTT_PUBLISH,
  MQTT_SUBSCRIBE,
}

const serial = Serial.Instance;
const brokerUrl = 'ws://localhost';
const options: mqtt.IClientOptions = {
  port: 9001,
  reconnectPeriod: 5000,
  keepalive: 60,
  //clientId: 'tinkerExtension-sub',
};

const client = mqtt.connect(brokerUrl, options);
client.on('error', (error) => {
  console.error('Mqtt client error:', error);
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

serial.addCallback((serial_data) => {
  if (client.connected) {
    // send each line of serial output to the background script
    for (let data of serial_data) {
      client.publish('tinker', String(data));
    }
  }
});
