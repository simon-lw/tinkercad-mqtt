export class MqttSettings {
  brokerUrl: string;
  topic: string;
  authenticationEnabled: boolean;
  username: string;
  password: string;

  constructor(
    brokerUrl: string,
    topic: string,
    authenticationEnabled: boolean,
    username: string,
    password: string
  ) {
    this.brokerUrl = brokerUrl;
    this.topic = topic;
    this.authenticationEnabled = authenticationEnabled;
    this.username = username;
    this.password = password;
  }
}
