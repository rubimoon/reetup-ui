import { Activity } from "../../app/models/activity";
import { Pagination, PagingParams } from "../../app/models/pagination";

export type ActivityFilter = "all" | "isHost" | "isGoing";

export interface ActivityState {
  activityRegistry: { [key: string]: Activity };
  groupedActivities: [string, Activity[]][];
  selectedActivity: Activity | undefined;
  editMode: boolean;
  loading: boolean;
  loadingInitial: boolean;
  pagination: Pagination | null;
  pagingParams: PagingParams;
  startDate: string;
  filter: ActivityFilter;
  retainState: boolean;
}

export const initialPagingParams = {
  pageNumber: 1,
  pageSize: 2,
};

export const initialState: ActivityState = {
  activityRegistry: {},
  selectedActivity: undefined,
  editMode: false,
  loading: false,
  loadingInitial: false,
  pagination: null,
  pagingParams: initialPagingParams,
  startDate: "",
  filter: "all",
  groupedActivities: [],
  retainState: false,
};
