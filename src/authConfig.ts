import { UserManagerSettings } from 'oidc-client';

// const config = {
//   authority: 'https://192.168.88.254:5001/',
//   client_id: 'dentalsuite.web',
//   redirect_uri: 'http://localhost:3000/auth/callback',
//   response_type: 'code',
//   scope: 'openid DentalSuite',
// };

const config: UserManagerSettings = {
  authority: 'https://192.168.88.254:5000/',
  client_id: 'dentalsuite.web',
  redirect_uri: 'http://localhost:3000/authentication/callback',
  silent_redirect_uri: 'http://localhost:3000/authentication/silentcallback',
  response_type: 'code',
  scope: 'openid dentalsuite profile',
  post_logout_redirect_uri: 'http://localhost:3000/',
  automaticSilentRenew: true,
  revokeAccessTokenOnSignout: true,
};

export default config;
