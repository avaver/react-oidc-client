import React, { FC } from 'react';
import { useAuth } from './auth/AuthProvider';

const Login: FC = () => {
  const { user, login, logout } = useAuth();

  const loginLogout = async () => {
    if (user) {
      await logout();
    } else {
      await login('admin@hotmail.com');
    }
  };
  return (
    <div>
      <div style={{ padding: '20px' }}>User: {user ? user.profile.sub + ' (' + user.profile.name + ')' : 'N/A'}</div>
      <button onClick={loginLogout}>{user ? 'Logout' : 'Login'}</button>
    </div>
  );
};

export default Login;
