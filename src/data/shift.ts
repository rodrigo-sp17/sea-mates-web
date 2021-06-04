export default class Shift {
    shiftId: number;
    unavailabilityStartDate: Date;
    boardingDate: Date;
    leavingDate: Date;
    unavailabilityEndDate: Date;

    constructor() {
        this.shiftId = 0;
        this.unavailabilityStartDate = new Date();
        this.boardingDate = new Date();
        this.leavingDate = new Date();
        this.unavailabilityEndDate = new Date();
    }
}