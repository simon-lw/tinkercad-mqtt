import browser from 'webextension-polyfill';
import mqtt, { MqttClient } from 'mqtt';

const brokerUrl = 'ws://localhost';
const options: mqtt.IClientOptions = {
  port: 9001,
  reconnectPeriod: 5000,
  clientId: 'tinkerExtension-sub',
};

let client: MqttClient;

browser.runtime.onConnect.addListener((port) => {
  console.log('CONNECTED from: ', port.sender?.tab?.id);
  client = mqtt.connect(brokerUrl, options);

  port.onMessage.addListener((msg) => {
    console.log('Message via port:', msg);
  });

  port.postMessage('Test');
});

browser.runtime.onMessage.addListener((msg) => {
  //TODO: Check if client is available
  if (msg.action === 'publishMessage') {
    console.log('PUBLISHING', msg);
    client.publish(msg.topic, msg.content);
  } else if (msg.action === 'subscribeTopic') {
    console.log('SUBSCRIBING to', msg.content);
    //createTopicSubscriber(brokerUrl, subTopic); //TODO: Subscription has to be long lasting, whci his currently not the case
    client.subscribe(msg.content, (error) => {
      if (error) console.log('Failed subscribing.');
    });
  }
});
