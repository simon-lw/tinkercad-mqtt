import { IClientOptions, ISubscriptionRequest } from 'mqtt';

export class MqttSettings {
  options: IClientOptions;
  subTopics: ISubscriptionRequest[]; //TODO: Reconsider this type. Maybe define shared Type that has only topic and qos? Rn this variable is used as both publish and subscribe list, even though there are different options for pub or sub topic
  pubTopic: string;
  authenticationEnabled: boolean;

  constructor(
    options?: IClientOptions,
    subTopics?: ISubscriptionRequest[],
    pubTopic?: string,
    authenticationEnabled?: boolean
  ) {
    this.options = options ?? {};
    this.subTopics = subTopics ?? [];
    this.pubTopic = pubTopic ?? '';
    this.authenticationEnabled = authenticationEnabled ?? false;
  }
}
