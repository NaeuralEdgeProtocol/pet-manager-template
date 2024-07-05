import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import {ConnectionProvider} from './components/ConnectionContext';
import {NetworkProvider} from './components/NetworkContext';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <ConnectionProvider>
        <NetworkProvider>
            <App />
        </NetworkProvider>
    </ConnectionProvider>
);
