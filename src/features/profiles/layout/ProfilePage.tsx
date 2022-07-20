import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import { loadProfileAsync, setActiveTab } from "../profileSlice";
import ProfileContent from "./ProfileContent";

import ProfileHeader from "./ProfileHeader";

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { loadingProfile, profile } = useAppSelector((state) => state.profile);

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (username) {
      dispatch(loadProfileAsync(username));
    }
    return () => {
      dispatch(setActiveTab(0));
    };
  }, [dispatch, username]);

  if (loadingProfile) return <LoadingComponent content="Loading profile..." />;

  return (
    <Grid>
      <Grid.Column width={16}>
        {profile && (
          <>
            <ProfileHeader profile={profile} />
            <ProfileContent profile={profile} />
          </>
        )}
      </Grid.Column>
    </Grid>
  );
};

export default ProfilePage;
