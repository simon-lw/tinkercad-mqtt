import browser from 'webextension-polyfill';
import { publishMessage } from './mqtt/publisher';
import { createTopicSubscriber } from './mqtt/subscriber';

const brokerUrl = 'ws://localhost';
const subTopic = 'tinker';
browser.runtime.onConnect.addListener((port) => {
  console.log('CONNECTED from: ', port.sender?.tab?.id);

  port.onMessage.addListener((msg) => {
    console.log('PUBLISHING: ', msg);
    // publishMessage(brokerUrl, 'test_topic', msg);
  });

  port.postMessage('Test');
});

browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === 'subscribeToMQTT') {
    console.log('SUBSCRIBING');
    createTopicSubscriber(brokerUrl, subTopic); //TODO: Subscription has to be long lasting, whci his currently not the case
    console.log('POST CONNECT');
  }
  if (message.action === 'publishToMQTT') {
    console.log('PUBLISHING');
    publishMessage(brokerUrl, message.topic, message.content);
  }
});
