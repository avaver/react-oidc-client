import React from 'react';
import AuthProvider from './auth/AuthProvider';
import config from './authConfig';
import Login from './Login';
import './app.css';

const App = () => {
  return (
    <AuthProvider settings={config}>
      <div className="app">
        <Login />
      </div>
    </AuthProvider>
  );
};

export default App;
