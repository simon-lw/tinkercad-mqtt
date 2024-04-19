export enum BACKGROUND_ACTION {
  MQTT_PUBLISH,
  MQTT_SUBSCRIBE,
  MQTT_CONFIG_UPDATE,
}

export function getTinkerEnvironmentId() {
  const pathArray = window.location.pathname.split('/');
  return pathArray[2];
}
