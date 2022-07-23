import { Profile, UserActivity } from "../../app/models/profile";

export interface ProfileState {
  profile: Profile | null;
  isLoadingProfile: boolean;
  isUploading: boolean;
  isLoading: boolean;
  activeTab: number;
  userActivities: UserActivity[];
  isLoadingActivities: boolean;
  followings: Profile[];
  isLoadingFollowings: boolean;
  isCurrentUser: boolean | undefined;
}

export const initialState: ProfileState = {
  profile: null,
  isLoadingProfile: false,
  isUploading: false,
  isLoading: false,
  activeTab: 0,
  userActivities: [],
  isLoadingActivities: false,
  followings: [],
  isLoadingFollowings: false,
  isCurrentUser: undefined,
};

export type FollowingsTypes = "following" | "followers";
