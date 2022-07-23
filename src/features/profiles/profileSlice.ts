import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { Photo, Profile, UserActivity } from "../../app/models/profile";
import { User } from "../../app/models/user";
import { RootState } from "../../app/store/configureStore";
import { updateAttendeeFollowing } from "../activities/activitySlice";
import { setDisplayName, setImage } from "../users/userSlice";
import { FollowingsTypes, initialState } from "./profileState";

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
  { currentUser: User; profile: Partial<Profile> },
  { state: RootState }
>("profile/updateProfileAsync", async ({ currentUser, profile }, thunkAPI) => {
  try {
    await agent.Profiles.updateProfile(profile);
    if (
      profile.displayName &&
      profile.displayName !== currentUser?.displayName
    ) {
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
  { currentUser: User; file: Blob },
  { state: RootState }
>("profile/uploadPhotoAsync", async ({ currentUser, file }, thunkAPI) => {
  try {
    const response = await agent.Profiles.uploadPhoto(file);
    const photo = response.data;

    thunkAPI.dispatch(appendPhoto(photo));
    if (photo.isMain && currentUser) {
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

// followings
export const updateFollowingAsync = createAsyncThunk<
  User,
  { username: string; following: boolean },
  { state: RootState }
>("profile/updateFollowingAsync", async ({ username, following }, thunkAPI) => {
  try {
    await agent.Profiles.updateFollowing(username);
    thunkAPI.dispatch(updateAttendeeFollowing(username));
    return thunkAPI.getState().user.currentUser!;
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
      state.isLoadingProfile = true;
    });
    builder.addCase(loadProfileAsync.fulfilled, (state, action) => {
      state.profile = action.payload;
      state.isLoadingProfile = false;
    });
    builder.addCase(loadProfileAsync.rejected, (state) => {
      state.isLoadingProfile = false;
    });
    builder.addCase(uploadPhotoAsync.pending, (state) => {
      state.isUploading = true;
    });
    builder.addCase(uploadPhotoAsync.fulfilled, (state) => {
      state.isUploading = false;
    });
    builder.addCase(uploadPhotoAsync.rejected, (state) => {
      state.isUploading = false;
    });
    builder.addCase(setMainPhotoAsync.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(setMainPhotoAsync.fulfilled, (state, action) => {
      const photo = action.meta.arg;
      if (state.profile && state.profile.photos) {
        state.profile.photos.find((p) => p.isMain)!.isMain = false;
        state.profile.photos.find((p) => p.id === photo.id)!.isMain = true;
        state.profile.image = photo.url;
      }
      state.isLoading = false;
    });

    builder.addCase(setMainPhotoAsync.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(deletePhotoAsync.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(deletePhotoAsync.fulfilled, (state, action) => {
      const photo = action.meta.arg;
      if (state.profile) {
        state.profile.photos = state.profile.photos?.filter(
          (p) => p.id !== photo.id
        );
      }
      state.isLoading = false;
    });
    builder.addCase(deletePhotoAsync.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(updateProfileAsync.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateProfileAsync.fulfilled, (state, action) => {
      const profile = action.meta.arg.profile;
      state.profile = { ...state.profile, ...(profile as Profile) };
      state.isLoading = false;
    });
    builder.addCase(updateProfileAsync.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(updateFollowingAsync.pending, (state) => {
      state.isLoading = true;
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
        state.profile.isFollowing = !state.profile.isFollowing;
      }
      if (state.profile && state.profile.username === currentUser?.username) {
        following
          ? state.profile.followingCount++
          : state.profile.followingCount--;
      }
      state.followings.forEach((profile) => {
        if (profile.username === username) {
          profile.isFollowing
            ? profile.followersCount--
            : profile.followersCount++;
          profile.isFollowing = !profile.isFollowing;
        }
      });
      state.isLoading = false;
    });
    builder.addCase(updateFollowingAsync.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(loadFollowingsAsync.pending, (state) => {
      state.isLoadingFollowings = true;
    });
    builder.addCase(loadFollowingsAsync.fulfilled, (state, action) => {
      state.followings = action.payload;
      state.isLoadingFollowings = false;
    });
    builder.addCase(loadFollowingsAsync.rejected, (state) => {
      state.isLoadingFollowings = false;
    });
    builder.addCase(loadUserActivitiesAsync.pending, (state) => {
      state.isLoadingActivities = true;
    });
    builder.addCase(loadUserActivitiesAsync.fulfilled, (state, action) => {
      state.userActivities = action.payload;
      state.isLoadingActivities = false;
    });
    builder.addCase(loadUserActivitiesAsync.rejected, (state) => {
      state.isLoadingActivities = false;
    });
  },
});

export const { setActiveTab, setIsCurrentUser, appendPhoto, setProfileImage } =
  profileSlice.actions;
