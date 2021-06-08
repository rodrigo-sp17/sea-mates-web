import FriendClient from "clients/friend_client";
import Friend from "data/friend";
import FriendRequest from "data/friend_request";
import User from "data/user";
import BadRequestError from "errors/bad_request_error";
import ForbiddenError from "errors/forbidden_error";
import NotFoundError from "errors/not_found_error";
import ServerError from "errors/server_error";
import { useHistory } from "react-router";
import { atom, useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "./user_model";

//////////////////////////////////////////////////
// State Selectors and Atoms
//////////////////////////////////////////////////
export const friendListState = atom<Array<Friend>>({
  key: 'friendListState',
  default: []
});

export const availableFriendListState = atom<Array<User>>({
  key: 'availableFriendListState',
  default: []
});

export const myRequestListState = atom<Array<FriendRequest>>({
  key: 'myRequestListState',
  default: []
});

export const otherRequestListState = atom<Array<FriendRequest>>({
  key: 'otherRequestListState',
  default: []
});

/////////////////////////////////////////////////
// Actions
/////////////////////////////////////////////////
export const useFriendModel = () => {
  const history = useHistory();
  const user = useRecoilValue(userState);
  const setFriends = useSetRecoilState(friendListState);
  const setAvailableFriends = useSetRecoilState(availableFriendListState);
  const setMyRequests = useSetRecoilState(myRequestListState);
  const setOtherRequests = useSetRecoilState(otherRequestListState);

  const serverErrorMsg = "Ops, algo de errado aconteceu com o servidor...";
  const appErrorMsg = "Desculpe, um erro inesperado aconteceu!";

  if (user == null) {
    history.push('/login');
    throw new Error('No user logged');
  }

  const loadAll = async () => {
    await loadFriends();
    await loadRequests();
  }

  const loadAvailableFriends = async (date: Date): Promise<string | null> => {
    try {
      var friends = await FriendClient.getAvailableFriends(date, user.bearerToken);
      setAvailableFriends(friends);
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        history.push('/login');
        return 'Acesso negado';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const loadFriends = async (): Promise<string | null> => {
    try {
      var friends = await FriendClient.getFriends(user.bearerToken);
      setFriends(friends);
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        history.push('/login');
        return 'Acesso negado';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const loadRequests = async (): Promise<string | null> => {
    try {
      var requests = await FriendClient.getFriendRequests(user.bearerToken);
      const [myReqs, otherReqs] = splitRequestsByOrigin(requests);      
      setMyRequests(myReqs);
      setOtherRequests(otherReqs);
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        history.push('/login');
        return 'Acesso negado';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const requestFriendship = async (username: string): Promise<string | null> => {
    try {
      await FriendClient.requestFriendship(username, user.bearerToken);
      loadFriends();
      loadRequests();
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        history.push('/login');
        return 'Acesso negado';
      } else if (err instanceof BadRequestError) {
        return 'Dados inválidos';
      } else if (err instanceof NotFoundError) {
        return 'O usuário não existe.';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const acceptFriendship = async (username: string): Promise<string | null> => {
    try {
      await FriendClient.acceptFriendship(username, user.bearerToken);
      loadFriends();
      loadRequests();
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        history.push('/login');
        return 'Acesso negado';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const unfriend = async (username: string): Promise<string | null> => {
    try {
      await FriendClient.unfriend(username, user.bearerToken);
      loadFriends();
      loadRequests();
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        history.push('/login');
        return 'Acesso negado';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  const splitRequestsByOrigin = (requests: Array<FriendRequest>) => {
    var me = user.username;
    var myReqs = new Array<FriendRequest>();
    var otherReqs = new Array<FriendRequest>();

    requests.forEach(r => {
      if (r.sourceUsername === me) {
        myReqs.push(r);
      } else {
        otherReqs.push(r);
      }
    })

    return [myReqs, otherReqs];
  }  

  return {
    loadAvailableFriends, loadFriends, loadRequests, loadAll,
    requestFriendship, acceptFriendship, unfriend
  };
}

