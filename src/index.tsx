import {createRoot} from 'react-dom/client';

import {Main} from './main';

window.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.querySelector('main');
    if (!rootElement) {
        alert('Failed to find root for React application');
        throw new Error('No root element found');
    }
    createRoot(rootElement).render(<Main />);
});
