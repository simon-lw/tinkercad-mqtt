import { ChangeEvent, useState } from 'react';
import './App.css';
import browser from 'webextension-polyfill';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { BACKGROUND_ACTION } from '../content';

function App() {
  const [count, setCount] = useState(0);
  const [topicValue, setTopicValue] = useState('');

  const handleTextFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTopicValue(event.target.value);
  };

  return (
    <>
      <h1>Tinkercad MQTT</h1>
      <div className="topic-input">
        <TextField
          style={{ color: 'white' }}
          placeholder="Enter Topic to subscribe"
          variant="outlined"
          onChange={handleTextFieldChange}
        />
        <Button
          variant="contained"
          onClick={() => {
            browser.tabs
              .query({ active: true, currentWindow: true })
              .then((tabs) => {
                let tab = tabs[0];
                let tabId = tab.id;

                if (tabId) {
                  browser.tabs.sendMessage(tabId, {
                    action: BACKGROUND_ACTION.MQTT_SUBSCRIBE,
                    content: topicValue,
                  });
                }
              });
          }}
        >
          Subscribe Topic
        </Button>
      </div>
      <div className="card">
        <Button
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
          count is {count}
        </Button>
      </div>
    </>
  );
}

export default App;
