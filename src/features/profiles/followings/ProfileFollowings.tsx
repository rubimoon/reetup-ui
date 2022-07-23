import { useEffect } from "react";
import { Tab, Grid, Header, Card } from "semantic-ui-react";
import {
  useAppSelector,
  useAppDispatch,
} from "../../../app/store/configureStore";
import ProfileCard from "../layout/ProfileCard";
import { loadFollowingsAsync } from "../profileSlice";

const ProfileFollowings = () => {
  const { profile, followings, isLoadingFollowings, activeTab } =
    useAppSelector((state) => state.profile);
  const dispatch = useAppDispatch();

  useEffect(() => {
    switch (activeTab) {
      case 3:
        dispatch(loadFollowingsAsync("followers"));
        break;
      case 4:
        dispatch(loadFollowingsAsync("following"));
        break;
    }
  }, [activeTab, dispatch]);

  return (
    <Tab.Pane loading={isLoadingFollowings}>
      <Grid>
        <Grid.Column width="16">
          <Header
            floated="left"
            icon="user"
            content={
              activeTab === 3
                ? `People following ${profile!.displayName}`
                : `People ${profile!.displayName} is following`
            }
          />
        </Grid.Column>
        <Grid.Column width="16">
          <Card.Group itemsPerRow={4}>
            {followings.map((profile) => (
              <ProfileCard key={profile.username} profile={profile} />
            ))}
          </Card.Group>
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
};
export default ProfileFollowings;
