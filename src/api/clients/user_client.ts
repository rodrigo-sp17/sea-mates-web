import SocialUser from "api/data/social_user";
import User from "api/data/user";
import UserRequest from "api/data/user_request";
import BadRequestError from "api/errors/bad_request_error";
import ConflictError from "api/errors/conflict_error";
import ForbiddenError from "api/errors/forbidden_error";
import ServerError from "api/errors/server_error";

export default class UserClient {

  // Performs login for a user and returns the Bearer token
  static async login(username: string, password: string): Promise<string> {
    const url = "/login";
    const options : RequestInit = {
      method: 'POST',
      mode: 'no-cors',              
      body: JSON.stringify({
        username: username,
        password: password
      })
    };

    return await fetch(url, options)
    .then(
      (res) => {
        switch (res.status) {
          case 200:
            let bearerToken = res.headers.get("Authorization");
            if (bearerToken == null) {
              throw Error("Expected token on header");
            }
            return bearerToken;      
          case 403:
            throw new ForbiddenError("Forbidden");
          case 401:
            throw new ForbiddenError("Unauthorized")
          default:
            throw new ServerError("Unable to login, code: " + res.status);
        }
      },
      (error) => {
        throw new Error("Error while logging in");
      }
    );
  }

  // Fetches user info for the given token
  static async fetchUserInfo(bearerToken: string): Promise<User> {
    const token = bearerToken.replace("Bearer ", "");

    var json = await fetch("/api/user/me", {
      method: "GET",
      headers: {
        "Authorization": token,
      }
    })
    .then(
      (res) => {
        switch (res.status) {
          case 200:
            return res.json();            
          case 403:
            throw new ForbiddenError("Forbidden");
          default:
            throw new ServerError("Unable to fetch data");
        }
      },
      (error) => {
        throw new Error("Unable to fetch data: " + error.message);
      }
    );
    
    return {
      userId: json.userId,
      name: json.userInfo.name,
      username: json.userInfo.username,
      email: json.userInfo.email,
      bearerToken: token
    };
  }

  // Signs up a new user
  static async signup(request: UserRequest) {
    const url = "/api/user/signup";
    const options = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },    
      body: JSON.stringify({
        name: request.name,
        email: request.email,                
        username: request.username,
        password: request.password,
        confirmPassword: request.confirmPassword
      })
    };
        
    await fetch(url, options)
    .then(
      (res) => {
        switch (res.status) {
          case 201:
            return;
          case 400:
            throw new BadRequestError(JSON.stringify(res.body));
          case 409:
            throw new ConflictError("Username or email already exists");
          default:
            throw new ServerError("Unexpected server error, code: " + res.status);
        }
      },
      (error) => {
        throw new Error("Failed to signup user, error: " + error.message);
      }                             
    );
  }

  // Resets password for a user with the appropriate reset token  
  static async resetPassword(resetForm: UserRequest, token: string) {
    await fetch("/api/user/resetPassword", {
      method: 'POST',
      headers: {
        "reset": token || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: resetForm.username,
        password: resetForm.password,
        confirmPassword: resetForm.confirmPassword
      })
    })
    .then(
      (res) => {
        switch (res.status) {
          case 200:
            return;
          case 403:
            throw new ForbiddenError("Forbidden");
          case 400:
            throw new BadRequestError("Invalid data");
          default:
            throw new ServerError("Unexpected server error, code: " + res.status);
        }
      }, 
      (error) => {
        throw new Error("Failed to reset password, error: " + error.message);
      }
    );
  }

  // Starts account recovery for user
  static async recoverAccount(user: string) {
    await fetch("/api/user/recover?user=" + user, {
      method: 'POST'
    })
    .then(
      (res) => {
        if (res.ok) {
          return;
        }
      }, 
      (error) => {
        throw new Error('Error recovering account: ' + error.message);
      }
    );
  }

  // Performs social signup for a social user and returns the bearer token if successful
  static async socialSignup(user: SocialUser): Promise<string> {
    const url = "/api/user/socialSignup";
    const options = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },    
      body: JSON.stringify(user)
    };
        
    return await fetch(url, options)
    .then(
      (res) => {
        switch (res.status) {
          case 201:
            return res.headers.get("Authorization") || "";
          case 400:
            throw new BadRequestError(JSON.stringify(res.body));
          case 409:
            throw new ConflictError("Username or email already exists");
          default:
            throw new ServerError("Unexpected server error, code: " + res.status);
        }
      },
      (error) => {
        throw new Error("Failed to signup user, error: " + error.message);
      }                                  
    );
  }

  // Edits an user
  static async editUser(user: User) {
    await fetch("/api/user", {
      method: "PUT",
      headers: {
        "Authorization": user.bearerToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user.userId,
        name: user.name,
        email: user.email
      })
    })
    .then(
      (res) => {
        switch (res.status) {
          case 200:
            return;
          case 403:
            throw new ForbiddenError("Forbidden");
          case 409:
            throw new ConflictError("Username or email already exists");
          default:
            throw new ServerError("Unexpected server error, code: " + res.status);
        }
      },
      (error) => {
        throw new Error("Failed to edit user, error: " + error.message);
      }
    );
  }

  // Deletes an acconut for the user
  static async deleteAccount(user: User, password: string) {    
    await fetch("/api/user/delete", {
      method: "DELETE",
      headers: {
        "Authorization": user.bearerToken,
        "Password": password 
      }
    })
    .then(
      (res) => {
        switch (res.status) {
          case 204:
            return;
          case 403:
            throw new ForbiddenError("Forbidden");
          default:
            throw new ServerError("Unexpected server error, code: " + res.status);
        }
      },
      (error) => {
        throw new Error("Failed to delete account, error: " + error.message);
      }
    )

  }
}