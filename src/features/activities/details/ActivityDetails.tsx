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
import { useLoggedInUser } from "../../users/userSlice";

const ActivityDetails = () => {
  const dispatch = useAppDispatch();
  const { selectedActivity, isLoadingInitial } = useAppSelector(
    (state) => state.activities
  );
  const currentUser = useLoggedInUser();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) dispatch(loadActivityAsync({ currentUser, id }));
    return () => {
      dispatch(clearSelectedActivity());
    };
  }, [dispatch, id, currentUser]);

  if (isLoadingInitial || !selectedActivity) return <LoadingComponent />;

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
