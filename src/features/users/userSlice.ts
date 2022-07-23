import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { User, UserFormValues } from "../../app/models/user";
import { initialState } from "./userState";
import { setToken } from "../../app/store/commonSlice";
import { closeModal } from "../../app/common/modals/modalSlice";
import { history } from "../..";
import { useAppSelector } from "../../app/store/configureStore";

export const loginAsync = createAsyncThunk<User, UserFormValues>(
  "user/loginAsync",
  async (creds, thunkAPI) => {
    try {
      const currentUser = await agent.Account.login(creds);
      thunkAPI.dispatch(setToken(currentUser.token));
      thunkAPI.dispatch(closeModal());
      history.push("/activities");
      return currentUser;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.response.data });
    }
  }
);

export const getCurrentUserAsync = createAsyncThunk<User>(
  "user/getCurrentUserAysnc",
  async (_, thunkAPI) => {
    try {
      const currentUser = await agent.Account.current();
      if (currentUser) {
        thunkAPI.dispatch(setToken(currentUser.token));
      }
      return currentUser;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const registerAsync = createAsyncThunk<User, UserFormValues>(
  "user/registerAsync",
  async (creds, thunkAPI) => {
    try {
      const user = await agent.Account.register(creds);
      history.push(`/account/registerSuccess?email=${creds.email}`);
      thunkAPI.dispatch(closeModal());
      return user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error });
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
    },
    setImage: (state, action) => {
      if (state.currentUser) state.currentUser.image = action.payload;
    },
    setDisplayName: (state, action) => {
      if (state.currentUser) state.currentUser.displayName = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginAsync.fulfilled, (state, action) => {
      state.currentUser = action.payload;
    });
    builder.addCase(getCurrentUserAsync.fulfilled, (state, action) => {
      state.currentUser = action.payload;
    });
    builder.addCase(getCurrentUserAsync.rejected, (state, action) => {
      state.currentUser = null;
    });
    builder.addCase(registerAsync.fulfilled, (state, action) => {
      state.email = action.payload.email;
    });
  },
});

export const { setCurrentUser, logout, setImage, setDisplayName } =
  userSlice.actions;

export const useUserAuth = () =>
  !!useAppSelector((state) => state.user.currentUser);

export const useLoggedInUser = () =>
  useAppSelector((state) => state.user.currentUser)!;
