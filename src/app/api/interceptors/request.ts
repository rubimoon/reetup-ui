import { AxiosRequestConfig } from "axios";

const setToken = (config: AxiosRequestConfig, token: string) => {
  config.headers!.Authorization = `Bearer ${token}`;
  // TODO
};

export { setToken };
