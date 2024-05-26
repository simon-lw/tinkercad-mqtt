import { IClientOptions } from 'mqtt';

export class MqttSettings {
  options: IClientOptions;
  subTopic: string;
  pubTopic: string;
  authenticationEnabled: boolean;

  constructor(
    options?: IClientOptions,
    subTopic?: string,
    pubTopic?: string,
    authenticationEnabled?: boolean
  ) {
    this.options = options ?? {};
    this.subTopic = subTopic ?? '';
    this.pubTopic = pubTopic ?? '';
    this.authenticationEnabled = authenticationEnabled ?? false;
  }
}
