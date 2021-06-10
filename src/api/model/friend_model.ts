import FriendClient from "api/clients/friend_client";
import Friend from "api/data/friend";
import FriendRequest from "api/data/friend_request";
import BadRequestError from "api/errors/bad_request_error";
import ForbiddenError from "api/errors/forbidden_error";
import NotFoundError from "api/errors/not_found_error";
import ServerError from "api/errors/server_error";
import { useHistory } from "react-router";
import { atom, selector, selectorFamily, useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "./user_model";

//////////////////////////////////////////////////
// State Selectors and Atoms
//////////////////////////////////////////////////
export const friendsRequestIDState = atom({
  key: 'FriendsRequestID',
  default: 0
});

export const availableFriendsQuery = selectorFamily({
  key: 'AvailableFriends',
  get: (date: Date) => async ({ get }) => {
    let bearerToken = get(userState).bearerToken;
    return await FriendClient.getAvailableFriends(date, bearerToken);
  }
});

export const friendListState = selector<Array<Friend>>({
  key: 'FriendListState',
  get: async ({ get }) => {
    get(friendsRequestIDState);
    let bearerToken = get(userState).bearerToken;
    return FriendClient.getFriends(bearerToken);
  }
});

export const requestListState = selector({
  key: 'RequestListState',
  get: async ({ get }) => {
    get(friendsRequestIDState);
    let user = get(userState);
    let bearerToken = user.bearerToken;
    let username = user.username;
    var reqs = await FriendClient.getFriendRequests(bearerToken);
    const [myRequests, otherRequests] = FriendUtils.splitRequestsByOrigin(username, reqs);
    return { myRequests, otherRequests };
  }
});

/////////////////////////////////////////////////
// Actions
/////////////////////////////////////////////////
export const useFriendModel = () => {
  const history = useHistory();
  const user = useRecoilValue(userState);

  const setRequestId = useSetRecoilState(friendsRequestIDState);
  const serverErrorMsg = "Ops, algo de errado aconteceu com o servidor...";
  const appErrorMsg = "Desculpe, um erro inesperado aconteceu!";

  const loadAll = () => {
    setRequestId((requestId) => requestId + 1);
  }

  const requestFriendship = async (username: string): Promise<string | null> => {
    try {
      await FriendClient.requestFriendship(username, user.bearerToken);
      loadAll();
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        history.push('/login');
        return 'Acesso negado';
      } else if (err instanceof BadRequestError) {
        return 'Não é possível ser amigo de si mesmo';
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
      loadAll();
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
      loadAll();
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

  return { loadAll, requestFriendship, acceptFriendship, unfriend };
}


export class FriendUtils {
  static splitRequestsByOrigin(username: string, requests: Array<FriendRequest>): Array<Array<FriendRequest>> {
    var me = username;
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
}

