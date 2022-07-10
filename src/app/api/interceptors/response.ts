import { AxiosError, AxiosResponse } from "axios";
import { PaginatedResult } from "../../models/pagination";
import { toast } from "react-toastify";
import { history } from "../../..";
import { setServerError } from "../../store/commonSlice";
import { logout } from "../../../features/users/userSlice";

interface ResponseError {
  errors: { [key: string]: [] };
}

const responseError = (error: AxiosError<ResponseError>) => {
  const { data, status, config, headers } = error.response!;
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
        headers["www-authenticate"]?.startsWith('Bearer error="invalid_token"')
      ) {
        logout();
        toast.error("Session expired - please login again");
      }
      break;
    case 404:
      history.push("/not-found");
      break;
    case 500:
      setServerError(data);
      history.push("/server-error");
      break;
  }
  return Promise.reject(error);
};

const addPagination = (pagination: any, response: AxiosResponse<any>) => {
  response.data = new PaginatedResult(response.data, JSON.parse(pagination));
  response.data = {};
  return response as AxiosResponse<PaginatedResult<any>>;
};

export { responseError, addPagination };
