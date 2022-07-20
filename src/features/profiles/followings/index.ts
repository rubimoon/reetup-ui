import { createAsyncThunk } from "@reduxjs/toolkit";
import agent from "../../../app/api/agent";
import { Profile } from "../../../app/models/profile";
import { User } from "../../../app/models/user";
import { RootState } from "../../../app/store/configureStore";
import { updateAttendeeFollowing } from "../../activities/activitySlice";
import { FollowingsTypes } from "../profileState";

export const updateFollowingAsync = createAsyncThunk<
  User,
  { username: string; following: boolean },
  { state: RootState }
>("profile/updateFollowingAsync", async ({ username, following }, thunkAPI) => {
  try {
    await agent.Profiles.updateFollowing(username);
    thunkAPI.dispatch(updateAttendeeFollowing(username));
    return thunkAPI.getState().user.user!;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const loadFollowingsAsync = createAsyncThunk<
  Profile[],
  FollowingsTypes,
  { state: RootState }
>("profile/loadFollowingsAsync", async (predicate, thunkAPI) => {
  const profile = thunkAPI.getState().profile.profile;
  try {
    return await agent.Profiles.listFollowings(profile!.username, predicate);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});
