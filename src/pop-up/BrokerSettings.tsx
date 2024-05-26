import { useState } from 'react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import TextField from '@mui/material/TextField';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { MqttSettings } from '../util/MqttSettings';

interface BrokerSettingsProps {
  mqttSettings: MqttSettings;
  setMqttSettings: (settings: MqttSettings) => void;
}

function BrokerSettings(props: BrokerSettingsProps) {
  const [authenticationEnabled, setAuthenticationEnabled] = useState(
    props.mqttSettings.authenticationEnabled
  );

  return (
    <>
      <Box>
        <Stack spacing={1}>
          <TextField
            fullWidth
            label="Broker URL"
            placeholder="ws://localhost:9001"
            variant="outlined"
            size="small"
            onChange={(event) => {
              const hostname = event.target.value;
              props.setMqttSettings({
                ...props.mqttSettings,
                options: {
                  ...props.mqttSettings.options,
                  hostname: hostname != '' ? hostname : undefined,
                },
              });
            }}
            value={props.mqttSettings.options.hostname}
          />
          <TextField
            fullWidth
            label="Publish Topic"
            variant="outlined"
            size="small"
            onChange={(event) => {
              props.setMqttSettings({
                ...props.mqttSettings,
                pubTopic: event.target.value,
              });
            }}
            value={props.mqttSettings.pubTopic}
          />
          <TextField
            fullWidth
            label="Subscribe Topic"
            variant="outlined"
            size="small"
            onChange={(event) => {
              props.setMqttSettings({
                ...props.mqttSettings,
                subTopic: event.target.value,
              });
            }}
            value={props.mqttSettings.subTopic}
          />
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              Authentication
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Grid container alignItems="center">
                  <Grid item xs={10}>
                    <Typography>Use Authentication</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Checkbox
                      onChange={(event) => {
                        props.setMqttSettings({
                          ...props.mqttSettings,
                          authenticationEnabled: event.target.checked,
                        });
                        setAuthenticationEnabled(event.target.checked);
                      }}
                      size="small"
                      checked={authenticationEnabled}
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  size="small"
                  disabled={!authenticationEnabled}
                  onChange={(event) => {
                    props.setMqttSettings({
                      ...props.mqttSettings,
                      options: {
                        ...props.mqttSettings.options,
                        username: event.target.value,
                      },
                    });
                  }}
                  value={props.mqttSettings.options.username}
                />
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  size="small"
                  type="password"
                  disabled={!authenticationEnabled}
                  onChange={(event) => {
                    props.setMqttSettings({
                      ...props.mqttSettings,
                      options: {
                        ...props.mqttSettings.options,
                        password: event.target.value,
                      },
                    });
                  }}
                  value={props.mqttSettings.options.password}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Box>
    </>
  );
}

export default BrokerSettings;
