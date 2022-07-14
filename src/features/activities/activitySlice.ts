import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";
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
      const activities = await agent.Activities.list(params);
      activities.data.forEach((activity) => {
        activity.isGoing = activity.attendees!.some(
          (a) => a.username === currentUser.username
        );
        activity.isHost = activity.hostUsername === currentUser.username;
        activity.host = activity.attendees?.find(
          (x) => x.username === activity.hostUsername
        );
      });
      return activities;
    } catch (error: any) {
      console.log("error is ", error);
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const loadActivityAsync = createAsyncThunk<
  Activity,
  string,
  { state: RootState }
>(
  "activities/loadActivityAsync",
  async (id, { rejectWithValue, dispatch, getState }) => {
    dispatch(setLoadingInitial(true));
    const currentUser = getState().user.user!;
    try {
      const activity = await agent.Activities.details(id);
      activity.isGoing = activity.attendees!.some(
        (a) => a.username === currentUser.username
      );
      activity.isHost = activity.hostUsername === currentUser.username;
      activity.host = activity.attendees?.find(
        (x) => x.username === activity.hostUsername
      );
      return activity;
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
  async (activity, { getState, rejectWithValue }) => {
    try {
      await agent.Activities.create(activity);
      const newActivity = mapActivityFormValueToActivity(activity);
      const currentUser = getState().user.user!;
      newActivity.date = new Date(newActivity.date!).toISOString();
      const attendee = mapUserToProfile(currentUser!);
      newActivity.hostUsername = currentUser!.username;
      newActivity.attendees = [attendee];
      newActivity.isGoing = newActivity.attendees!.some(
        (a) => a.username === currentUser.username
      );
      newActivity.isHost = newActivity.hostUsername === currentUser.username;
      newActivity.host = newActivity.attendees?.find(
        (x) => x.username === newActivity.hostUsername
      );

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
    },
    setFilter: (state, action: PayloadAction<ActivityFilter>) => {
      state.filter = action.payload;
    },
    setSelectedActivity: (state, action) => {
      state.selectedActivity = action.payload;
    },
    setLoadingInitial: (state, action) => {
      state.loadingInitial = action.payload;
    },
    setPagingParams: (state, action) => {
      state.pagingParams.pageNumber = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },

    updateAttendeeFollowing: (state, action) => {
      state.activities.forEach((activity) => {
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
    presetActivities: (state) => {
      state.startDate = "";
      state.activities = [];
      state.pagingParams = {
        pageNumber: 1,
        pageSize: 2,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadActivitiesAsync.pending, (state, action) => {
      state.loadingInitial = true;
    });
    builder.addCase(loadActivitiesAsync.fulfilled, (state, action) => {
      state.activities = [...state.activities, ...action.payload.data];
      console.log("size: ", state.activities.length);
      state.pagination = action.payload.pagination;
      const activitiesByDate = Object.values(state.activities).sort((a, b) => {
        return new Date(a.date!).getTime() - new Date(b.date!).getTime();
      });

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
      console.log("activities ", state.activities);
    });
    builder.addCase(loadActivitiesAsync.rejected, (state) => {
      state.loadingInitial = false;
    });
    builder.addCase(loadActivityAsync.pending, (state, action) => {
      const activity = state.activities.find(
        (activity) => activity.id === action.meta.arg
      );

      if (activity) {
        state.selectedActivity = activity;
      }
    });
    builder.addCase(loadActivityAsync.fulfilled, (state, action) => {
      state.selectedActivity = action.payload;
      state.activities = state.activities.map((activity) =>
        activity.id === action.payload.id ? action.payload : activity
      );
      state.loadingInitial = false;
    });
    builder.addCase(loadActivityAsync.rejected, (state, action) => {
      state.loadingInitial = false;
    });
    builder.addCase(createActivityAsync.fulfilled, (state, action) => {
      state.selectedActivity = action.payload;
      state.activities = state.activities.map((activity) =>
        activity.id === action.payload.id ? action.payload : activity
      );
    });
    builder.addCase(updateActivityAsync.fulfilled, (state, action) => {
      const activity = action.meta.arg;
      if (activity.id) {
        let oldActivity = state.activities.find(
          (activity) => activity.id === action.meta.arg.id
        );
        let updatedActivity = {
          ...oldActivity,
          ...activity,
        } as Activity;
        state.activities = [...state.activities, updatedActivity];
        state.selectedActivity = updatedActivity as Activity;
      }
    });
    builder.addCase(deleteActivityAsync.fulfilled, (state, action) => {
      state.activities = state.activities.filter(
        (activity) => activity.id !== action.meta.arg.id
      );

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

      state.activities = state.activities.map((activity) =>
        activity.id === state.selectedActivity!.id
          ? state.selectedActivity!
          : activity
      );
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

      state.activities = state.activities.map((activity) =>
        activity.id === state.selectedActivity!.id
          ? state.selectedActivity!
          : activity
      );
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
  updateAttendeeFollowing,
  clearSelectedActivity,
  setStartDate,
  setFilter,
  setPagination,
  presetActivities,
} = activitiesSlice.actions;
