import { createAsyncThunk } from "@reduxjs/toolkit";
import agent from "../../../app/api/agent";
import { Photo } from "../../../app/models/profile";
import { RootState } from "../../../app/store/configureStore";
import { setImage } from "../../users/userSlice";

export const uploadPhotoAsync = createAsyncThunk<
  void,
  Blob,
  { state: RootState }
>("profile/uploadPhotoAsync", async (file, thunkAPI) => {
  try {
    const response = await agent.Profiles.uploadPhoto(file);
    const photo = response.data;
    const user = thunkAPI.getState().user.user;
    const profile = thunkAPI.getState().profile.profile;

    if (profile) {
      profile.photos?.push(photo);
      if (photo.isMain && user) {
        thunkAPI.dispatch(setImage(photo.url));
        profile.image = photo.url;
      }
    }
    return;
  } catch (error: any) {
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
