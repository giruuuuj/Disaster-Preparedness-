import { render } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    BrowserRouter: ({ children }) => React.createElement('div', null, children),
    Routes: ({ children }) => React.createElement('div', null, children),
    Route: () => null,
    Navigate: () => null,
  };
}, { virtual: true });

test('renders app without crashing', () => {
  render(<App />);
});
