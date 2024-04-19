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
  Typography,
} from '@mui/material';
import MqttConfigurator from './MqttConfigurator';

const isDarkMode =
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
  },
});

function App() {
  const [count, setCount] = useState(0);
  const [topicValue, setTopicValue] = useState('');

  const handleTextFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTopicValue(event.target.value);
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Container sx={{ margin: '1em', width: '600px', height: '430px' }}>
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
                    <Stack>
                      <MqttConfigurator authenticationEnabled={false} />
                      <TextField
                        fullWidth
                        label="Topic"
                        variant="outlined"
                        onChange={handleTextFieldChange}
                        size="small"
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
                        Subscribe
                      </Button>
                    </Stack>
                  </Grid>
                  <Grid item xs={1}>
                    <Divider orientation="vertical" variant="middle" />
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Grid container direction="column" spacing={1}>
                        <Grid item>
                          <TextField
                            fullWidth
                            label="Broker URL"
                            placeholder="ws://localhost:9001"
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item>
                          <TextField
                            fullWidth
                            label="Topic"
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item>
                          <Button
                            sx={{
                              whiteSpace: 'nowrap',
                              minWidth: 'max-content',
                            }}
                            fullWidth
                            variant="contained"
                            onClick={() => {
                              setCount((count) => count + 1);
                              browser.runtime.sendMessage({
                                action: BACKGROUND_ACTION.MQTT_PUBLISH,
                                topic: topicValue,
                                content: count,
                              });
                            }}
                          >
                            Publish {count}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
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
