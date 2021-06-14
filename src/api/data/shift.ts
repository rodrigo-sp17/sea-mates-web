import { parseISO } from "date-fns";

export default class Shift {
  shiftId: number;
  unavailabilityStartDate: Date;
  boardingDate: Date;
  leavingDate: Date;
  unavailabilityEndDate: Date;
  cycleDays: number;
  repeat: number;

  constructor() {
    this.shiftId = 0;
    this.unavailabilityStartDate = new Date();
    this.boardingDate = new Date();
    this.leavingDate = new Date();
    this.unavailabilityEndDate = new Date();
    this.cycleDays = 0;
    this.repeat = 0;
  }

  static parseJson(shiftJson: any): Shift {
    var shift = new Shift();
    shift.shiftId = shiftJson.shiftId;
    shift.unavailabilityStartDate = parseISO(shiftJson.unavailabilityStartDate);
    shift.boardingDate = parseISO(shiftJson.boardingDate);
    shift.leavingDate = parseISO(shiftJson.leavingDate);
    shift.unavailabilityEndDate = parseISO(shiftJson.unavailabilityEndDate);
    return shift;
  }
}