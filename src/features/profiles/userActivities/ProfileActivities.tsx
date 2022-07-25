import { SyntheticEvent, useEffect } from "react";
import { Tab, Grid, Header, Card, Image, TabProps } from "semantic-ui-react";
import { Link } from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import { UserActivity } from "../../../app/models/profile";
import { loadUserActivitiesAsync } from "../profileSlice";
import { formatDoLLL, formatTime } from "../../../app/common/utils/date";

const panes = [
  { menuItem: "Future Activites", pane: { key: "future" } },
  { menuItem: "Past Activities", pane: { key: "past" } },
  { menuItem: "Hosting", pane: { key: "hosting" } },
];

const ProfileActivities = () => {
  const { profile, isLoadingActivities, userActivities } = useAppSelector(
    (state) => state.profile
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadUserActivitiesAsync({ username: profile!.username }));
  }, [dispatch, profile]);

  const handleTabChange = (e: SyntheticEvent, data: TabProps) => {
    dispatch(
      loadUserActivitiesAsync({
        username: profile!.username,
        predicate: panes[data.activeIndex as number].pane.key,
      })
    );
  };

  return (
    <Tab.Pane loading={isLoadingActivities}>
      <Grid>
        <Grid.Column width={16}>
          <Header floated="left" icon="calendar" content={"Activities"} />
        </Grid.Column>
        <Grid.Column width={16}>
          <Tab
            panes={panes}
            menu={{ secondary: true, pointing: true }}
            onTabChange={(e, data) => handleTabChange(e, data)}
          />
          <br />
          <Card.Group itemsPerRow={4}>
            {userActivities.map((activity: UserActivity) => (
              <Card
                as={Link}
                to={`/activities/${activity.id}`}
                key={activity.id}
              >
                <Image
                  src={`/assets/categoryImages/${activity.category}.jpg`}
                  style={{ minHeight: 100, objectFit: "cover" }}
                />
                <Card.Content>
                  <Card.Header textAlign="center">{activity.title}</Card.Header>
                  <Card.Meta textAlign="center">
                    <div>{formatDoLLL(activity.date!)}</div>
                    <div>{formatTime(activity.date!)}</div>
                  </Card.Meta>
                </Card.Content>
              </Card>
            ))}
          </Card.Group>
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
};

export default ProfileActivities;
