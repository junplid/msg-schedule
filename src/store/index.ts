import { Store, legacy_createStore as createStore } from "redux";
import { rootReducer, propsRootReducer } from "../reducers";

const store: Store<propsRootReducer> = createStore(rootReducer);

export default store;
