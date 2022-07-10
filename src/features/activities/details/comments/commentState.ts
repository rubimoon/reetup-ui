import { HubConnection } from "@microsoft/signalr";
import { Activity } from "../../../../app/models/activity";
import { ChatComment } from "../../../../app/models/comment";
import { User } from "../../../../app/models/user";

interface CommentState {
  comments: ChatComment[];
  hubConnection?: HubConnection;
}

export const initialState: CommentState = {
  comments: [],
};

export interface CreateHubConnectionState {
  activity: Activity;
  currentUser: User;
}
