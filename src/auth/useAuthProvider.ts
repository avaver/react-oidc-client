import { User, UserManagerSettings } from 'oidc-client';
import { useCallback, useEffect, useState } from 'react';
import { init, oidcLogin, oidcLoginSilent, oidcLogout } from './oidc';

export function useAuthProvider(
  settings: UserManagerSettings
): { user: User | null; login: () => void; logout: () => void; callbackUrl: string; silentCallbackUrl: string } {
  const manager = init(settings);
  const [user, setUser] = useState<User | null>(null);

  const getUriPath = (uri: string) => {
    return uri.substr(uri.indexOf('/', uri.indexOf('//') + 2));
  };

  const callbackUrl = settings.redirect_uri ? getUriPath(settings.redirect_uri) : '/auth/cb';
  const silentCallbackUrl = settings.silent_redirect_uri ? getUriPath(settings.silent_redirect_uri) : '/auth/scb';

  const login = oidcLogin;

  const logout = oidcLogout;

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
    let destroyed = false;
    manager.events.addUserLoaded(userLoaded);
    manager.events.addUserUnloaded(userUnloaded);
    manager.events.addUserSignedOut(userSignedOut);
    manager.events.addAccessTokenExpiring(accessTokenExpiring);
    manager.events.addAccessTokenExpired(accessTokenExpired);
    manager.events.addSilentRenewError(silentRenewError);
    manager.events.addUserSessionChanged(userSessionChanged);

    (async () => {
      const u = await manager.getUser();
      if (!destroyed) {
        setUser(u);
      }
    })();

    return () => {
      manager.events.removeUserLoaded(userLoaded);
      manager.events.removeUserUnloaded(userUnloaded);
      manager.events.removeUserSignedOut(userSignedOut);
      manager.events.removeAccessTokenExpiring(accessTokenExpiring);
      manager.events.removeAccessTokenExpired(accessTokenExpired);
      manager.events.removeSilentRenewError(silentRenewError);
      manager.events.removeUserSessionChanged(userSessionChanged);
      destroyed = true;
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

  return {
    user,
    login,
    logout,
    callbackUrl,
    silentCallbackUrl,
  };
}
