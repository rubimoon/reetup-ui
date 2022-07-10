import { Profile, UserActivity } from "../../app/models/profile";

export interface ProfileState {
  profile: Profile | null;
  loadingProfile: boolean;
  uploading: boolean;
  loading: boolean;
  activeTab: number;
  userActivities: UserActivity[];
  loadingActivities: boolean;
  followings: Profile[];
  loadingFollowings: boolean;
  isCurrentUser: boolean | undefined;
}

export const initialState: ProfileState = {
  profile: null,
  loadingProfile: false,
  uploading: false,
  loading: false,
  activeTab: 0,
  userActivities: [],
  loadingActivities: false,
  followings: [],
  loadingFollowings: false,
  isCurrentUser: undefined,
};
