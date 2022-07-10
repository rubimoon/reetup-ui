import { createSlice } from "@reduxjs/toolkit";
import { ServerError } from "../models/serverError";

interface CommonState {
  error: ServerError | null;
  token: string | null;
  appLoaded: boolean;
}

const initialState: CommonState = {
  error: null,
  token: window.localStorage.getItem("jwt"),
  appLoaded: false,
};

export const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setToken: (state, action) => {
      console.log("set user token: ", action.payload);
      state.token = action.payload;
    },
    setServerError: (state, action) => {
      state.error = action.payload;
    },
    setAppLoaded: (state) => {
      state.appLoaded = true;
    },
  },
});

export const { setToken, setServerError, setAppLoaded } = commonSlice.actions;
