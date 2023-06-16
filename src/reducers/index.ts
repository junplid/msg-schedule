import { combineReducers } from "redux-immutable";
import { propsInitialState, authReducer } from "./auth.reducer";

export interface propsRootReducer {
  auth: propsInitialState;
}

export const rootReducer = combineReducers<propsRootReducer>({
  auth: authReducer,
});
