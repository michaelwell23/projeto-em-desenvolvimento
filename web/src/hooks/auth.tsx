import React, { createContext, useCallback, useContext, useState } from 'react';
import api from '../services/apiClient';

interface User {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  avatar_url: string;
}

interface AuthState {
  token: string;
  user: User;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  signIn(credentails: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@+clinicaSaúde:token');
    const user = localStorage.getItem('@+clinicaSaúde:user');

    if (token && user) {
      api.defaults.headers.authorization = `Bearer ${token}`;

      return { token, user: JSON.parse(user) };
    }

    return {} as AuthState;
  });

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem('@+clinicaSaúde:token', token);
    localStorage.setItem('@+clinicaSaúde:user', JSON.stringify(user));

    api.defaults.headers.authorization = `Bearer ${token}`;

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@+clinicaSaúde:token');
    localStorage.removeItem('@+clinicaSaúde:user');

    setData({} as AuthState);
  }, []);

  const updateUser = useCallback(
    (user: User) => {
      localStorage.setItem('@+clinicaSaúde:user', JSON.stringify(user));

      setData({
        token: data.token,
        user,
      });
    },
    [setData, data.token],
  );

  return (
    <AuthContext.Provider
      value={{ user: data.user, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('UseAuth must be used within an AUthProvider');
  }

  return context;
}
