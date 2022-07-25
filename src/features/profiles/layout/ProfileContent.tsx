import { Tab } from "semantic-ui-react";
import { Profile } from "../../../app/models/profile";
import { useAppDispatch } from "../../../app/store/configureStore";
import ProfileFollowings from "../followings/ProfileFollowings";
import ProfilePhotos from "../photos/ProfilePhotos";
import { setActiveTab } from "../profileSlice";
import ProfileActivities from "../userActivities/ProfileActivities";
import ProfileAbout from "./ProfileAbout";

interface Props {
  profile: Profile;
}

const ProfileContent = ({ profile }: Props) => {
  const dispatch = useAppDispatch();
  const panes = [
    { menuItem: "About", render: () => <ProfileAbout /> },
    { menuItem: "Photos", render: () => <ProfilePhotos profile={profile} /> },
    { menuItem: "User Activities", render: () => <ProfileActivities /> },
    { menuItem: "Followers", render: () => <ProfileFollowings /> },
    { menuItem: "Following", render: () => <ProfileFollowings /> },
  ];

  return (
    <Tab
      menu={{ fluid: true, vertical: true }}
      menuPosition="right"
      panes={panes}
      onTabChange={(e, data) => dispatch(setActiveTab(data.activeIndex))}
    />
  );
};

export default ProfileContent;
