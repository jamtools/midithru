import React from 'react';
import {createRoot} from 'react-dom/client';

import {Main} from './main';

createRoot(document.querySelector('main')!).render(<Main />);
