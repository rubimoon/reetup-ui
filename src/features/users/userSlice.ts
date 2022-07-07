import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { User, UserFormValues } from "../../app/models/user";
import { initialState } from "./userState";
import { history } from "../..";
import { closeModal } from "../../app/store/modalSlice";
import { setToken } from "../../app/store/commonSlice";

export const loginAsync = createAsyncThunk<
  User,
  { creds: UserFormValues; setErrors: any }
>("user/loginAsync", async ({ creds, setErrors }, thunkAPI) => {
  try {
    return await agent.Account.login(creds);
  } catch (error: any) {
    return setErrors({
      error: thunkAPI.rejectWithValue({ error: error.data }),
    });
  }
});

export const refreshTokenAsync = createAsyncThunk<User>(
  "user/refreshTokenAsync",
  async (_, thunkAPI) => {
    try {
      return await agent.Account.refreshToken();
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const getCurrentUserAysnc = createAsyncThunk<User>(
  "user/getCurrentUserAysnc",
  async (_, thunkAPI) => {
    try {
      return await agent.Account.current();
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const registerAsync = createAsyncThunk<
  User,
  { creds: UserFormValues; setErrors: any }
>("user/registerAsync", async ({ creds, setErrors }, thunkAPI) => {
  try {
    return await agent.Account.register(creds);
  } catch (error: any) {
    return setErrors({
      error: thunkAPI.rejectWithValue({ error: error.data }),
    });
  }
});

// export const getFacebookLoginStatusAsync = createAsyncThunk(
//   "user/getFacebookLoginStatusAsync",
//   async (_, thunkAPI) => {
//     window.FB.getLoginStatus((response) => {
//       if (response.status === "connected") {
//         this.fbAccessToken = response.authResponse.accessToken;
//       }
//     });
//   }
// );

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      setToken(null);
      window.localStorage.removeItem("jwt");
      state.user = null;
      history.push("/");
    },

    setImage: (state, action: { payload: string }) => {
      if (state.user) state.user.displayName = action.payload;
    },
    setDisplayName: (state, action: { payload: string }) => {
      if (state.user) state.user.displayName = action.payload;
    },

    startRefreshTokenTimer: (state, action) => {
      const jwtToken = JSON.parse(atob(action.payload.token.split(".")[1]));
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - 60 * 1000;
      state.refreshTokenTimeout = setTimeout(refreshTokenAsync, timeout);
    },
    stopRefreshTokenTimer: (state) => {
      clearTimeout(state.refreshTokenTimeout);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginAsync.fulfilled, (state, action) => {
      const user = action.payload;
      setToken(user.token);
    });

    builder.addCase(refreshTokenAsync.fulfilled, (state, action) => {
      const user = action.payload;
      state.user = user;
      setToken(user.token);
      startRefreshTokenTimer(user);
    });
    builder.addCase(getCurrentUserAysnc.fulfilled, (state, action) => {
      const user = action.payload;
      setToken(user.token);
      state.user = user;
      startRefreshTokenTimer(user);
    });
    builder.addCase(registerAsync.fulfilled, (state, action) => {
      const email = action.meta.arg.creds;
      history.push(`/account/registerSuccess?email=${email}`);
      closeModal();
    });
  },
});

export const { startRefreshTokenTimer, stopRefreshTokenTimer, logout } =
  userSlice.actions;
