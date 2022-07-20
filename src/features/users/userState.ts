import { User } from "../../app/models/user";

export interface UserState {
  user: User | null;
  fbAccessToken: string | null;
  fbLoading: boolean;
  refreshTokenTimeout?: any;
  email: string;
}

export const initialState: UserState = {
  user: null,
  fbAccessToken: null,
  fbLoading: false,
  email: "",
};
