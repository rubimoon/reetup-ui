import { createAsyncThunk } from "@reduxjs/toolkit";
import agent from "../../../app/api/agent";
import { UserActivity } from "../../../app/models/profile";

export const loadUserActivitiesAsync = createAsyncThunk<
  UserActivity[],
  { username: string; predicate?: string }
>(
  "profile/loadUserActivitiesAsync",
  async ({ username, predicate = "all" }, thunkAPI) => {
    try {
      return await agent.Profiles.listActivities(username, predicate);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);
