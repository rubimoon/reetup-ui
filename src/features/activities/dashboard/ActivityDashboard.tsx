import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Grid, Loader } from "semantic-ui-react";
import { PagingParams } from "../../../app/models/pagination";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import { loadActivitiesAsync, setPagingParams } from "../activitySlice";
import useActivities from "../useActivities";
import ActivityFilters from "./ActivityFilters";
import ActivityList from "./ActivityList";
import ActivityListItemPlaceholder from "./ActivityListItemPlaceholder";

const ActivityDashboard = () => {
  // const dispatch = useAppDispatch();
  // const { pagination, activityRegistry, loadingInitial } = useAppSelector(
  //   (state) => state.activities
  // );

  const { handleGetNext, loadingNext, hasMore, loadingInitial } =
    useActivities();

  // const [loadingNext, setLoadingNext] = useState(false);

  // function handleGetNext() {
  //   setLoadingNext(true);
  //   setPagingParams(new PagingParams(pagination!.currentPage + 1));
  //   // dispatch(loadActivitiesAsync());
  //   setLoadingNext(false);
  // }

  // useEffect(() => {
  //   if (activityRegistry.size <= 1) dispatch(loadActivitiesAsync());
  // }, [activityRegistry.size, dispatch]);

  return (
    <Grid>
      <Grid.Column width="10">
        {loadingInitial && !loadingNext ? (
          <>
            <ActivityListItemPlaceholder />
            <ActivityListItemPlaceholder />
          </>
        ) : (
          <InfiniteScroll
            pageStart={0}
            loadMore={handleGetNext}
            hasMore={hasMore}
            initialLoad={false}
          >
            <ActivityList />
          </InfiniteScroll>
        )}
      </Grid.Column>
      <Grid.Column width="6">
        <ActivityFilters />
      </Grid.Column>
      <Grid.Column width={10}>
        <Loader active={loadingNext} />
      </Grid.Column>
    </Grid>
  );
};

export default ActivityDashboard;
