import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { delay } from "../common/utils";
import { store } from "../store/configureStore";
import { Account, Activities, Profiles } from "./requests";

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
    const { data, status } = error.response! as AxiosResponse;
    switch (status) {
      case 400:
        if (data.errors) {
          const modelStateErrors: string[] = [];
          for (const key in data.errors) {
            if (data.errors[key]) {
              modelStateErrors.push(data.errors[key]);
            }
          }
          throw modelStateErrors.flat();
        }
        toast.error(data.title);
        break;
      case 401:
        toast.error(data.title);
        break;
      case 403:
        toast.error("You are not allowed to do that!");
        break;
      default:
        break;
    }
    return Promise.reject(error.response);
  }
);

const agent = {
  Activities,
  Account,
  Profiles,
};

export default agent;
