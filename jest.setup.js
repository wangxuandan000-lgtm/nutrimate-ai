import '@testing-library/jest-dom';

jest.mock('@clerk/nextjs', () => {
  const React = require('react');

  return {
    ClerkProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    UserButton: () => React.createElement('button', { type: 'button' }, 'User'),
    useAuth: () => ({
      getToken: jest.fn().mockResolvedValue('test-token'),
    }),
    useClerk: () => ({
      openSignIn: jest.fn(),
    }),
    useUser: () => ({
      user: { id: 'user_123', username: 'test' },
    }),
  };
});

jest.mock('react-markdown', () => {
  const React = require('react');

  return {
    __esModule: true,
    default: ({ children }) => React.createElement('div', null, children),
  };
});
