import { User } from "../../app/models/user";

export interface UserState {
  currentUser: User | null;
  email: string;
}

export const initialState: UserState = {
  currentUser: null,
  email: "",
};
