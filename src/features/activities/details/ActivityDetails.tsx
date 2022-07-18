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
  const { selectedActivity, loadingInitial } = useAppSelector(
    (state) => state.activities
  );
  const user = useAppSelector((state) => state.user.user);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!user) return;
    if (id) dispatch(loadActivityAsync({ currentUser: user, id }));
    return () => {
      dispatch(clearSelectedActivity());
    };
  }, [id, dispatch, user]);

  if (loadingInitial || !selectedActivity) return <LoadingComponent />;

  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityDetailedHeader activity={selectedActivity} />
        <ActivityDetailedInfo activity={selectedActivity} />
        <ActivityDetailedChat activity={selectedActivity} />
      </Grid.Column>
      <Grid.Column width={6}>
        <ActivityDetailedSidebar activity={selectedActivity} />
      </Grid.Column>
    </Grid>
  );
};

export default ActivityDetails;
