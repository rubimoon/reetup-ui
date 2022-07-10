import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Activity } from "../../../../app/models/activity";
import { ChatComment } from "../../../../app/models/comment";
import { RootState } from "../../../../app/store/configureStore";
import { CreateHubConnectionState, initialState } from "./commentState";

export const addCommentAsync = createAsyncThunk<
  void,
  { values: any; selectedActivity: Activity },
  { state: RootState }
>("comment/addCommentAsync", async ({ values }, thunkAPI) => {
  try {
    const connection = thunkAPI.getState().comment.hubConnection;
    await connection?.invoke("SendComment", values);
  } catch (error: any) {
    thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    createHubConnection: (
      state,
      action: PayloadAction<CreateHubConnectionState>
    ) => {
      const { activity, currentUser } = action.payload;
      if (activity) {
        state.hubConnection = new HubConnectionBuilder()
          .withUrl(
            process.env.REACT_APP_CHAT_URL + "?activityId=" + action.payload,
            {
              accessTokenFactory: () => currentUser?.token!,
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
      const selectedActivity = action.meta.arg.selectedActivity;
      action.meta.arg.values.activityId = selectedActivity?.id;
    });
  },
});

export const { createHubConnection, stopHubConnection, clearComments } =
  commentSlice.actions;
