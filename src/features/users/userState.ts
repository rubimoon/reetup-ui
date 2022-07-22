import { User } from "../../app/models/user";

export interface UserState {
  user: User | null;
  email: string;
}

export const initialState: UserState = {
  user: null,
  email: "",
};
