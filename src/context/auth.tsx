import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../services/api";

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
};

type AuthContextData = {
  user: User | null;
  isUserLoading: boolean;
  signInUrl: string;
  signOut: () => void;
  userExistsOrIsLoading: () => boolean;
};

const AuthContext = createContext({} as AuthContextData);

type AuthProvider = {
  children: ReactNode;
};

type AuthResponse = {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  };
};

type UserState = {
  user: User | null;
  isUserLoading: boolean;
};

export function AuthProvider({ children }: AuthProvider) {
  const [{ user, isUserLoading }, setUser] = useState<UserState>({
    user: null,
    isUserLoading: true,
  });

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=4f7cffe1e134c7442809`;

  async function signIn(githubCode: string) {
    setUser((oldUser) => ({ ...oldUser, isUserLoading: true }));

    const response = await api.post<AuthResponse>("authenticate", {
      code: githubCode,
    });

    const { token, user } = response.data;

    localStorage.setItem("@dowhile:token", token);

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser({ isUserLoading: false, user });
  }

  function signOut() {
    setUser({ isUserLoading: false, user: null });
    localStorage.removeItem("@dowhile:token");
  }

  function userExistsOrIsLoading() {
    return !!user || isUserLoading;
  }

  useEffect(() => {
    const token = localStorage.getItem("@dowhile:token");

    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<User>("profile").then((response) => {
        setUser({ isUserLoading: false, user: response.data });
      });
      return;
    }
    setUser((oldUser) => ({ ...oldUser, isUserLoading: false }));
  }, []);

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split("?code=");

      window.history.pushState({}, "", urlWithoutCode);

      signIn(githubCode);
      return;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ signInUrl, user, isUserLoading, signOut, userExistsOrIsLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const authContext = useContext(AuthContext);
  return authContext;
}
