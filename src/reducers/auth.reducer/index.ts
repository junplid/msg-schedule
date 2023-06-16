import { User } from "../../entities/user.entity";

export interface propsInitialState {
  isAuthenticated: boolean;
  user: User | null;
}

const initialState: propsInitialState = {
  isAuthenticated: false,
  user: null,
};

export type propsAuthActions =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" };

export const authReducer = (
  state = initialState,
  action: propsAuthActions
): propsInitialState => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };

    default:
      return state;
  }
};
