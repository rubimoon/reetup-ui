import { Tab, Grid, Header, Card } from "semantic-ui-react";
import { useAppSelector } from "../../../app/store/configureStore";
import ProfileCard from "../layout/ProfileCard";

const ProfileFollowings = () => {
  const { profile, followings, loadingFollowings, activeTab } = useAppSelector(
    (state) => state.profile
  );

  return (
    <Tab.Pane loading={loadingFollowings}>
      <Grid>
        <Grid.Column width="16">
          <Header
            floated="left"
            icon="user"
            content={
              activeTab === 3
                ? `People following ${profile!.displayName}`
                : `People ${profile?.displayName} is following`
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
