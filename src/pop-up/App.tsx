import { useState } from 'react';
import './App.css';
import browser from 'webextension-polyfill';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

function App() {
  const [count, setCount] = useState(0);
  let topicValue = "";
  return (
    <>
      <h1>Tinkercad MQTT</h1>
      <div className="topic-input">
        <TextField placeholder="Enter Topic to subscribe" variant="outlined" onChange={(event) => { topicValue = event.target.value;}}/>
        <Button variant="contained" onClick={() => {
          browser.runtime.sendMessage({
            action: 'subscribeTopic',
            content: topicValue
          })
        }}>Create Topic</Button>
      </div>
      <div className="card">
        <Button
          variant="contained"
          onClick={() => {
            setCount((count) => count + 1);
            browser.runtime.sendMessage({
              action: 'publishMessage',
              topic: 'presence',
              content: count,
            });
          }}
        >
          count is {count}
        </Button>
      </div>
    </>
  );
}

export default App;
