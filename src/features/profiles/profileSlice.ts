import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { Photo, Profile, UserActivity } from "../../app/models/profile";
import { RootState } from "../../app/store/configureStore";
import { setDisplayName, setImage } from "../users/userSlice";
import { loadFollowingsAsync, updateFollowingAsync } from "./followings";
import { initialState } from "./profileState";

// profile
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
>("profile/updateProfileAsync", async (profile, thunkAPI) => {
  const user = thunkAPI.getState().user.user!;
  try {
    await agent.Profiles.updateProfile(profile);
    if (profile.displayName && profile.displayName !== user?.displayName) {
      thunkAPI.dispatch(setDisplayName(profile.displayName));
    }
    return;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

// photos
export const uploadPhotoAsync = createAsyncThunk<
  void,
  Blob,
  { state: RootState }
>("profile/uploadPhotoAsync", async (file, thunkAPI) => {
  try {
    const response = await agent.Profiles.uploadPhoto(file);
    const photo = response.data;
    const user = thunkAPI.getState().user.user;

    thunkAPI.dispatch(appendPhoto(photo));
    if (photo.isMain && user) {
      thunkAPI.dispatch(setImage(photo.url));
      thunkAPI.dispatch(setProfileImage(photo.url));
    }
    return;
  } catch (error: any) {
    console.log("error:", error);
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const setMainPhotoAsync = createAsyncThunk<void, Photo>(
  "profile/setMainPhotoAsync",
  async (photo, thunkAPI) => {
    try {
      await agent.Profiles.setMainPhoto(photo.id);
      thunkAPI.dispatch(setImage(photo.url));
      return;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const deletePhotoAsync = createAsyncThunk<void, Photo>(
  "profile/deletePhotoAsync",
  async (photo, thunkAPI) => {
    try {
      await agent.Profiles.deletePhoto(photo.id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

// userActivities
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
    appendPhoto: (state, action) => {
      if (state.profile!.photos === undefined) return;
      state.profile!.photos = [...state.profile!.photos, action.payload];
    },
    setProfileImage: (state, action) => {
      state.profile!.image = action.payload;
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
      const profile = action.meta.arg;
      state.profile = { ...state.profile, ...(profile as Profile) };
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

export const { setActiveTab, setIsCurrentUser, appendPhoto, setProfileImage } =
  profileSlice.actions;
