import UserClient from "api/clients/user_client";
import SocialUser from "api/data/social_user";
import User from "api/data/user";
import UserRequest from "api/data/user_request";
import BadRequestError from "api/errors/bad_request_error";
import ConflictError from "api/errors/conflict_error";
import ForbiddenError from "api/errors/forbidden_error";
import ServerError from "api/errors/server_error";
import { useHistory } from "react-router";
import { atom, useRecoilState, useSetRecoilState } from "recoil";

//////////////////////////////////////////////////
// State Selectors and Atoms
//////////////////////////////////////////////////
export const userLoadedState = atom({
  key: 'userLoadedState',
  default: false
});

export const userState = atom<User>({
  key: 'userState',
  default: new User()
});

export const accessDeniedState = atom<boolean>({
  key: 'AccessDeniedState',
  default: false,
})

/////////////////////////////////////////////////
// Actions
/////////////////////////////////////////////////
export const useUserModel = () => {
  const history = useHistory();
  const [authUser, setAuthUser] = useRecoilState(userState);
  const setLoaded = useSetRecoilState(userLoadedState);

  const serverErrorMsg = "Ops, algo de errado aconteceu com o servidor...";
  const appErrorMsg = "Desculpe, um erro inesperado aconteceu!";

  const isAuthenticated = (): boolean => {
    if (authUser.bearerToken !== '') {
      return true;
    } else {
      return false;
    }
  }

  const loadAuthUser = () => {
    var userString = sessionStorage.getItem("user");
    if (userString == null) {
      setAuthUser(new User());
    } else {
      setAuthUser(JSON.parse(userString));
    }
    setLoaded(true);
  }
  
  const saveUser = (user: User) => {
    sessionStorage.removeItem("user");
    sessionStorage.setItem("user", JSON.stringify(user));
    loadAuthUser();
  }

  const login = async (username: string, password: string): Promise<string|null> => {
    try {
      var bearerToken = await UserClient.login(username, password);
      var fetchedUser = await UserClient.fetchUserInfo(bearerToken);
      saveUser(fetchedUser);
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        return "Usuário ou senha incorretos";
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const signup = async (request: UserRequest): Promise<string|null> => {
    try {
      await UserClient.signup(request);
      return null;
    } catch (err) {
      if (err instanceof BadRequestError) {
        return "Dados inválidos";
      } else if (err instanceof ConflictError) {
        return 'Usuário ou e-mail já existem';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const resetPassword = async (resetForm: UserRequest, token: string): Promise<string|null> => {
    try {
      await UserClient.resetPassword(resetForm, token);
      return null;
    } catch (err) {
      if (err instanceof BadRequestError) {
        return "Dados inválidos";
      } else if (err instanceof ForbiddenError) {
        return 'Acesso negado. Por favor, verifique seu token.';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const recoverAccount = async (user: string): Promise<string|null> => {
    try {
      await UserClient.recoverAccount(user);
      return null;
    } catch (err) {
      return "Falha ao recuperar conta";
    }
  }

  const socialSignup = async (user: SocialUser): Promise<string|null> => {
    try {
      var bearerToken = await UserClient.socialSignup(user);
      var fetchedUser = await UserClient.fetchUserInfo(bearerToken);
      saveUser(fetchedUser);
      return null;
    } catch (err) {
      if (err instanceof BadRequestError) {
        return "Dados inválidos";
      } else if (err instanceof ConflictError) {
        return 'Usuário ou e-mail já existem. Por favor, escolha outro.';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const editUser = async (user: User): Promise<string|null> => {
    let bearerToken = authUser.bearerToken;
    try {
      await UserClient.editUser(user, bearerToken);
      var fetchedUser = await UserClient.fetchUserInfo(bearerToken);
      saveUser(fetchedUser);
      return null;
    } catch (err) {
      if (err instanceof BadRequestError) {
        return "Dados inválidos";
      } else if (err instanceof ConflictError) {
        return 'Usuário ou e-mail já existem. Por favor, escolha outro.';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const deleteUser = async (user: User, password: string): Promise<string|null> => {
    if (password == null || password === "") {
      return "A senha é obrigatória para essa operação";
    }

    try {
      await UserClient.deleteAccount(user, password);
      logout();
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        return 'Acesso negado. Por favor, tente logar novamente.';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const logout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.clear();
    history.push('/login');
  }

  return { loadAuthUser, isAuthenticated, login, signup, socialSignup,
     resetPassword, recoverAccount, editUser, deleteUser, logout, saveUser};
}

