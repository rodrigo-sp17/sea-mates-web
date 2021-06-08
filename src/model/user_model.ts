import UserClient from "clients/user_client";
import SocialUser from "data/social_user";
import User from "data/user";
import UserRequest from "data/user_request";
import BadRequestError from "errors/bad_request_error";
import ConflictError from "errors/conflict_error";
import ForbiddenError from "errors/forbidden_error";
import ServerError from "errors/server_error";
import { atom, selector, useRecoilState, useSetRecoilState } from "recoil";

//////////////////////////////////////////////////
// State Selectors and Atoms
//////////////////////////////////////////////////
export const userState = selector<User|null>({
  key: 'userState',
  get: ({get}): User|null => {
    var userString = sessionStorage.getItem("user");
    if (userString == null) {
      return null;
    }
    return JSON.parse(userString);
  },
  set: ({set}, newValue = new User()) => {
    sessionStorage.setItem("user", JSON.stringify(newValue));
  }
});

export const userLoadedState = atom({
  key: 'userLoadedState',
  default: true
});


/////////////////////////////////////////////////
// Actions
/////////////////////////////////////////////////
export const useReloadUser = () => {
  const [user, setUser] = useRecoilState<User|null>(userState);
  const [loaded, setLoaded] = useRecoilState(userLoadedState);

  setLoaded(false);

  if (user == null) {
    return async () => {};
  }
 
  return async () => {
    try {
      var fetchedUser = await UserClient.fetchUserInfo(user.bearerToken);
      setUser(fetchedUser);
      return null;
    } finally {
      setLoaded(false);
    }
  }
}

export const useLogin = () => {
  const setUser = useSetRecoilState(userState);
  const [loaded, setLoaded] = useRecoilState(userLoadedState);

  setLoaded(false);
  
  return async (username: string, password: string): Promise<string|null> => {
    try {
      var bearerToken = await UserClient.login(username, password);
      var fetchedUser = await UserClient.fetchUserInfo(bearerToken);
      setUser(fetchedUser);
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        return "Usuário ou senha incorretos";
      } else if (err instanceof ServerError) {
        return "Ops, algo de errado aconteceu com o servidor...";
      } else {
        return "Desculpe, um erro inesperado aconteceu!";
      }
    } finally {
      setLoaded(true);
    }
  }
};

export const useSignup = () => {
  return async (request: UserRequest): Promise<string|null> => {
    try {
      await UserClient.signup(request);
      return null;
    } catch (err) {
      if (err instanceof BadRequestError) {
        return "Dados inválidos";
      } else if (err instanceof ConflictError) {
        return 'Usuário ou e-mail já existem';
      } else if (err instanceof ServerError) {
        return 'Ops, algo de errado acontenceu com o servidor...';
      } else {
        return 'Desculpe, um erro inesperado aconteceu!';
      }
    }
  }
}

export const useResetPassword = () => {
  return async (resetForm: UserRequest, token: string): Promise<string|null> => {
    try {
      await UserClient.resetPassword(resetForm, token);
      return null;
    } catch (err) {
      if (err instanceof BadRequestError) {
        return "Dados inválidos";
      } else if (err instanceof ForbiddenError) {
        return 'Acesso negado. Por favor, verifique seu token.';
      } else if (err instanceof ServerError) {
        return 'Ops, algo de errado acontenceu com o servidor...';
      } else {
        return 'Desculpe, um erro inesperado aconteceu!';
      }
    }
  }
}

export const useRecoverAccount = () => {
  return async (user: string): Promise<string|null> => {
    try {
      await UserClient.recoverAccount(user);
      return null;
    } catch (err) {
      return "Falha ao recuperar conta";
    }
  }
}

export const useSocialSignup = () => {
  const setUser = useSetRecoilState(userState);

  return async (user: SocialUser): Promise<string|null> => {
    try {
      var bearerToken = await UserClient.socialSignup(user);
      var fetchedUser = await UserClient.fetchUserInfo(bearerToken);
      setUser(fetchedUser);
      return null;
    } catch (err) {
      if (err instanceof BadRequestError) {
        return "Dados inválidos";
      } else if (err instanceof ConflictError) {
        return 'Usuário ou e-mail já existem. Por favor, escolha outro.';
      } else if (err instanceof ServerError) {
        return 'Ops, algo de errado acontenceu com o servidor...';
      } else {
        return 'Desculpe, um erro inesperado aconteceu!';
      }
    }
  }
}

export const useEditUser = () => {
  const setUser = useSetRecoilState(userState);

  return async (user: User): Promise<string|null> => {
    try {
      await UserClient.editUser(user);
      var fetchedUser = await UserClient.fetchUserInfo(user.bearerToken);
      setUser(fetchedUser);
      return null;
    } catch (err) {
      if (err instanceof BadRequestError) {
        return "Dados inválidos";
      } else if (err instanceof ConflictError) {
        return 'Usuário ou e-mail já existem. Por favor, escolha outro.';
      } else if (err instanceof ServerError) {
        return 'Ops, algo de errado acontenceu com o servidor...';
      } else {
        return 'Desculpe, um erro inesperado aconteceu!';
      }
    }
  }
}

export const useDeleteUser = () => {
  return async (user: User, password: string): Promise<string|null> => {
    if (password == null || password === "") {
      return "A senha é obrigatória para essa operação";
    }

    try {
      await UserClient.deleteAccount(user, password);
      sessionStorage.removeItem("user");
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        return 'Acesso negado. Por favor, tente logar novamente.';
      } else if (err instanceof ServerError) {
        return 'Ops, algo de errado acontenceu com o servidor...';
      } else {
        return 'Desculpe, um erro inesperado aconteceu';
      }
    }
  }
}






