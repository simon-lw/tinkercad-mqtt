import { ChangeEvent, useState } from 'react';
import browser from 'webextension-polyfill';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { BACKGROUND_ACTION } from '../content';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Divider,
  Grid,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import BrokerSettings from './BrokerSettings';

const isDarkMode =
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
  },
});

function App() {
  const [topicValue, setTopicValue] = useState('');

  const [subscribeEnabled, setSubscribeEnabled] = useState(false);
  const [publishEnabled, setPublishEnabled] = useState(false);

  const handleTextFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTopicValue(event.target.value);
  };

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
            <Grid item xs={9}>
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
                              !subscribeEnabled
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
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              setSubscribeEnabled(event.target.checked);
                            }}
                          />
                        </Grid>
                      </Grid>
                      <BrokerSettings
                        authenticationEnabled={false}
                        disabled={!subscribeEnabled}
                      />
                      <TextField
                        fullWidth
                        label="Topic"
                        variant="outlined"
                        onChange={handleTextFieldChange}
                        size="small"
                        disabled={!subscribeEnabled}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          browser.tabs
                            .query({ active: true, currentWindow: true })
                            .then((tabs) => {
                              console.log(tabs);
                              let tab = tabs[0];
                              let tabId = tab.id;
                              console.log(tabId);
                              if (tabId) {
                                browser.tabs.sendMessage(tabId, {
                                  action: BACKGROUND_ACTION.MQTT_SUBSCRIBE,
                                  content: topicValue,
                                });
                              }
                            });
                        }}
                      >
                        Apply
                      </Button>
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
                              !publishEnabled
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
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              setPublishEnabled(event.target.checked);
                            }}
                          />
                        </Grid>
                      </Grid>
                      <BrokerSettings
                        authenticationEnabled={false}
                        disabled={!publishEnabled}
                      />
                      <TextField
                        fullWidth
                        label="Topic"
                        variant="outlined"
                        onChange={handleTextFieldChange}
                        size="small"
                        disabled={!publishEnabled}
                      />
                      <Button
                        sx={{
                          whiteSpace: 'nowrap',
                          minWidth: 'max-content',
                        }}
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          browser.runtime.sendMessage({
                            action: BACKGROUND_ACTION.MQTT_PUBLISH,
                            topic: topicValue,
                            content: 'count',
                          });
                        }}
                      >
                        Apply
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </>
  );
}

export default App;
