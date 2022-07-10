import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { Profile } from "../../app/models/profile";
import { RootState } from "../../app/store/configureStore";
import { setDisplayName } from "../users/userSlice";
import { loadFollowingsAsync, updateFollowingAsync } from "./followings";
import {
  deletePhotoAsync,
  setMainPhotoAsync,
  uploadPhotoAsync,
} from "./photos";
import { initialState } from "./profileState";
import { loadUserActivitiesAsync } from "./userActivities";

export const loadProfileAsync = createAsyncThunk<Profile, string>(
  "profile/loadProfileAsync",
  async (username, thunkAPI) => {
    try {
      return await agent.Profiles.get(username);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const updateProfileAsync = createAsyncThunk<
  void,
  Partial<Profile>,
  { state: RootState }
>("profile/updateProfileAsync", async (profileValues, thunkAPI) => {
  const user = thunkAPI.getState().user.user!;
  try {
    await agent.Profiles.updateProfile(profileValues);
    if (
      profileValues.displayName &&
      profileValues.displayName !== user?.displayName
    ) {
      thunkAPI.dispatch(setDisplayName(profileValues.displayName));
    }
    return;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setIsCurrentUser: (state, action) => {
      state.isCurrentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadProfileAsync.pending, (state) => {
      state.loadingProfile = true;
    });
    builder.addCase(loadProfileAsync.fulfilled, (state, action) => {
      state.profile = action.payload;
      state.loadingProfile = false;
    });
    builder.addCase(loadProfileAsync.rejected, (state) => {
      state.loadingProfile = false;
    });
    builder.addCase(uploadPhotoAsync.pending, (state) => {
      state.uploading = true;
    });
    builder.addCase(uploadPhotoAsync.fulfilled, (state, action) => {
      state.uploading = false;
    });
    builder.addCase(uploadPhotoAsync.rejected, (state) => {
      state.uploading = false;
    });
    builder.addCase(setMainPhotoAsync.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(setMainPhotoAsync.fulfilled, (state, action) => {
      const photo = action.meta.arg;
      if (state.profile && state.profile.photos) {
        state.profile.photos.find((p) => p.isMain)!.isMain = false;
        state.profile.photos.find((p) => p.id === photo.id)!.isMain = true;
        state.profile.image = photo.url;
      }
      state.loading = false;
    });

    builder.addCase(setMainPhotoAsync.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(deletePhotoAsync.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(deletePhotoAsync.fulfilled, (state, action) => {
      const photo = action.meta.arg;
      if (state.profile) {
        state.profile.photos = state.profile.photos?.filter(
          (p) => p.id !== photo.id
        );
      }
      state.loading = false;
    });
    builder.addCase(deletePhotoAsync.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(updateProfileAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateProfileAsync.fulfilled, (state, action) => {
      const profileValues = action.meta.arg;
      state.profile = { ...state.profile, ...(profileValues as Profile) };
      state.loading = false;
    });
    builder.addCase(updateProfileAsync.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(updateFollowingAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateFollowingAsync.fulfilled, (state, action) => {
      const currentUser = action.payload;
      const { username, following } = action.meta.arg;
      if (
        state.profile &&
        state.profile.username !== currentUser?.username &&
        state.profile.username === username
      ) {
        following
          ? state.profile.followersCount++
          : state.profile.followersCount--;
        state.profile.following = !state.profile.following;
      }
      if (state.profile && state.profile.username === currentUser?.username) {
        following
          ? state.profile.followingCount++
          : state.profile.followingCount--;
      }
      state.followings.forEach((profile) => {
        if (profile.username === username) {
          profile.following
            ? profile.followersCount--
            : profile.followersCount++;
          profile.following = !profile.following;
        }
      });
      state.loading = false;
    });
    builder.addCase(updateFollowingAsync.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(loadFollowingsAsync.pending, (state) => {
      state.loadingFollowings = true;
    });
    builder.addCase(loadFollowingsAsync.fulfilled, (state, action) => {
      state.followings = action.payload;
      state.loadingFollowings = false;
    });
    builder.addCase(loadFollowingsAsync.rejected, (state) => {
      state.loadingFollowings = false;
    });
    builder.addCase(loadUserActivitiesAsync.pending, (state) => {
      state.loadingActivities = true;
    });
    builder.addCase(loadUserActivitiesAsync.fulfilled, (state, action) => {
      state.userActivities = action.payload;
      state.loadingActivities = false;
    });
    builder.addCase(loadUserActivitiesAsync.rejected, (state) => {
      state.loadingActivities = false;
    });
  },
});

export const { setActiveTab, setIsCurrentUser } = profileSlice.actions;
