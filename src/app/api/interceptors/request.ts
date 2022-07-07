import { AxiosRequestConfig } from "axios";
import { store } from "../../store/configureStore";

const setToken = (config: AxiosRequestConfig) => {
  const token = store.getState().common.token;
  if (token) config.headers!.Authorization = `Bearer ${token}`;
  // TODO
};

export { setToken };
