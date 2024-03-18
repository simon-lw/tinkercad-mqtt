import { type ManifestV3Export } from '@crxjs/vite-plugin'

// Since Firefox does not support the full ManifestV3 spec, 
// we need to use different properties for the background script
let background = {
    type: 'module',
    ...process.env.TARGET === 'chrome' && {
        service_worker: 'src/background/index.ts',
    },
    ...process.env.TARGET === 'firefox' && {
        scripts: ['src/background/index.ts'],
    },
}

export const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'Tinkercad MQTT',
  description: 'An extension, which can connect a serial console in Tinkercad to MQTT.',
  version: "1.0.0",
  action: {
    default_popup: 'index.html',
  },
  // @ts-ignore
  background,
  permissions: [
    'activeTab',
    'tabs',
    'storage',
  ],
  content_scripts: [
    {
      js: ['src/content/index.ts'],
      matches: ['https://*/*', 'http://*/*'],
    },
  ],
  host_permissions: ['<all_urls>'],
}