import { MqttProtocol } from 'mqtt';
import URLParse from 'url-parse';

export function getTinkerEnvironmentId(url: string): string {
  if (/https?:\/\/www\.tinkercad\.com\/things\/.*\/editel.*/.test(url)) {
    return url.split('/')[4];
  } else {
    return '';
  }
}

export function parseUrl(url: string): {
  protocol: string;
  domain: string;
  port: string;
  path: string;
} {
  const parsedUrl = new URLParse(url);
  console.log(parsedUrl);
  let result = {
    protocol: parsedUrl.protocol.replace(':', ''),
    domain: parsedUrl.hostname,
    port: parsedUrl.port || '',
    path: parsedUrl.pathname || '/',
  };
  console.log('Parsed URL: ', result);
  return result;
}

export function parseProtocol(protocol: string): MqttProtocol | null {
  const allowedProtocols: MqttProtocol[] = [
    'wss',
    'ws',
    'mqtt',
    'mqtts',
    'tcp',
    'ssl',
    'wx',
    'wxs',
    'ali',
    'alis',
  ];
  if (allowedProtocols.includes(protocol as MqttProtocol)) {
    return protocol as MqttProtocol;
  } else {
    return null; // if protocol is invalid
  }
}
