import axios from "axios";
import { Account, Activities, Profiles } from "./requests";
import { getPagination, responseError } from "./interceptors/response";
import { setTokenHeader } from "./interceptors/request";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

axios.interceptors.request.use(setTokenHeader);
axios.interceptors.response.use(getPagination, responseError);

const agent = {
  Activities,
  Account,
  Profiles,
};

export default agent;
