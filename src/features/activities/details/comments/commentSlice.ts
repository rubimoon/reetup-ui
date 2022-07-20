import { HubConnection } from "@microsoft/signalr";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Activity } from "../../../../app/models/activity";
import { RootState } from "../../../../app/store/configureStore";
import { initialState } from "./commentState";

export const addCommentAsync = createAsyncThunk<
  void,
  { connection: HubConnection; values: any; selectedActivity: Activity },
  { state: RootState }
>("comment/addCommentAsync", async ({ connection, values }, thunkAPI) => {
  try {
    await connection?.invoke("SendComment", values);
  } catch (error: any) {
    thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    stopHubConnection: (state) => {
      state.hubConnection
        ?.stop()
        .catch((error) => console.log("Error stopping connection: ", error));
    },
    clearComments: (state) => {
      state.comments = [];
      stopHubConnection();
    },
    setComments: (state, action) => {
      state.comments = action.payload;
    },
    appendComment: (state, action) => {
      state.comments = [...state.comments, action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addCommentAsync.pending, (state, action) => {
      const selectedActivity = action.meta.arg.selectedActivity;
      action.meta.arg.values.activityId = selectedActivity?.id;
    });
  },
});

export const { stopHubConnection, clearComments, setComments, appendComment } =
  commentSlice.actions;
