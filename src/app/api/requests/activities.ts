import axios from "axios";
import { Activity, ActivityFormValues } from "../../models/activity";
import { PaginatedResult } from "../../models/pagination";
import { requests, responseBody } from "./base";

export const Activities = {
  list: (params: URLSearchParams) =>
    axios
      .get<PaginatedResult<Activity[]>>("/activities", { params })
      .then(responseBody),
  details: (id: string) => requests.get<Activity>(`/activities/${id}`),
  create: (activity: ActivityFormValues) =>
    requests.post<void>("/activities", activity),
  update: (activity: ActivityFormValues) =>
    requests.put<void>(`/activities/${activity.id}`, activity),
  delete: (id: string) => requests.del<void>(`/activities/${id}`),
  attend: (id: string) => requests.post<void>(`/activities/${id}/attend`, {}),
};
