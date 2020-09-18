import { User } from 'oidc-client';
import { createContext } from 'react';

type AuthContext = {
  user: User | null;
  login: Function;
  logout: Function;
};

export const AuthContext = createContext<AuthContext | undefined>(undefined);
