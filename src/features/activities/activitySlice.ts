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
  {
    currentUser: User;
    startDate: string;
    filter: ActivityFilter;
    pagingParams: PagingParams;
  },
  { state: RootState }
>(
  "activities/loadActivitiesAsync",
  async (
    { currentUser, startDate = "", filter = "all", pagingParams },
    thunkAPI
  ) => {
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

    try {
      return await agent.Activities.list(params);
    } catch (error: any) {
      console.log("error is ", error);
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const loadActivityAsync = createAsyncThunk<
  Activity,
  { currentUser: User; id: string },
  { state: RootState }
>(
  "activities/loadActivityAsync",
  async ({ currentUser, id }, { rejectWithValue, dispatch, getState }) => {
    dispatch(setLoadingInitial(true));
    try {
      return await agent.Activities.details(id);
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
  ActivityFormValues,
  { currentUser: User; activity: ActivityFormValues },
  { state: RootState }
>(
  "activities/createActivityAsync",
  async ({ currentUser, activity }, { getState, rejectWithValue }) => {
    try {
      //TODO make function
      activity.date = new Date(activity.date!).toISOString();
      await agent.Activities.create(activity);
      return activity;
    } catch (error: any) {
      return rejectWithValue({ error: error.data });
    }
  }
);

export const updateActivityAsync = createAsyncThunk<
  void,
  ActivityFormValues,
  { state: RootState }
>("activities/updateActivityAsync", async (selectedActivity, thunkAPI) => {
  try {
    console.log(selectedActivity);
    return await agent.Activities.update(selectedActivity);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

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
      const activities = action.payload.data;
      const currentUser = action.meta.arg.currentUser;

      const ob = activities.reduce((acc, activity) => {
        activity.isGoing = activity.attendees!.some(
          (a) => a.username === currentUser.username
        );
        activity.isHost = activity.hostUsername === currentUser.username;
        activity.host = activity.attendees?.find(
          (x) => x.username === activity.hostUsername
        );
        return { ...acc, [activity.id]: activity };
      }, {});

      state.activityRegistry = { ...state.activityRegistry, ...ob };

      console.log("size: ", state.activityRegistry.length);
      console.log("registry: ", state.activityRegistry);
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
      console.log("activities ", state.activityRegistry);
    });
    builder.addCase(loadActivitiesAsync.rejected, (state) => {
      state.loadingInitial = false;
    });
    builder.addCase(loadActivityAsync.pending, (state, action) => {
      const activity = Object.values(state.activityRegistry).find(
        (activity) => activity.id === action.meta.arg.id
      );
      if (activity) {
        state.selectedActivity = activity;
      }
    });
    builder.addCase(loadActivityAsync.fulfilled, (state, action) => {
      const activity = action.payload;
      const currentUser = action.meta.arg.currentUser;

      activity.isGoing = activity.attendees!.some(
        (a) => a.username === currentUser.username
      );
      activity.isHost = activity.hostUsername === currentUser.username;
      activity.host = activity.attendees?.find(
        (x) => x.username === activity.hostUsername
      );
      state.selectedActivity = activity;
      state.loadingInitial = false;
    });
    builder.addCase(loadActivityAsync.rejected, (state, action) => {
      state.loadingInitial = false;
    });
    builder.addCase(createActivityAsync.fulfilled, (state, action) => {
      console.log("createActivityAsync.fulfilled");
      const newActivity = mapActivityFormValueToActivity(
        action.meta.arg.activity
      );
      const currentUser = action.meta.arg.currentUser;

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
      state.activityRegistry = { ...state.activityRegistry, newActivity };
    });

    builder.addCase(updateActivityAsync.fulfilled, (state, action) => {
      const activity = action.meta.arg;
      if (activity.id) {
        let oldActivity = Object.values(state.activityRegistry).find(
          (activity) => activity.id === action.meta.arg.id
        );
        let updatedActivity = {
          ...oldActivity,
          ...activity,
        } as Activity;
        state.activityRegistry = { ...state.activityRegistry, updatedActivity };
        state.selectedActivity = updatedActivity as Activity;
      }
    });
    builder.addCase(updateActivityAsync.rejected, (state, action) => {
      console.log("updateActivityAsync.rejected");
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
  updateAttendeeFollowing,
  clearSelectedActivity,
  setStartDate,
  setFilter,
  setPagination,
  resetActivityRegistry,
} = activitiesSlice.actions;
