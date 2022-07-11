import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import { clearSelectedActivity, loadActivityAsync } from "../activitySlice";
import ActivityDetailedChat from "./comments/ActivityDetailedChat";
import ActivityDetailedInfo from "./ActivityDetailedInfo";
import ActivityDetailedSidebar from "./ActivityDetailedSidebar";
import ActivityDetailedHeader from "./ActivityDetaledHeader";

const ActivityDetails = () => {
  const dispatch = useAppDispatch();
  const { selectedActivity: activity, loadingInitial } = useAppSelector(
    (state) => state.activities
  );
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    // TODO
    if (id) {
      dispatch(loadActivityAsync(id));
    }
    clearSelectedActivity();
  }, [id, dispatch]);

  if (loadingInitial || !activity) return <LoadingComponent />;

  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityDetailedHeader activity={activity} />
        <ActivityDetailedInfo activity={activity} />
        <ActivityDetailedChat activity={activity} />
      </Grid.Column>
      <Grid.Column width={6}>
        <ActivityDetailedSidebar activity={activity} />
      </Grid.Column>
    </Grid>
  );
};

export default ActivityDetails;
