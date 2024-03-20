import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from './package.json';
const { version } = packageJson;

// @ts-ignore - Since the type definitions of crxjs are not accessible we need to ignore the error
export default defineManifest(async () => {
  // Convert from Semver (example: 0.1.0-beta6)
  const [major, minor, patch, label = '0'] = version
    // can only contain digits, dots, or dash
    .replace(/[^\d.-]+/g, '')
    // split into version parts
    .split(/[.-]/);

  // Since Firefox does not support the full ManifestV3 spec,
  // we need to use different properties for the background script
  let background = {
    type: 'module',
    ...(process.env.TARGET === 'chrome' && {
      service_worker: 'src/background/index.ts',
    }),
    ...(process.env.TARGET === 'firefox' && {
      scripts: ['src/background/index.ts'],
    }),
  };

  return {
    manifest_version: 3,
    name: 'Tinkercad MQTT',
    version: `${major}.${minor}.${patch}`,
    description:
      'An extension, which can connect a serial console in Tinkercad to MQTT.',
    action: {
      default_popup: 'index.html',
    },
    background,
    permissions: ['activeTab', 'tabs', 'storage'],
    content_scripts: [
      {
        js: ['src/content/index.ts'],
        matches: [
          'https://www.tinkercad.com/things/*',
          'http://www.tinkercad.com/things/*',
        ],
      },
    ],
  };
});
