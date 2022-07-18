import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { delay } from "../common/utils";
import { store } from "../store/configureStore";
import { Account, Activities, Profiles } from "./requests";
import { history } from "../..";
import { logout } from "../../features/users/userSlice";
import { setServerError } from "../store/commonSlice";

// axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.baseURL = "http://localhost:5000/api";

axios.interceptors.request.use((config) => {
  const token = store.getState().common.token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  async (response) => {
    if (process.env.NODE_ENV === "development") await delay(100);
    const pagination = response.headers["pagination"];
    if (pagination) {
      response.data = {
        data: response.data,
        pagination: JSON.parse(pagination),
      };
      return response;
    }
    return response;
  },
  (error: AxiosError) => {
    const { data, status, config, headers } = error.response! as AxiosResponse;
    switch (status) {
      case 400:
        if (config.method === "get" && data.errors.hasOwnProperty("id")) {
          history.push("/not-found");
        }
        if (data.errors) {
          const modalStateErrors = [];
          for (const key in data.errors) {
            if (data.errors[key]) {
              modalStateErrors.push(data.errors[key]);
            }
          }
          throw modalStateErrors.flat();
        } else {
          toast.error(data);
        }
        break;
      case 401:
        if (
          status === 401 &&
          headers["www-authenticate"]?.startsWith(
            'Bearer error="invalid_token"'
          )
        ) {
          store.dispatch(logout());
          toast.error("Session expired - please login again");
        }
        break;
      case 404:
        history.push("/not-found");
        break;
      case 500:
        store.dispatch(setServerError(data));
        history.push("/server-error");
        break;
    }
    return Promise.reject(error);
  }
);

const agent = {
  Activities,
  Account,
  Profiles,
};

export default agent;
