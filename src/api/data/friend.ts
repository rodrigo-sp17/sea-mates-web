import Shift from "./shift";
import User from "./user";

export default class Friend extends User {
  shifts: Array<Shift> = [];
}