import { Activity, ActivityFormValues } from "../../models/activity";
import { Profile } from "../../models/profile";
import { User } from "../../models/user";

export const mapActivityFormValueToActivity = (
  formValues: ActivityFormValues
) => Object.assign({}, formValues) as Activity;

export const mapUserToProfile = (user: User): Profile => ({
  username: user.username,
  displayName: user.displayName,
  followersCount: 0,
  followingCount: 0,
  following: false,
  image: user!.image,
});

export const mapActivityToActivityFormValues = (activity: Activity) =>
  Object.assign({}, activity) as ActivityFormValues;
