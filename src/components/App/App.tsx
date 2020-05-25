import React, { useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { Sheet } from '../../views/Sheet';
import { Start } from '../../views/Start';
import { Layout } from '../Layout';


const hotApp = hot(function App() {
  const [sheet, setSheet] = useState(null);

  return (
    <Layout>
      {! sheet && (
        <Start onFinish={setSheet}/>
      )}
      {sheet && (
        <Sheet sheet={sheet}/>
      )}
    </Layout>
  );
});

export { hotApp as App };
