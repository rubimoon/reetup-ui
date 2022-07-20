import { AxiosRequestConfig } from "axios";
import { store } from "../../store/configureStore";

const setTokenHeader = (config: AxiosRequestConfig) => {
  const token = store.getState().common.token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export { setTokenHeader };
