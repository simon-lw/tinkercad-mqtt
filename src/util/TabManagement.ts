export enum BACKGROUND_ACTION {
  MQTT_PUBLISH,
  MQTT_SUBSCRIBE,
  MQTT_CONFIG_UPDATE,
}

export function getTinkerEnvironmentId(url: string): string {
  if (/https?:\/\/www\.tinkercad\.com\/things\/.*\/editel.*/.test(url)) {
    return url.split('/')[2];
  } else {
    return '';
  }
}
