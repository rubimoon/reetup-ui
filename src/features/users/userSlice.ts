import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { User, UserFormValues } from "../../app/models/user";
import { initialState } from "./userState";
import { setToken } from "../../app/store/commonSlice";
import { RootState } from "../../app/store/configureStore";

export const loginAsync = createAsyncThunk<User, UserFormValues>(
  "user/loginAsync",
  async (creds, thunkAPI) => {
    try {
      const user = await agent.Account.login(creds);
      thunkAPI.dispatch(setToken(user.token));
      thunkAPI.dispatch(startRefreshTokenTimer(user));
      return user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const refreshTokenAsync = createAsyncThunk<void>(
  "user/refreshTokenAsync",
  async (_, thunkAPI) => {
    try {
      const user = await agent.Account.refreshToken();
      thunkAPI.dispatch(setCurrentUser(user));
      thunkAPI.dispatch(setToken(user.token));
      thunkAPI.dispatch(startRefreshTokenTimer(user));
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const getCurrentUserAysnc = createAsyncThunk<User>(
  "user/getCurrentUserAysnc",
  async (_, thunkAPI) => {
    try {
      const currentUser = await agent.Account.current();
      if (currentUser) {
        thunkAPI.dispatch(setToken(currentUser.token));
        thunkAPI.dispatch(startRefreshTokenTimer(currentUser));
      }
      return currentUser;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const registerAsync = createAsyncThunk<User, { creds: UserFormValues }>(
  "user/registerAsync",
  async ({ creds }, thunkAPI) => {
    try {
      return await agent.Account.register(creds);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const getFacebookLoginStatusAsync = createAsyncThunk<
  void,
  void,
  { state: RootState }
>("user/getFacebookLoginStatusAsync", async (_, thunkAPI) => {
  window.FB.getLoginStatus((response) => {
    if (response.status === "connected") {
      thunkAPI.dispatch(setFbAccessToken(response.authResponse.accessToken));
    }
  });
});

export const facebookLoginAsync = createAsyncThunk<void, string | null>(
  "user/facebookLoginAsync",
  (fbAccessToken, thunkAPI) => {
    const apiLogin = (accessToken: string) => {
      agent.Account.fbLogin(accessToken).then((user) => {
        thunkAPI.dispatch(setToken(user.token));
        thunkAPI.dispatch(startRefreshTokenTimer(user));
        thunkAPI.dispatch(setCurrentUser(user));
      });
    };

    if (fbAccessToken) {
      apiLogin(fbAccessToken);
    } else {
      window.FB.login(
        (response) => {
          apiLogin(response.authResponse.accessToken);
        },
        { scope: "public_profile,email" }
      );
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
    setImage: (state, action) => {
      if (state.user) state.user.image = action.payload;
    },
    setDisplayName: (state, action) => {
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
    setFbAccessToken: (state, action) => {
      state.fbAccessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginAsync.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(getCurrentUserAysnc.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(getCurrentUserAysnc.rejected, (state, action) => {
      state.user = null;
    });
    builder.addCase(registerAsync.fulfilled, (state, action) => {
      state.email = action.payload.email;
    });
    builder.addCase(facebookLoginAsync.pending, (state, action) => {
      state.fbLoading = true;
    });
    builder.addCase(facebookLoginAsync.fulfilled, (state, action) => {
      state.fbLoading = false;
    });
    builder.addCase(facebookLoginAsync.rejected, (state, action) => {
      state.fbLoading = false;
    });
  },
});

export const {
  setCurrentUser,
  startRefreshTokenTimer,
  stopRefreshTokenTimer,
  logout,
  setImage,
  setDisplayName,
  setFbAccessToken,
} = userSlice.actions;
