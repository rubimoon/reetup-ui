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
  async ({ startDate, filter, pagingParams }, thunkAPI) => {
    const params = generateAxiosParams(pagingParams, filter, startDate);
    try {
      return await agent.Activities.list(params);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const loadActivityAsync = createAsyncThunk<
  Activity,
  { currentUser: User; id: string },
  { state: RootState }
>("activities/loadActivityAsync", async ({ id }, thunkAPI) => {
  try {
    return await agent.Activities.details(id);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const createActivityAsync = createAsyncThunk<
  void,
  { currentUser: User; activity: ActivityFormValues },
  { state: RootState }
>("activities/createActivityAsync", async ({ activity }, thunkAPI) => {
  try {
    return await agent.Activities.create(activity);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const updateActivityAsync = createAsyncThunk<
  void,
  { currentUser: User; activity: ActivityFormValues },
  { state: RootState }
>("activities/updateActivityAsync", async ({ activity }, thunkAPI) => {
  try {
    return await agent.Activities.update(activity);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const deleteActivityAsync = createAsyncThunk<void, string>(
  "activities/deleteActivityAsync",
  async (id, thunkAPI) => {
    try {
      await agent.Activities.delete(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const updateAttendanceAsync = createAsyncThunk<
  void,
  User,
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
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setFilter: (state, action: PayloadAction<ActivityFilter>) => {
      state.filter = action.payload;
    },
    setPagingNumber: (state, action: PayloadAction<number>) => {
      state.pagingParams.pageNumber = action.payload;
    },
    updateAttendeeFollowing: (state, action) => {
      Object.values(state.activityRegistry).forEach((activity) => {
        activity.attendees.forEach((attendee) => {
          if (attendee.username === action.payload) {
            attendee.isFollowing
              ? attendee.followersCount--
              : attendee.followersCount++;
            attendee.isFollowing = !attendee.isFollowing;
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
      state.isLoadingInitial = true;
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
      state.isLoadingInitial = false;
    });
    builder.addCase(loadActivitiesAsync.rejected, (state) => {
      state.isLoadingInitial = false;
    });
    builder.addCase(loadActivityAsync.pending, (state) => {
      state.isLoadingInitial = true;
    });
    builder.addCase(loadActivityAsync.fulfilled, (state, action) => {
      const activity = action.payload;
      const currentUser = action.meta.arg.currentUser;
      setActivityUser(currentUser, activity);
      state.selectedActivity = activity;
      state.isLoadingInitial = false;
    });
    builder.addCase(loadActivityAsync.rejected, (state) => {
      state.isLoadingInitial = false;
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

      state.activityRegistry = {
        ...state.activityRegistry,
        [newActivity.id]: newActivity,
      };
      state.selectedActivity = newActivity;
      state.isLoadingInitial = false;
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
      state.activityRegistry = {
        ...state.activityRegistry,
        [updatedActivity.id]: updatedActivity,
      };
      state.selectedActivity = updatedActivity;
    });
    builder.addCase(deleteActivityAsync.fulfilled, (state, action) => {
      delete state.activityRegistry[action.meta.arg];
      state.isLoading = false;
    });
    builder.addCase(deleteActivityAsync.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(updateAttendanceAsync.fulfilled, (state, action) => {
      const user = action.meta.arg;
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
      state.isLoading = false;
    });
    builder.addCase(cancelActivityToggleAsync.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(cancelActivityToggleAsync.fulfilled, (state) => {
      state.selectedActivity!.isCancelled =
        !state.selectedActivity?.isCancelled;
      state.activityRegistry[state.selectedActivity!.id] =
        state.selectedActivity!;
      state.isLoading = false;
    });
    builder.addCase(cancelActivityToggleAsync.rejected, (state) => {
      state.isLoading = false;
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
  setPagingNumber,
  updateAttendeeFollowing,
  clearSelectedActivity,
  setStartDate,
  setFilter,
  resetActivityRegistry,
} = activitiesSlice.actions;
