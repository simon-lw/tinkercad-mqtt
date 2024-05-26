import { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import isEqual from 'lodash.isequal';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { getTinkerEnvironmentId } from '../util/TabManagement';
import BrokerSettings from './BrokerSettings';

import { MqttSettings } from '../util/MqttSettings';

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
          const settings: MqttSettings = result[tinkerId] || new MqttSettings();
          console.log('Settings: ', settings);
          const tabSettings = { ...settings };
          const previousTabSettings = { ...settings };
          setMqttSettings(tabSettings);
          setPreviousTabSettings(previousTabSettings);
          setTabsFetched(true);
        });
      });
  }, []);

  const [tabsFetched, setTabsFetched] = useState(false);
  const [tinkerId, setTinkerId] = useState('');
  const [tabId, setTabId] = useState<number | undefined>(undefined);

  const [mqttSettings, setMqttSettings] = useState(new MqttSettings());
  const [previousMqttSettings, setPreviousTabSettings] = useState(
    new MqttSettings()
  );

  const [changeDetected, setChangeDetected] = useState(false);

  useEffect(() => {
    if (tabsFetched) {
      if (isEqual(mqttSettings, previousMqttSettings)) {
        setChangeDetected(false);
      } else {
        setChangeDetected(true);
      }
    }
  }, [mqttSettings]);

  console.log('TabSettings: ', mqttSettings);

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
                      <Stack spacing={1}>
                        <BrokerSettings
                          mqttSettings={mqttSettings}
                          setMqttSettings={setMqttSettings}
                        />
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={!changeDetected}
                      onClick={() => {
                        browser.storage.local
                          .set({ [tinkerId]: mqttSettings })
                          .then(() => {
                            setPreviousTabSettings({ ...mqttSettings });
                            setChangeDetected(false);

                            if (tabId) {
                              browser.tabs.sendMessage(tabId, {
                                tabId: tabId,
                                tabSettings: mqttSettings,
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
