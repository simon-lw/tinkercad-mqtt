import { IClientOptions, ISubscriptionRequest } from 'mqtt';

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

class MqttSettings {
  options: IClientOptions;
  topics: ISubscriptionRequest[]; //TODO: Reconsider this type. Maybe define shared Type that has only topic and qos? Rn this variable is used as both publish and subscribe list, even though there are different options for pub or sub topic
  authenticationEnabled: boolean;

  constructor(
    options?: IClientOptions,
    topics?: ISubscriptionRequest[],
    authenticationEnabled?: boolean
  ) {
    this.options = options ?? {};
    this.topics = topics ?? [];
    this.authenticationEnabled = authenticationEnabled ?? false;
  }
}
