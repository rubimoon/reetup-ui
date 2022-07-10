import axios from "axios";
import { delay } from "../common/utils";
import { setToken } from "./interceptors/request";
import { addPagination, responseError } from "./interceptors/response";
import { Account, Activities, Profiles } from "./requests";

// axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.baseURL = "http://localhost:5001/api";
// axios.interceptors.request.use((config) => {
//   const token = useAppSelector((state) => state.common.token);
//   if (token) setToken(config, token);
//   return config;
// });

axios.interceptors.response.use(async (response) => {
  if (process.env.NODE_ENV === "development") await delay(1000);
  const pagination = response.headers["pagination"];
  if (pagination) return addPagination(pagination, response);
  return response;
}, responseError);

const agent = {
  Activities,
  Account,
  Profiles,
};

export default agent;
