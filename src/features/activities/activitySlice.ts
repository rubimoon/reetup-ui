import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";
import agent from "../../app/api/agent";
import {
  mapActivityFormValueToActivity,
  mapUserToProfile,
} from "../../app/common/utils/mapper";
import { setError } from "../../app/errors/errorSlice";
import { Activity, ActivityFormValues } from "../../app/models/activity";
import { PaginatedResult, PagingParams } from "../../app/models/pagination";
import { User } from "../../app/models/user";
import { RootState } from "../../app/store/configureStore";
import {
  ActivityFilter,
  initialPagingParams,
  initialState,
} from "./activityState";

export const loadActivitiesAsync = createAsyncThunk<
  PaginatedResult<Activity[]>,
  {
    currentUser: User;
    startDate: string;
    filter: ActivityFilter;
    pagingParams: PagingParams;
  },
  { state: RootState }
>(
  "activities/loadActivitiesAsync",
  async ({ currentUser, startDate, filter, pagingParams }, thunkAPI) => {
    const params = generateAxiosParams(pagingParams, filter, startDate);
    try {
      return await agent.Activities.list(params);
    } catch (error: any) {
      thunkAPI.dispatch(setError(error.status));
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const loadActivityAsync = createAsyncThunk<
  Activity,
  { currentUser: User; id: string },
  { state: RootState }
>("activities/loadActivityAsync", async ({ currentUser, id }, thunkAPI) => {
  try {
    return await agent.Activities.details(id);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const createActivityAsync = createAsyncThunk<
  ActivityFormValues,
  { currentUser: User; activity: ActivityFormValues },
  { state: RootState }
>(
  "activities/createActivityAsync",
  async ({ currentUser, activity }, { getState, rejectWithValue }) => {
    try {
      await agent.Activities.create(activity);
      return activity;
    } catch (error: any) {
      return rejectWithValue({ error: error.data });
    }
  }
);

export const updateActivityAsync = createAsyncThunk<
  void,
  { currentUser: User; activity: ActivityFormValues },
  { state: RootState }
>(
  "activities/updateActivityAsync",
  async ({ currentUser, activity }, thunkAPI) => {
    try {
      return await agent.Activities.update(activity);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
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
  Activity,
  { state: RootState }
>(
  "activities/cancelActivityToggleAsync",
  async (selectedActivity, thunkAPI) => {
    try {
      return await agent.Activities.attend(selectedActivity.id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    setStartDate: (state, action) => {
      state.startDate = action.payload;
      state.retainState = false;
    },
    setFilter: (state, action: PayloadAction<ActivityFilter>) => {
      state.filter = action.payload;
      state.retainState = false;
    },
    setRetainState: (state) => {
      state.retainState = true;
    },

    setPagingParams: (state, action) => {
      state.pagingParams.pageNumber = action.payload;
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
    clearSelectedActivity: (state) => {
      state.selectedActivity = undefined;
    },
    resetActivityRegistry: (state) => {
      state.startDate = "";
      state.activityRegistry = {};
      state.pagingParams = initialPagingParams;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadActivitiesAsync.pending, (state) => {
      state.loadingInitial = true;
    });
    builder.addCase(loadActivitiesAsync.fulfilled, (state, action) => {
      const activities = action.payload.data;
      const currentUser = action.meta.arg.currentUser;

      const ob = activities.reduce((acc, activity) => {
        setActivityUser(currentUser, activity);
        return { ...acc, [activity.id]: activity };
      }, {});

      state.activityRegistry = { ...state.activityRegistry, ...ob };
      state.pagination = action.payload.pagination;
      const activitiesByDate = Object.values(state.activityRegistry).sort(
        (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
      );

      const arr = Object.entries(
        activitiesByDate.reduce((activities, activity) => {
          const date = format(new Date(activity.date!), "dd MMM yyyy");
          activities[date] = activities[date]
            ? [...activities[date], activity]
            : [activity];
          return activities;
        }, {} as { [key: string]: Activity[] })
      );
      state.groupedActivities = arr;
      state.loadingInitial = false;
    });
    builder.addCase(loadActivitiesAsync.rejected, (state, action) => {
      state.loadingInitial = false;
    });
    builder.addCase(loadActivityAsync.pending, (state) => {
      state.loadingInitial = true;
    });
    builder.addCase(loadActivityAsync.fulfilled, (state, action) => {
      const activity = action.payload;
      const currentUser = action.meta.arg.currentUser;
      setActivityUser(currentUser, activity);
      state.selectedActivity = activity;
      state.loadingInitial = false;
    });
    builder.addCase(loadActivityAsync.rejected, (state) => {
      state.loadingInitial = false;
    });
    builder.addCase(createActivityAsync.fulfilled, (state, action) => {
      const newActivity = mapActivityFormValueToActivity(
        action.meta.arg.activity
      );
      const currentUser = action.meta.arg.currentUser!;

      const attendee = mapUserToProfile(currentUser);
      newActivity.hostUsername = currentUser.username;
      newActivity.attendees = [attendee];
      setActivityUser(currentUser, newActivity);
      state.activityRegistry[newActivity.id] = newActivity;
      state.selectedActivity = newActivity;
      state.loadingInitial = false;
      state.retainState = false;
    });

    builder.addCase(updateActivityAsync.fulfilled, (state, action) => {
      const updatedActivity = mapActivityFormValueToActivity(
        action.meta.arg.activity
      );
      const currentUser = action.meta.arg.currentUser!;

      const attendee = mapUserToProfile(currentUser);
      updatedActivity.hostUsername = currentUser.username;
      updatedActivity.attendees = [attendee];
      setActivityUser(currentUser, updatedActivity);
      state.activityRegistry[updatedActivity.id] = updatedActivity;
      state.selectedActivity = updatedActivity;
      state.retainState = false;
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

function setActivityUser(user: User, activity: Activity) {
  activity.isGoing = activity.attendees!.some(
    (a) => a.username === user.username
  );
  activity.isHost = activity.hostUsername === user.username;
  activity.host = activity.attendees?.find(
    (x) => x.username === activity.hostUsername
  );
}

function generateAxiosParams(
  pagingParams: PagingParams,
  filter: string,
  startDate: string
) {
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
      case "all":
        params.append("all", "true");
    }
  }
  return params;
}

export const {
  setRetainState,
  setPagingParams,
  updateAttendeeFollowing,
  clearSelectedActivity,
  setStartDate,
  setFilter,
  resetActivityRegistry,
} = activitiesSlice.actions;
