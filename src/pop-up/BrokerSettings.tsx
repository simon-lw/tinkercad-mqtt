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

interface BrokerSettingsProps {
  disabled: boolean;
  authenticationEnabled: boolean;
  hostname: string;
  topics: string[];
  username: string;
  onAuthenticationEnabledChange: (enabled: boolean) => void;
  onBrokerUrlChange: (brokerUrl: string) => void;
  onTopicsChange: (topics: string[]) => void;
  onUsernameChange: (username: string) => void;
}

function BrokerSettings(props: BrokerSettingsProps) {
  const disabled = props.disabled;
  const [authenticationEnabled, setAuthenticationEnabled] = useState(
    props.authenticationEnabled
  );

  const handleAuthenticationEnabledChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    props.onAuthenticationEnabledChange(event.target.checked);
    setAuthenticationEnabled(event.target.checked);
  };

  const handleBrokerUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    props.onBrokerUrlChange(event.target.value);
  };

  const handleTopicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const topicsArray = event.target.value.split(',');
    props.onTopicsChange(topicsArray);
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onUsernameChange(event.target.value);
  };

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
            disabled={disabled}
            onChange={handleBrokerUrlChange}
            value={props.hostname}
          />
          <TextField
            fullWidth
            label="Topic"
            variant="outlined"
            size="small"
            disabled={disabled}
            onChange={handleTopicChange}
            value={props.topics}
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
                      onChange={handleAuthenticationEnabledChange}
                      size="small"
                      disabled={disabled}
                      checked={authenticationEnabled}
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  size="small"
                  disabled={!authenticationEnabled || disabled}
                  onChange={handleUsernameChange}
                  value={props.username}
                />
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  size="small"
                  type="password"
                  disabled={!authenticationEnabled || disabled}
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
