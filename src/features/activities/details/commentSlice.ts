import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ChatComment } from "../../../app/models/comment";
import { RootState, store } from "../../../app/store/configureStore";
import { initialState } from "./commentState";

export const addCommentAsync = createAsyncThunk<
  void,
  { values: any },
  { state: RootState }
>("comment/addCommentAsync", async ({ values }, thunkAPI) => {
  try {
    await thunkAPI
      .getState()
      .comment.hubConnection?.invoke("SendComment", values);
  } catch (error: any) {
    thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    createHubConnection: (state, action) => {
      const activity = store.getState().activities.selectedActivity;
      const user = store.getState().user.user;

      if (activity) {
        state.hubConnection = new HubConnectionBuilder()
          .withUrl(
            process.env.REACT_APP_CHAT_URL + "?activityId=" + action.payload,
            {
              accessTokenFactory: () => user?.token!,
            }
          )
          .withAutomaticReconnect()
          .configureLogging(LogLevel.Information)
          .build();

        state.hubConnection
          .start()
          .catch((error) =>
            console.log("Error establishing the connection: ", error)
          );

        state.hubConnection.on("LoadComments", (comments: ChatComment[]) => {
          comments.forEach((comment) => {
            comment.createdAt = new Date(comment.createdAt + "Z");
          });
          state.comments = comments;
        });

        state.hubConnection.on("ReceiveComment", (comment: ChatComment) => {
          comment.createdAt = new Date(comment.createdAt);
          state.comments.unshift(comment);
        });
      }
    },
    stopHubConnection: (state) => {
      state.hubConnection
        ?.stop()
        .catch((error) => console.log("Error stopping connection: ", error));
    },
    clearComments: (state) => {
      state.comments = [];
      stopHubConnection();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addCommentAsync.pending, (state, action) => {
      action.meta.arg.values.activityId =
        store.getState().activities.selectedActivity?.id;
    });
  },
});

export const { createHubConnection, stopHubConnection, clearComments } =
  commentSlice.actions;
