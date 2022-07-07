import { HubConnection } from "@microsoft/signalr";
import { ChatComment } from "../../../app/models/comment";

interface CommentState {
  comments: ChatComment[];
  hubConnection?: HubConnection;
}

export const initialState: CommentState = {
  comments: [],
};
