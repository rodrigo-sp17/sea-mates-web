import Friend from "api/data/friend";
import FriendRequest from "api/data/friend_request";
import User from "api/data/user";
import BadRequestError from "api/errors/bad_request_error";
import ForbiddenError from "api/errors/forbidden_error";
import NotFoundError from "api/errors/not_found_error";
import ServerError from "api/errors/server_error";

export default class FriendClient {

  static async getAvailableFriends(date: Date, bearerToken: string): Promise<Array<User>> {
    let friendsListJson = await fetch("/api/calendar/available?date=" + date.toISOString().substr(0, 10), {
      method: 'GET',
      headers: {
        'Authorization': bearerToken
      }
    })
      .then(
        async (res) => {
          if (res.ok) {
            var json = await res.json();
            if (json._embedded === undefined) {
              return null;
            } else {
              return json._embedded.appUserList;
            }
          } else if (res.status === 403) {
            throw new ForbiddenError("Forbidden");
          } else {
            throw new ServerError("Unexpected server response: " + res.status);
          }
        },
        (error) => {
          throw new Error("Error fetching available friends: " + error.message);
        }
      );

    if (friendsListJson == null) {
      return new Array<User>();
    }

    return FriendClient.parseFriendListJson(friendsListJson);
  }

  static async getFriends(bearerToken: string): Promise<Array<Friend>> {
    let friendListJson = await fetch("/api/friend", {
      method: 'GET',
      headers: {
        'Authorization': bearerToken
      }
    })
      .then(
        async (res) => {
          if (res.ok) {
            var json = await res.json();
            if (json._embedded === undefined) {
              return null;
            } else {
              return json._embedded.appUserList;
            }
          } else if (res.status === 403) {
            throw new ForbiddenError("Forbidden");
          } else {
            throw new ServerError("Unexpected server response: " + res.status);
          }
        },
        (error) => {
          throw new Error("Error fetching friends: " + error.message);
        }
      );

    if (friendListJson == null) {
      return new Array<Friend>();
    }

    return FriendClient.parseFriendListJson(friendListJson);
  }

  static async getFriendRequests(bearerToken: string): Promise<Array<FriendRequest>> {
    let requestJson = await fetch('/api/friend/request', {
      method: 'GET',
      headers: {
        'Authorization': bearerToken
      }
    })
      .then(
        async (res) => {
          switch (res.status) {
            case 200:
              var json = await res.json();
              if (json._embedded === undefined) {
                return null;
              } else {
                return json._embedded.friendRequestDTOList;
              }
            case 403:
              throw new ForbiddenError("Forbidden");
            default:
              throw new ServerError("Unexpected server response: " + res.status);
          }
        },
        (error) => {
          throw new Error("Error fetching requests: " + error.message);
        }
      );

    if (requestJson == null) {
      return new Array<FriendRequest>();
    }

    return requestJson.map((request: any) => {
      var req = new FriendRequest();
      req.sourceName = request.sourceName;
      req.sourceUsername = request.sourceUsername;
      req.targetName = request.targetName;
      req.targetUsername = request.targetUsername;
      req.timestamp = new Date(request.timestamp);
      req.id = request.id;
      return req;
    });
  }

  static async requestFriendship(username: string, bearerToken: string) {
    return fetch("/api/friend/request?username=" + username, {
      method: 'POST',
      headers: {
        'Authorization': bearerToken
      }
    })
      .then(
        (res) => {
          switch (res.status) {
            case 201:
              return;
            case 403:
              throw new ForbiddenError('Forbidden');
            case 400:
              throw new BadRequestError("Invalid data");
            case 404:
              throw new NotFoundError("Request not found");
            default:
              throw new ServerError("Unexpected server response: " + res.status);
          }
        },
        (error) => {
          throw new Error("Error requesting friendship: " + error.message);
        }
      );
  }

  static async acceptFriendship(username: string, bearerToken: string) {
    return fetch("/api/friend/accept?username=" + username, {
      method: 'POST',
      headers: {
        'Authorization': bearerToken
      }
    })
      .then(
        (result) => {
          switch (result.status) {
            case 200:
              return;
            case 403:
              throw new ForbiddenError('Forbidden');
            default:
              throw new ServerError("Unexpected server response: " + result.status);
          }
        },
        (error) => {
          throw new Error("Error accepting friendship: " + error.message);
        }
      );
  }

  static async unfriend(username: string, bearerToken: string) {
    return fetch("/api/friend/remove?username=" + username, {
      method: 'DELETE',
      headers: {
        'Authorization': bearerToken
      }
    })
    .then(
      (res) => {
        if (res.status === 204) {
          return;
        } else if (res.status === 403) {
          throw new ForbiddenError('Forbidden');
        } else {
          throw new ServerError("Unexpected server response: " + res.status);
        }
      },
      (error) => {
        throw new Error("Error unfriending: " + error.message);
      }
    );
  }

  static parseFriendListJson(friendsListJson: any): Array<Friend> {
    return friendsListJson.map((f: any) => {
      var friend = new Friend();
      friend.name = f.userInfo.name;
      friend.username = f.userInfo.username;
      friend.userId = f.userId;
      friend.email = f.userInfo.email;
      friend.shifts = f.shifts;
      return friend;
    });
  }

}