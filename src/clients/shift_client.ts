import Shift from "data/shift";
import ForbiddenError from "errors/forbidden_error";
import NotFoundError from "errors/not_found_error";
import ServerError from "errors/server_error";

export default class ShiftClient {

  static async getShifts(bearerToken: string): Promise<Array<Shift>> {
    return fetch("/api/shift", {
      method: 'GET',
      headers: {          
        'Authorization': bearerToken
      }
    })
    .then(
      async (res) => {
        if (res.ok) {
          var json = await res.json();
          let newShifts = json._embedded;
          if (newShifts === undefined) {
            return new Array<Shift>();
          } else {
            return newShifts.shiftList;
          }
        } else if (res.status == 403) {
          throw new ForbiddenError('Forbidden');
        } else {
          throw new ServerError("Unexpected server response, code: " + res.status);
        } 
      },
      (error) => {
        throw new Error("Error getting shifts: " + error.message);
      }
    );
  }

  static async addShift(shift: Shift, bearerToken: string) {
    return fetch("/api/shift/add", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Authorization': bearerToken
      },
      body: JSON.stringify({
        "unavailabilityStartDate": shift.unavailabilityStartDate,
        "boardingDate": shift.boardingDate,
        "leavingDate": shift.leavingDate,
        "unavailabilityEndDate": shift.unavailabilityEndDate,
        "cycleDays": shift.cycleDays,
        "repeat": shift.repeat
      })
    })
    .then(
      (res) => {
        if (res.ok) {
          return;
        } else if (res.status === 403) {
          throw new ForbiddenError('Forbidden');
        } else {
          throw new ServerError("Unexpected server response, code: " + res.status);
        }
      },
      (err) => {
        throw new Error("Error adding shifts: " + err.message);
      }
    );
  }

  static async deleteShift(shiftId: number, bearerToken: string) {
    return fetch("/api/shift/remove?id=" + shiftId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Authorization': bearerToken
      }
    })
    .then(
      (res) => {
        switch (res.status) {
          case 204:
            return;
          case 403:
            throw new ForbiddenError('Forbidden');
          case 404:
            throw new NotFoundError('Shift not found');
          default:
            throw new ServerError('Unexpected server response, code: ' + res.status);
        }
      },
      (err) => {
        throw new Error("Error deleting shifts: " + err.message);
      }
    );
  }
}