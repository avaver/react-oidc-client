import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getUserManager } from './oidc';

const SigninCallback = () => {
  const history = useHistory();

  useEffect(() => {
    console.debug('signin callback called');
    const manager = getUserManager();
    manager
      .signinRedirectCallback()
      .then((user) => {
        console.debug('signin completed successfully, redirecting to ' + user.state.returnUrl);
        history.push(user.state.url ?? '/');
      })
      .catch(async (error) => {
        console.log('signin callback failed: ' + error.error);
      });
  }, [history]);
  return <></>;
};

export default SigninCallback;
