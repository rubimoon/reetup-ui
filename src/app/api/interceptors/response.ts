import { AxiosError, AxiosResponse } from "axios";
import { store } from "../../store/configureStore";
import { toast } from "react-toastify";
import { history } from "../../..";
import { setServerError, setToken } from "../../store/commonSlice";
import { logout } from "../../../features/users/userSlice";
import { delay } from "../../common/utils";

const getPagination = async (response: AxiosResponse) => {
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
};

const responseError = (error: AxiosError) => {
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
        headers["www-authenticate"]?.startsWith('Bearer error="invalid_token"')
      ) {
        store.dispatch(logout());
        store.dispatch(setToken(null));
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
};

export { responseError, getPagination };
