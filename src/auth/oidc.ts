import { UserManager, Log, UserManagerSettings } from 'oidc-client';

Log.logger = console;
Log.level = Log.INFO;

let userManager: UserManager;

export const init = (config: UserManagerSettings) => {
  if (!userManager) {
    userManager = new UserManager(config);
    console.debug('UserManager initialized');
  }
  return userManager;
};

export const getUserManager = () => {
  if (!userManager) {
    throw new Error('UserManager is not initialized');
  }
  return userManager;
};

export const oidcLogin = async (username?: string) => {
  console.debug('oidcLogin called');
  const manager = getUserManager();
  const user = await manager.getUser();
  console.debug(`current user: ${user?.profile.name ?? user?.profile.sub}`);

  const returnUrl = window.location.pathname + window.location.search + window.location.hash;
  if (!user) {
    console.debug('user not found, signing in...');
    await manager.signinRedirect({ login_hint: username, data: { returnUrl } });
  } else {
    oidcLoginSilent();
  }
};

export const oidcLoginSilent = async () => {
  console.debug('oidcLoginSilent called');
  const manager = getUserManager();
  const user = await manager.getUser();
  if (user && user.expired) {
    console.debug('user expired, trying silent singin...');
    try {
      await manager.signinSilent();
    } catch (error) {
      console.warn(error);
      console.debug(`error during silent signin: ${error}`);
      console.debug('removing user and trying normal login');
      await manager.removeUser();
      oidcLogin();
    }
  }
};

export const oidcLogout = async () => {
  console.debug('oidcLogout called');
  const manager = getUserManager();
  const user = await manager.getUser();
  console.debug(`current user: ${user?.profile.name ?? user?.profile.sub}`);
  if (user) {
    console.debug('user found, signing out...');
    await manager.signoutRedirect();
  }
};
