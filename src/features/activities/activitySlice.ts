import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import {
  mapActivityFormValueToActivity,
  mapUserToProfile,
} from "../../app/common/utils/mapper";
import { Activity, ActivityFormValues } from "../../app/models/activity";
import { PaginatedResult, PagingParams } from "../../app/models/pagination";
import { User } from "../../app/models/user";
import { RootState } from "../../app/store/configureStore";
import { ActivityFilter, initialState } from "./activityState";

export const loadActivitiesAsync = createAsyncThunk<
  PaginatedResult<Activity[]>,
  { startDate: string; filter: ActivityFilter; pagingParams: PagingParams },
  { state: RootState }
>(
  "activities/loadActivitiesAsync",
  async ({ startDate = "", filter = "all", pagingParams }, thunkAPI) => {
    const params = new URLSearchParams();
    params.append("pageNumber", pagingParams.pageNumber!.toString());
    params.append("pageSize", pagingParams.pageSize!.toString());
    if (startDate) {
      params.append("startDate", startDate);
    } else {
      switch (filter) {
        case "isGoing":
          params.append("isGoing", "true");
          break;
        case "isHost":
          params.append("isHost", "true");
          break;
        default:
          params.append("all", "true");
      }
    }

    const currentUser = thunkAPI.getState().user.user!;
    try {
      const result = await agent.Activities.list(params);
      result.data.forEach((activity) => {
        thunkAPI.dispatch(setActivity({ activity, currentUser }));
      });
      return result;
    } catch (error: any) {
      console.log("error is ", error);
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const loadActivityAsync = createAsyncThunk<
  void,
  string,
  { state: RootState }
>(
  "activities/loadActivityAsync",
  async (id, { rejectWithValue, dispatch, getState }) => {
    dispatch(setLoadingInitial(true));
    const currentUser = getState().user.user!;
    try {
      const activity = await agent.Activities.details(id);
      dispatch(setActivity({ activity, currentUser }));
      dispatch(setSelectedActivity(activity));
      return;
    } catch (error: any) {
      return rejectWithValue({ error: error.data });
    }
  },
  {
    condition: (id, thunkAPI) => {
      const { selectedActivity } = thunkAPI.getState().activities;
      return !selectedActivity;
    },
  }
);

export const createActivityAsync = createAsyncThunk<
  Activity,
  ActivityFormValues,
  { state: RootState }
>(
  "activities/createActivityAsync",
  async (activity, { getState, rejectWithValue, dispatch }) => {
    try {
      await agent.Activities.create(activity);
      const newActivity = mapActivityFormValueToActivity(activity);
      const currentUser = getState().user.user!;
      newActivity.date = new Date(newActivity.date!).toISOString();
      const attendee = mapUserToProfile(currentUser!);
      newActivity.hostUsername = currentUser!.username;
      newActivity.attendees = [attendee];

      dispatch(setActivity({ activity: newActivity, currentUser }));
      return newActivity;
    } catch (error: any) {
      return rejectWithValue({ error: error.data });
    }
  }
);

export const updateActivityAsync = createAsyncThunk<void, ActivityFormValues>(
  "activities/updateActivityAsync",
  async (activity, { rejectWithValue }) => {
    try {
      await agent.Activities.update(activity);
    } catch (error: any) {
      return rejectWithValue({ error: error.data });
    }
  }
);

export const deleteActivityAsync = createAsyncThunk<void, { id: string }>(
  "activities/deleteActivityAsync",
  async ({ id }, { rejectWithValue }) => {
    try {
      await agent.Activities.delete(id);
    } catch (error: any) {
      return rejectWithValue({ error: error.data });
    }
  }
);

export const updateAttendanceAsync = createAsyncThunk<
  void,
  { currentUser: User },
  { state: RootState }
>("activities/updateAttendanceAsync", async (_, thunkAPI) => {
  const { selectedActivity } = thunkAPI.getState().activities;
  try {
    await agent.Activities.attend(selectedActivity!.id);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const cancelActivityToggleAsync = createAsyncThunk<
  void,
  void,
  { state: RootState }
>("activities/cancelActivityToggleAsync", async (_, thunkAPI) => {
  try {
    const activity = thunkAPI.getState().activities.selectedActivity!;
    return await agent.Activities.attend(activity.id);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    setStartDate: (state, action) => {
      state.startDate = action.payload;
      state.activityRegistry = {};
    },
    setFilter: (state, action: PayloadAction<ActivityFilter>) => {
      state.startDate = "";
      state.filter = action.payload;
      state.activityRegistry = {};
    },
    setSelectedActivity: (state, action) => {
      state.selectedActivity = action.payload;
    },
    setLoadingInitial: (state, action) => {
      state.loadingInitial = action.payload;
    },
    setPagingParams: (state, action) => {
      state.activityRegistry = {};
      state.pagingParams.pageNumber = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },

    setActivity: (
      state,
      action: PayloadAction<{ currentUser: User; activity: Activity }>
    ) => {
      const { currentUser, activity } = action.payload;
      if (currentUser) {
        activity.isGoing = activity.attendees!.some(
          (a) => a.username === currentUser.username
        );
        activity.isHost = activity.hostUsername === currentUser.username;
        activity.host = activity.attendees?.find(
          (x) => x.username === activity.hostUsername
        );
      }
      state.activityRegistry[activity.id] = activity;
    },
    updateAttendeeFollowing: (state, action) => {
      Object.values(state.activityRegistry).forEach((activity) => {
        activity.attendees.forEach((attendee) => {
          if (attendee.username === action.payload) {
            attendee.following
              ? attendee.followersCount--
              : attendee.followersCount++;
            attendee.following = !attendee.following;
          }
        });
      });
    },
    clearFilter: (state) => {},
    clearSelectedActivity: (state) => {
      state.selectedActivity = undefined;
    },
    clearActivityRegistry: (state) => {
      state.activityRegistry = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadActivitiesAsync.pending, (state, action) => {
      state.loadingInitial = true;
    });
    builder.addCase(loadActivitiesAsync.fulfilled, (state, action) => {
      state.pagination = action.payload.pagination;
      state.loadingInitial = false;
    });
    builder.addCase(loadActivitiesAsync.rejected, (state) => {
      state.loadingInitial = false;
    });
    builder.addCase(loadActivityAsync.pending, (state, action) => {
      const activity = state.activityRegistry[action.meta.arg];

      if (activity) {
        state.selectedActivity = activity;
      }
    });
    builder.addCase(loadActivityAsync.fulfilled, (state, action) => {
      state.loadingInitial = false;
    });
    builder.addCase(loadActivityAsync.rejected, (state, action) => {
      state.loadingInitial = false;
    });
    builder.addCase(createActivityAsync.fulfilled, (state, action) => {
      state.selectedActivity = action.payload;
    });
    builder.addCase(updateActivityAsync.fulfilled, (state, action) => {
      const activity = action.meta.arg;
      if (activity.id) {
        let oldActivity = state.activityRegistry[activity.id];
        let updatedActivity = {
          ...oldActivity,
          ...activity,
        };
        state.activityRegistry[activity.id] = updatedActivity;
        state.selectedActivity = updatedActivity as Activity;
      }
    });
    builder.addCase(deleteActivityAsync.fulfilled, (state, action) => {
      delete state.activityRegistry[action.meta.arg.id];
      state.loading = false;
    });
    builder.addCase(deleteActivityAsync.rejected, (state, action) => {
      state.loading = false;
    });
    builder.addCase(updateAttendanceAsync.fulfilled, (state, action) => {
      const user = action.meta.arg.currentUser;
      if (state.selectedActivity?.isGoing) {
        state.selectedActivity.attendees =
          state.selectedActivity.attendees?.filter(
            (a) => a.username !== user?.username
          );
        state.selectedActivity.isGoing = false;
      } else {
        const attendee = mapUserToProfile(user!);
        state.selectedActivity?.attendees?.push(attendee);
        state.selectedActivity!.isGoing = true;
      }
      state.activityRegistry[state.selectedActivity!.id] =
        state.selectedActivity!;
    });
    builder.addCase(updateAttendanceAsync.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(cancelActivityToggleAsync.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(cancelActivityToggleAsync.fulfilled, (state) => {
      state.selectedActivity!.isCancelled =
        !state.selectedActivity?.isCancelled;
      state.activityRegistry[state.selectedActivity!.id] =
        state.selectedActivity!;

      state.loading = false;
    });
    builder.addCase(cancelActivityToggleAsync.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const {
  setLoadingInitial,
  setSelectedActivity,
  setPagingParams,
  setActivity,
  updateAttendeeFollowing,
  clearSelectedActivity,
  setStartDate,
  setFilter,
  setPagination,
  clearActivityRegistry,
} = activitiesSlice.actions;
