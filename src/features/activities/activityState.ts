import { Activity } from "../../app/models/activity";
import { Pagination, PagingParams } from "../../app/models/pagination";

export type ActivityFilter = "all" | "isHost" | "isGoing";

export interface ActivityState {
  activityRegistry: { [key: string]: Activity };
  selectedActivity: Activity | undefined;
  isEditMode: boolean;
  isLoading: boolean;
  isLoadingInitial: boolean;
  pagination: Pagination | null;
  pagingParams: PagingParams;
  startDate: string;
  filter: ActivityFilter;
}

export const initialPagingParams = {
  pageNumber: 1,
  pageSize: 2,
};

export const initialState: ActivityState = {
  activityRegistry: {},
  selectedActivity: undefined,
  isEditMode: false,
  isLoading: false,
  isLoadingInitial: false,
  pagination: null,
  pagingParams: initialPagingParams,
  startDate: "",
  filter: "all",
};
