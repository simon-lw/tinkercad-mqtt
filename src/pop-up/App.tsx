import { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import isEqual from 'lodash.isequal';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// import { MqttSettings } from '../util/MqttSettings';
import {
  BACKGROUND_ACTION,
  getTinkerEnvironmentId,
} from '../util/TabManagement';
import BrokerSettings from './BrokerSettings';

import { TabSettings } from '../util/TabSettings';

import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Switch,
  Typography,
} from '@mui/material';

const isDarkMode =
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
  },
});

function App() {
  useEffect(() => {
    browser.tabs
      .query({
        active: true,
        lastFocusedWindow: true,
      })
      .then((tabs) => {
        if (tabs.length === 0) {
          setTabsFetched(true);
          return;
        }

        const tinkerId = getTinkerEnvironmentId(tabs[0].url?.toString() || '');
        setTinkerId(tinkerId);
        setTabId(tabs[0].id);

        browser.storage.local.get(tinkerId).then((result) => {
          const settings: TabSettings = result[tinkerId] || new TabSettings();
          const tabSettings = { ...settings };
          const previousTabSettings = { ...settings };
          setTabSettings(tabSettings);
          setPreviousTabSettings(previousTabSettings);
          setTabsFetched(true);
        });
      });
  }, []);

  const [tabsFetched, setTabsFetched] = useState(false);
  const [tinkerId, setTinkerId] = useState('');
  const [tabId, setTabId] = useState<number | undefined>(undefined);

  const [tabSettings, setTabSettings] = useState(new TabSettings());
  const [previousTabSettings, setPreviousTabSettings] = useState(
    new TabSettings()
  );

  const [changeDetected, setChangeDetected] = useState(false);

  useEffect(() => {
    if (tabsFetched) {
      if (isEqual(tabSettings, previousTabSettings)) {
        setChangeDetected(false);
      } else {
        setChangeDetected(true);
      }
    }
  }, [tabSettings]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Container sx={{ margin: '1em', width: 'max-content' }}>
          <Grid container direction="column" spacing={1}>
            <Grid item xs={2}>
              <Typography variant="h5" align="center">
                Tinkercad MQTT
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <Divider />
            </Grid>
            {tabsFetched ? (
              tinkerId ? (
                <>
                  <Grid item xs={7}>
                    <Box>
                      <Grid container columnSpacing={2} columns={25}>
                        <Grid item xs={12}>
                          <Stack spacing={1}>
                            <Grid container alignItems="center">
                              <Grid item xs={10}>
                                <Typography
                                  variant="h6"
                                  align="center"
                                  sx={
                                    !tabSettings.subscribeEnabled
                                      ? {
                                          color: (theme) =>
                                            theme.palette.text.disabled,
                                        }
                                      : {}
                                  }
                                >
                                  Subscribe
                                </Typography>
                              </Grid>
                              <Grid item xs={2}>
                                <Switch
                                  defaultChecked={tabSettings.subscribeEnabled}
                                  onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    setTabSettings({
                                      ...tabSettings,
                                      subscribeEnabled: event.target.checked,
                                    });
                                  }}
                                />
                              </Grid>
                            </Grid>
                            <BrokerSettings
                              brokerUrl={
                                tabSettings.subscribeBrokerSettings.brokerUrl
                              }
                              topic={tabSettings.subscribeBrokerSettings.topic}
                              username={
                                tabSettings.subscribeBrokerSettings.username
                              }
                              onAuthenticationEnabledChange={(value) => {
                                setTabSettings({
                                  ...tabSettings,
                                  subscribeBrokerSettings: {
                                    ...tabSettings.subscribeBrokerSettings,
                                    authenticationEnabled: value,
                                  },
                                });
                              }}
                              onBrokerUrlChange={(value) => {
                                setTabSettings({
                                  ...tabSettings,
                                  subscribeBrokerSettings: {
                                    ...tabSettings.subscribeBrokerSettings,
                                    brokerUrl: value,
                                  },
                                });
                              }}
                              onTopicChange={(value) => {
                                setTabSettings({
                                  ...tabSettings,
                                  subscribeBrokerSettings: {
                                    ...tabSettings.subscribeBrokerSettings,
                                    topic: value,
                                  },
                                });
                              }}
                              onUsernameChange={(value) => {
                                setTabSettings({
                                  ...tabSettings,
                                  subscribeBrokerSettings: {
                                    ...tabSettings.subscribeBrokerSettings,
                                    username: value,
                                  },
                                });
                              }}
                              authenticationEnabled={false}
                              disabled={!tabSettings.subscribeEnabled}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={1}>
                          <Divider orientation="vertical" variant="middle" />
                        </Grid>
                        <Grid item xs={12}>
                          <Stack spacing={1}>
                            <Grid container alignItems="center">
                              <Grid item xs={10}>
                                <Typography
                                  variant="h6"
                                  align="center"
                                  sx={
                                    !tabSettings.publishEnabled
                                      ? {
                                          color: (theme) =>
                                            theme.palette.text.disabled,
                                        }
                                      : {}
                                  }
                                >
                                  Publish
                                </Typography>
                              </Grid>
                              <Grid item xs={2}>
                                <Switch
                                  defaultChecked={tabSettings.publishEnabled}
                                  onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    setTabSettings({
                                      ...tabSettings,
                                      publishEnabled: event.target.checked,
                                    });
                                  }}
                                />
                              </Grid>
                            </Grid>
                            <BrokerSettings
                              brokerUrl={
                                tabSettings.publishBrokerSettings.brokerUrl
                              }
                              topic={tabSettings.publishBrokerSettings.topic}
                              username={
                                tabSettings.publishBrokerSettings.username
                              }
                              onAuthenticationEnabledChange={(value) => {
                                setTabSettings({
                                  ...tabSettings,
                                  publishBrokerSettings: {
                                    ...tabSettings.publishBrokerSettings,
                                    authenticationEnabled: value,
                                  },
                                });
                              }}
                              onBrokerUrlChange={(value) => {
                                setTabSettings({
                                  ...tabSettings,
                                  publishBrokerSettings: {
                                    ...tabSettings.publishBrokerSettings,
                                    brokerUrl: value,
                                  },
                                });
                              }}
                              onTopicChange={(value) => {
                                setTabSettings({
                                  ...tabSettings,
                                  publishBrokerSettings: {
                                    ...tabSettings.publishBrokerSettings,
                                    topic: value,
                                  },
                                });
                              }}
                              onUsernameChange={(value) => {
                                setTabSettings({
                                  ...tabSettings,
                                  publishBrokerSettings: {
                                    ...tabSettings.publishBrokerSettings,
                                    username: value,
                                  },
                                });
                              }}
                              authenticationEnabled={
                                tabSettings.publishBrokerSettings
                                  .authenticationEnabled
                              }
                              disabled={!tabSettings.publishEnabled}
                            />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={!changeDetected}
                      onClick={() => {
                        browser.storage.local
                          .set({ [tinkerId]: tabSettings })
                          .then(() => {
                            setPreviousTabSettings({ ...tabSettings });
                            setChangeDetected(false);

                            if (tabId) {
                              browser.tabs.sendMessage(tabId, {
                                action: BACKGROUND_ACTION.MQTT_CONFIG_UPDATE,
                                content: tinkerId,
                              });
                            }
                          });
                      }}
                    >
                      Apply
                    </Button>
                  </Grid>
                </>
              ) : (
                <>No Tinkercad environment found. Please open a Tinkercad.</>
              )
            ) : (
              <CircularProgress />
            )}
          </Grid>
        </Container>
      </ThemeProvider>
    </>
  );
}

export default App;
