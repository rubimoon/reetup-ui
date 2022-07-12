import { Activity } from "../../app/models/activity";
import { Pagination, PagingParams } from "../../app/models/pagination";
import { User } from "../../app/models/user";

export interface ActivityState {
  activityRegistry: { [key: string]: Activity };
  selectedActivity: Activity | undefined;
  editMode: boolean;
  loading: boolean;
  loadingInitial: boolean;
  pagination: Pagination | null;
  pagingParams: PagingParams;
  predicate: { [key: string]: any };
  startDate: string;
  filter: { [key: string]: boolean };
}

export const initialState: ActivityState = {
  activityRegistry: {},
  selectedActivity: undefined,
  editMode: false,
  loading: false,
  loadingInitial: false,
  pagination: null,
  pagingParams: {
    pageNumber: 1,
    pageSize: 2,
  },
  predicate: { all: true },
  startDate: "",
  filter: {},
};

export interface SetActivityState {
  activity: Activity | null;
  currentUser: User | null;
}

export interface LoadActivityAsyncState {
  activity: Activity;
}
