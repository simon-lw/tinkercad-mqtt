export class TabSettings {
  subscribeEnabled: boolean;
  publishEnabled: boolean;
  subscribeBrokerSettings: MqttSettings;
  publishBrokerSettings: MqttSettings;

  constructor(
    subscriptionEnabled?: boolean,
    publishEnabled?: boolean,
    subscribeBrokerSettings?: MqttSettings,
    publishBrokerSettings?: MqttSettings
  ) {
    this.subscribeEnabled = subscriptionEnabled ?? false;
    this.publishEnabled = publishEnabled ?? false;
    this.subscribeBrokerSettings =
      subscribeBrokerSettings ?? new MqttSettings();
    this.publishBrokerSettings = publishBrokerSettings ?? new MqttSettings();
  }
}

export class MqttSettings {
  brokerUrl: string;
  topic: string;
  authenticationEnabled: boolean;
  username: string;

  constructor(
    brokerUrl?: string,
    topic?: string,
    authenticationEnabled?: boolean,
    username?: string
  ) {
    this.brokerUrl = brokerUrl ?? '';
    this.topic = topic ?? '';
    this.authenticationEnabled = authenticationEnabled ?? false;
    this.username = username ?? '';
  }
}
