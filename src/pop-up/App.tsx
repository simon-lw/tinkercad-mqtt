import { useState } from 'react';
import './App.css';
import browser from 'webextension-polyfill';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Button from '@mui/material/Button';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Tinkercad MQTT</h1>
      <div className="card">
        <Button
          variant="contained"
          onClick={() => {
            setCount((count) => count + 1);
            browser.runtime.sendMessage({
              action: 'publishToMQTT',
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
