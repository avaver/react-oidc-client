import { User, UserManagerSettings } from 'oidc-client';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { init, oidcLogin, oidcLoginSilent, oidcLogout } from './oidc';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import SigninCallback from './SigninCallback';
import SigninSilentCallback from './SigninSilentCallback';

const AuthProvider: FC<{ settings: UserManagerSettings }> = ({ settings, children }) => {
  const manager = init(settings);
  const [user, setUser] = useState<User | null>(null);

  const getUriPath = (uri: string) => {
    return uri.substr(uri.indexOf('/', uri.indexOf('//') + 2));
  };

  const callbackUrl = settings.redirect_uri ? getUriPath(settings.redirect_uri) : '/auth/cb';
  const silentCallbackUrl = settings.silent_redirect_uri ? getUriPath(settings.silent_redirect_uri) : '/auth/scb';

  const login = async (username?: string) => {
    oidcLogin(username);
  };

  const logout = async () => {
    oidcLogout();
  };

  const userLoaded = useCallback((u: User) => {
    setUser(u);
    console.debug(`user loaded: ${u?.profile.name ?? u?.profile.sub}`);
  }, []);

  const userUnloaded = useCallback(() => {
    setUser(null);
    console.debug('user unlodaded');
  }, []);

  const userSignedOut = useCallback(() => {
    manager.removeUser();
    setUser(null);
    console.debug('user signed out');
  }, [manager]);

  const accessTokenExpiring = useCallback(async () => {
    console.debug('access token expiring');
    await oidcLoginSilent();
  }, []);

  const accessTokenExpired = useCallback(async () => {
    console.debug('access token expired');
    await oidcLoginSilent();
  }, []);

  const silentRenewError = useCallback((error: Error) => {
    console.debug('silent renew error');
    console.error(error);
  }, []);

  const userSessionChanged = useCallback(() => {
    console.debug('user session changed');
  }, []);

  useEffect(() => {
    manager.events.addUserLoaded(userLoaded);
    manager.events.addUserUnloaded(userUnloaded);
    manager.events.addUserSignedOut(userSignedOut);
    manager.events.addAccessTokenExpiring(accessTokenExpiring);
    manager.events.addAccessTokenExpired(accessTokenExpired);
    manager.events.addSilentRenewError(silentRenewError);
    manager.events.addUserSessionChanged(userSessionChanged);

    (async () => {
      setUser(await manager.getUser());
    })();

    return () => {
      manager.events.removeUserLoaded(userLoaded);
      manager.events.removeUserUnloaded(userUnloaded);
      manager.events.removeUserSignedOut(userSignedOut);
      manager.events.removeAccessTokenExpiring(accessTokenExpiring);
      manager.events.removeAccessTokenExpired(accessTokenExpired);
      manager.events.removeSilentRenewError(silentRenewError);
      manager.events.removeUserSessionChanged(userSessionChanged);
    };
  }, [
    manager,
    accessTokenExpired,
    accessTokenExpiring,
    silentRenewError,
    userLoaded,
    userSessionChanged,
    userSignedOut,
    userUnloaded,
  ]);
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <Route path={callbackUrl}>
          <SigninCallback />
        </Route>
        <Route path={silentCallbackUrl}>
          <SigninSilentCallback />
        </Route>
        <Route path="*">{children}</Route>
      </Router>
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth called outside of AuthProvider');
  }
  return auth;
};
