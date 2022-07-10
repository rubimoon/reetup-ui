import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { Activity, ActivityFormValues } from "../../app/models/activity";
import { PaginatedResult } from "../../app/models/pagination";
import { Profile } from "../../app/models/profile";
import { User } from "../../app/models/user";
import { RootState } from "../../app/store/configureStore";
import { initialState, SetActivityState } from "./activityState";

export const loadActivitiesAsync = createAsyncThunk<
  PaginatedResult<Activity[]>,
  void,
  { state: RootState }
>("activities/loadActivitiesAsync", async (_, thunkAPI) => {
  const { pagingParams, predicate } = thunkAPI.getState().activities;
  try {
    const params = new URLSearchParams();
    params.append("pageNumber", pagingParams.pageNumber!.toString());
    params.append("pageSize", pagingParams.pageSize!.toString());
    Object.entries(predicate).forEach((value) => {
      if (value[0] === "startDate") {
        params.append(value[0], (value[1] as Date).toISOString());
      } else {
        params.append(value[0], value[1]);
      }
    });
    const result = await agent.Activities.list(params);
    const currentUser = thunkAPI.getState().user.user;
    console.log("result: " + result);
    result.data.forEach((activity) =>
      thunkAPI.dispatch(setActivity({ activity, currentUser }))
    );
    return result;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const loadActivityAsync = createAsyncThunk<
  Activity,
  { id: string },
  { state: RootState }
>(
  "activities/loadActivityAsync",
  async ({ id }, { rejectWithValue, dispatch, getState }) => {
    try {
      const currentUser = getState().user.user;
      const activity = await agent.Activities.details(id);
      dispatch(setActivity({ activity, currentUser }));
      return activity;
    } catch (error: any) {
      return rejectWithValue({ error: error.data });
    }
  },
  {
    condition: ({ id }, thunkAPI) => {
      const { activityRegistry } = thunkAPI.getState().activities;
      const activity = activityRegistry[id];
      return !activity;
    },
  }
);

export const createActivityAsync = createAsyncThunk<
  Activity,
  { activity: ActivityFormValues },
  { state: RootState }
>(
  "activities/createActivityAsync",
  async ({ activity }, { getState, rejectWithValue, dispatch }) => {
    try {
      await agent.Activities.create(activity);
      const newActivity = new Activity(activity);
      const currentUser = getState().user.user;
      const attendee = new Profile(currentUser!);
      newActivity.hostUsername = currentUser!.username;
      newActivity.attendees = [attendee];
      dispatch(setActivity({ activity: newActivity, currentUser }));
      return newActivity;
    } catch (error: any) {
      return rejectWithValue({ error: error.data });
    }
  }
);

export const updateActivityAsync = createAsyncThunk<
  void,
  { activity: ActivityFormValues }
>(
  "activities/updateActivityAsync",
  async ({ activity }, { rejectWithValue }) => {
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
    const { selectedActivity } = thunkAPI.getState().activities;
    return await agent.Activities.attend(selectedActivity!.id);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    setLoadingInitial: (state, action) => {
      state.loadingInitial = action.payload;
    },
    setPagingParams: (state, action) => {
      state.pagingParams.pageNumber = action.payload;
    },
    setPredicate: (state, action) => {
      const { predicate, value } = action.payload;
      const resetPredicate = () => {
        Object.keys(state.predicate).forEach((key) => {
          if (key !== "startDate") delete state.predicate[key];
        });
      };
      switch (predicate) {
        case "all":
          resetPredicate();
          state.predicate["all"] = true;
          break;
        case "isGoing":
          resetPredicate();
          state.predicate["isGoing"] = true;
          break;
        case "isHost":
          resetPredicate();
          state.predicate["isHost"] = true;
          break;
        case "startDate":
          delete state.predicate["startDate"];
          state.predicate["startDate"] = value;
      }
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    setActivity: (state, action: PayloadAction<SetActivityState>) => {
      const user = action.payload.currentUser;
      const activity = action.payload.activity as Activity;
      console.log("activity: " + activity);
      if (user) {
        activity.isGoing = activity.attendees!.some(
          (a) => a.username === user.username
        );
        activity.isHost = activity.hostUsername === user.username;
        activity.host = activity.attendees?.find(
          (x) => x.username === activity.hostUsername
        );
      }

      activity.date = new Date(activity.date!);
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
    clearSelectedActivity: (state) => {
      state.selectedActivity = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadActivitiesAsync.pending, (state, action) => {
      console.log("loadActivitiesAsync.pending");
      state.loadingInitial = true;
    });
    builder.addCase(loadActivitiesAsync.fulfilled, (state, action) => {
      console.log("loadActivitiesAsync.fulfilled");
      state.pagination = action.payload.pagination;
      state.loadingInitial = false;
    });
    builder.addCase(loadActivitiesAsync.rejected, (state, action) => {
      console.log("loadActivitiesAsync.rejected");
      state.loadingInitial = false;
    });
    builder.addCase(loadActivityAsync.pending, (state, action) => {});
    builder.addCase(loadActivityAsync.fulfilled, (state, action) => {
      // const { user } = useAppSelector((state) => state.user);
      const activity = action.payload;
      // setActivity({ activity, currentUser: user });
      state.selectedActivity = activity;
      state.loadingInitial = false;
    });
    builder.addCase(loadActivityAsync.rejected, (state, action) => {
      state.loadingInitial = false;
    });
    builder.addCase(createActivityAsync.fulfilled, (state, action) => {
      // const { user } = useAppSelector((state) => state.user);
      // const attendee = new Profile(user!);
      // const newActivity = action.payload;
      // newActivity.hostUsername = user!.username;
      // newActivity.attendees = [attendee];
      // setActivity({ activity: newActivity, currentUser: user });
      state.selectedActivity = action.payload;
    });
    builder.addCase(updateActivityAsync.fulfilled, (state, action) => {
      const activity = action.meta.arg.activity;
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
      // const { user } = useAppSelector((state) => state.user);
      const user = action.meta.arg.currentUser;
      if (state.selectedActivity?.isGoing) {
        state.selectedActivity.attendees =
          state.selectedActivity.attendees?.filter(
            (a) => a.username !== user?.username
          );
        state.selectedActivity.isGoing = false;
      } else {
        const attendee = new Profile(user!);
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
  setPagingParams,
  setActivity,
  updateAttendeeFollowing,
  clearSelectedActivity,
  setPredicate,
} = activitiesSlice.actions;
