import ShiftClient from "api/clients/shift_client";
import Shift from "api/data/shift";
import ForbiddenError from "api/errors/forbidden_error";
import NotFoundError from "api/errors/not_found_error";
import ServerError from "api/errors/server_error";
import { useHistory } from "react-router";
import { atom, selector, useRecoilValue, useSetRecoilState } from "recoil"
import { userState } from "./user_model";

///////////////////////////////////////////////////
//  State Selectors and Atoms
///////////////////////////////////////////////////
export const shiftRequestIDState = atom({
  key: "ShiftRequestID",
  default: 0
});

export const shiftListState = selector<Array<Shift>>({
  key: "shiftListState",
  get: async ({ get }) => {
    get(shiftRequestIDState);
    let bearerToken = get(userState).bearerToken;
    return ShiftClient.getShifts(bearerToken);
  }
});

export const checkedShiftState = atom<Set<number>>({
  key: "checkedShiftState",
  default: new Set<number>()
});


///////////////////////////////////////////////////
//  Actions
///////////////////////////////////////////////////
export const useShiftModel = () => {
  const history = useHistory();
  const user = useRecoilValue(userState);
  const setRequestId = useSetRecoilState(shiftRequestIDState);

  const serverErrorMsg = "Ops, algo de errado aconteceu com o servidor...";
  const appErrorMsg = "Desculpe, um erro inesperado aconteceu!";

  const reloadShifts = () => {
    setRequestId((requestId) => requestId + 1);
  }

  const addShift = async (shift: Shift): Promise<string|null> => {
    try {
      await ShiftClient.addShift(shift, user.bearerToken);
      reloadShifts();
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

  const deleteShift = async (shiftId: number): Promise<string|null> => {
    try {
      await ShiftClient.deleteShift(shiftId, user.bearerToken);
      reloadShifts();
      return null;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        history.push('/login');
        return 'Acesso negado';
      } else if (err instanceof NotFoundError) {
        return 'Escala não encontrada';
      } else if (err instanceof ServerError) {
        return serverErrorMsg;
      } else {
        return appErrorMsg;
      }
    }
  }

  return {reloadShifts, addShift, deleteShift};
}

