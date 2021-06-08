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
}