import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/* Ionic core and utility CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* ✅ Your custom theme variables */
import './theme/variables.css';
import { initWalkthroughStorage } from './pages/OrderWalkthrough/walkthroughSteps';

const container = document.getElementById('root');
const root = createRoot(container!);

void initWalkthroughStorage().finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
