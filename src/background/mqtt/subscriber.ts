import mqtt, { MqttClient } from 'mqtt';


export function createTopicSubscriber(brokerUrl: string, topic: string): MqttClient {
    const options: mqtt.IClientOptions = {
        port: 9001,
        reconnectPeriod: 5000,
        clientId: 'tinker-sub',
        //clean: true // Clean session
    };

    const client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
        console.log('Connected to MQTT broker at', brokerUrl);
        client.subscribe(topic, (err) => {
            if (err) {
                console.error('Error subscribing to topic:', err);
            } else {
                console.log('Subscribed to topic:', topic);
            }
        });
    });

    client.on('message', (receivedTopic, message) => {
        console.log('Received message on topic:', receivedTopic);
        console.log('Message:', message.toString());
    });

    client.on('error', (error) => {
        console.error('MQTT error:', error);
    });

    return client;
}
