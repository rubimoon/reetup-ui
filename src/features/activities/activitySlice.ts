import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { Activity, ActivityFormValues } from "../../app/models/activity";
import { PaginatedResult } from "../../app/models/pagination";
import { Profile } from "../../app/models/profile";
import { RootState, useAppSelector } from "../../app/store/configureStore";
import { initialState } from "./activityState";

export const loadActivitiesAsync = createAsyncThunk<
  PaginatedResult<Activity[]>,
  { params: URLSearchParams }
>(
  "activities/loadActivitiesAsync",
  async ({ params }, { getState, rejectWithValue }) => {
    try {
      // const { axiosParams } = (getState() as RootState).activities;
      return await agent.Activities.list(params);
    } catch (error: any) {
      return rejectWithValue({ error: error.data });
    }
  }
);
export const loadActivityAsync = createAsyncThunk<
  Activity,
  { id: string },
  { state: RootState }
>(
  "activities/loadActivityAsync",
  async ({ id }, { rejectWithValue }) => {
    try {
      return await agent.Activities.details(id);
    } catch (error: any) {
      return rejectWithValue({ error: error.data });
    }
  },
  {
    condition: ({ id }, thunkAPI) => {
      const { activityRegistry } = thunkAPI.getState().activities;
      const activity = activityRegistry.get(id);
      if (activity) {
        return false;
      }
    },
  }
);

export const createActivityAsync = createAsyncThunk<
  Activity,
  { activity: ActivityFormValues }
>(
  "activities/createActivityAsync",
  async ({ activity }, { rejectWithValue }) => {
    try {
      await agent.Activities.create(activity);
      return new Activity(activity);
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
// deleteActivity
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
  void,
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
    setPagingParams: (state, action) => {
      state.pagingParams = action.payload;
    },
    setPredicate: (state, action) => {
      const { predicate, value } = action.payload;
      const resetPredicate = () => {
        state.predicate.forEach((value, key) => {
          if (key !== "startDate") state.predicate.delete(key);
        });
      };
      switch (predicate) {
        case "all":
          resetPredicate();
          state.predicate.set("all", true);
          break;
        case "isGoing":
          resetPredicate();
          state.predicate.set("isGoing", true);
          break;
        case "isHost":
          resetPredicate();
          state.predicate.set("isHost", true);
          break;
        case "startDate":
          state.predicate.delete("startDate");
          state.predicate.set("startDate", value);
      }
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    setLoadingInitial: (state, action) => {
      state.loadingInitial = action.payload;
    },
    setActivity: (state, action) => {
      // const user = store.userStore.user;
      // if (user) {
      //   activity.isGoing = activity.attendees!.some(
      //     (a) => a.username === user.username
      //   );
      //   activity.isHost = activity.hostUsername === user.username;
      //   activity.host = activity.attendees?.find(
      //     (x) => x.username === activity.hostUsername
      //   );
      // }
      const activity = action.payload;
      activity.date = new Date(activity.date!);
      state.activityRegistry.set(activity.id, activity);
    },
    updateAttendeeFollowing: (state, action) => {
      state.activityRegistry.forEach((activity) => {
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
    builder.addCase(loadActivitiesAsync.fulfilled, (state, action) => {
      // setLoadingNext(false);
      action.payload.data.forEach((activity) => {
        setActivity(activity);
      });
    });
    builder.addCase(loadActivityAsync.pending, (state, action) => {});
    builder.addCase(loadActivityAsync.fulfilled, (state, action) => {
      const activity = action.payload;
      setActivity(activity);
      state.selectedActivity = activity;
      setLoadingInitial(false);
    });
    builder.addCase(loadActivityAsync.rejected, (state, action) => {
      setLoadingInitial(false);
    });
    builder.addCase(createActivityAsync.fulfilled, (state, action) => {
      const { user } = useAppSelector((state) => state.user);
      const attendee = new Profile(user!);
      const newActivity = action.payload;
      newActivity.hostUsername = user!.username;
      newActivity.attendees = [attendee];
      setActivity(newActivity);
      state.selectedActivity = newActivity;
    });
    builder.addCase(updateActivityAsync.fulfilled, (state, action) => {
      const activity = action.meta.arg.activity;
      if (activity.id) {
        let oldActivity = state.activityRegistry.get(activity.id);
        let updatedActivity = {
          ...oldActivity,
          ...activity,
        };
        state.activityRegistry.set(activity.id, updatedActivity as Activity);
        state.selectedActivity = updatedActivity as Activity;
      }
    });
    builder.addCase(deleteActivityAsync.fulfilled, (state, action) => {
      state.activityRegistry.delete(action.meta.arg.id);
      state.loading = false;
    });
    builder.addCase(deleteActivityAsync.rejected, (state, action) => {
      state.loading = false;
    });
    builder.addCase(updateAttendanceAsync.fulfilled, (state) => {
      const { user } = useAppSelector((state) => state.user);
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
      state.activityRegistry.set(
        state.selectedActivity!.id,
        state.selectedActivity!
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
      state.activityRegistry.set(
        state.selectedActivity!.id,
        state.selectedActivity!
      );
      state.loading = false;
    });
    builder.addCase(cancelActivityToggleAsync.rejected, (state) => {
      state.loading = false;
    });
  },
});

// function generateAxiosParams(state: ActivityState) {
//   const params = new URLSearchParams();
//   params.append("pageNumber", state.pagingParams.pageNumber.toString());
//   params.append("pageSize", state.pagingParams.pageSize.toString());
//   state.predicate.forEach((value, key) => {
//     if (key === "startDate") {
//       params.append(key, (value as Date).toISOString());
//     } else {
//       params.append(key, value);
//     }
//   });
//   return params;
// }

export const {
  setPagingParams,
  setActivity,
  setLoadingInitial,
  updateAttendeeFollowing,
  clearSelectedActivity,
  setPredicate,
} = activitiesSlice.actions;
