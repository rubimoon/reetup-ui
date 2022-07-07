import { Activity } from "../../app/models/activity";
import { Pagination, PagingParams } from "../../app/models/pagination";

export interface ActivityState {
  activityRegistry: Map<string, Activity>;
  selectedActivity: Activity | undefined;
  editMode: boolean;
  loading: boolean;
  loadingInitial: boolean;
  pagination: Pagination | null;
  pagingParams: PagingParams;
  predicate: Map<any, any>;
}

export const initialState: ActivityState = {
  activityRegistry: new Map<string, Activity>(),
  selectedActivity: undefined,
  editMode: false,
  loading: false,
  loadingInitial: false,
  pagination: null,
  pagingParams: new PagingParams(),
  predicate: new Map().set("all", true),
};
