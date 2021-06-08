import ShiftClient from "clients/shift_client";
import Shift from "data/shift";
import ForbiddenError from "errors/forbidden_error";
import NotFoundError from "errors/not_found_error";
import ServerError from "errors/server_error";
import { useHistory } from "react-router";
import { atom, useRecoilValue, useSetRecoilState } from "recoil"
import { userState } from "./user_model";

///////////////////////////////////////////////////
//  State Selectors and Atoms
///////////////////////////////////////////////////
export const shiftListLoadedState = atom<boolean>({
  key: "shiftListLoadedState",
  default: false
});

export const shiftListState = atom<Array<Shift>>({
  key: "shiftListState",
  default: []
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
  const setShifts = useSetRecoilState<Array<Shift>>(shiftListState);

  const serverErrorMsg = "Ops, algo de errado aconteceu com o servidor...";
  const appErrorMsg = "Desculpe, um erro inesperado aconteceu!";

  if (user == null) {
    history.push('/login');
    throw new Error('No user logged');    
  }

  const reloadShifts = async () => {
    try {
      var shifts = await ShiftClient.getShifts(user.bearerToken);
      setShifts(shifts);
      return null;
    } catch (err) {
      return;
    }
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

