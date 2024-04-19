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

interface MqttConfiguratorProps {
  authenticationEnabled: boolean;
}

function MqttConfigurator(props: MqttConfiguratorProps) {
  const propAuthenticationEnabled = props.authenticationEnabled;
  const [authenticationEnabled, setAuthenticationEnabled] = useState(
    propAuthenticationEnabled
  );

  const handleAuthenticationEnabledChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAuthenticationEnabled(event.target.checked);
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
          />
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              Authentication
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Grid container>
                  <Grid item xs={10}>
                    <Typography>Use Authentication</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Checkbox onChange={handleAuthenticationEnabledChange} />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  size="small"
                  disabled={!authenticationEnabled}
                />
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  size="small"
                  type="password"
                  disabled={!authenticationEnabled}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Box>
    </>
  );
}

export default MqttConfigurator;
