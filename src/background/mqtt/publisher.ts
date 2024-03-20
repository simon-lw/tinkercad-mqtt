import mqtt from 'mqtt';

export function publishMessage(brokerUrl: string, topic: string, message: string): void {
    const options: mqtt.IClientOptions = {
        port: 9001,
        reconnectPeriod: 5000,
        clientId: 'tinker-pub'
       // clean: true // Clean session
    };

    const client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
        console.log('Connected to MQTT broker at ', brokerUrl);
        client.publish(topic, message, (err) => {
            if (err) {
                console.error('Error publishing message:', err);
            } else {
                console.log('Message published to topic:', topic);
                client.end();
            }
        });
    });

    client.on('error', (error) => {
        console.error('MQTT error:', error);
    });
}