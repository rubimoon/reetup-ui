import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Activity } from "../../app/models/activity";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { loadActivitiesAsync, setPagingParams } from "./activitySlice";

export default function useActivities() {
  const { activityRegistry, loadingInitial, pagination } = useAppSelector(
    (state) => state.activities
  );
  const [loadingNext, setLoadingNext] = useState(false);
  const [groupedActivities, setGroupedActivities] = useState<
    [string, Activity[]][]
  >([]);
  const dispatch = useAppDispatch();

  const handleGetNext = () => {
    setLoadingNext(true);
    dispatch(setPagingParams(pagination!.currentPage + 1));
    dispatch(loadActivitiesAsync());
    setLoadingNext(false);
  };

  useEffect(() => {
    if (Object.keys(activityRegistry).length <= 1)
      dispatch(loadActivitiesAsync());

    const activitiesByDate = Object.values(activityRegistry).sort((a, b) => {
      return new Date(a.date!).getTime() - new Date(b.date!).getTime();
    });

    const arr = Object.entries(
      activitiesByDate.reduce((activities, activity) => {
        const date = format(new Date(activity.date!), "dd MMM yyyy");
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [key: string]: Activity[] })
    );
    setGroupedActivities(arr);
    setLoadingNext(false);
  }, [activityRegistry, dispatch]);

  const hasMore =
    !loadingNext &&
    !!pagination &&
    pagination.currentPage < pagination.totalPages;

  return {
    groupedActivities,
    handleGetNext,
    loadingNext,
    hasMore,
    loadingInitial,
  };
}
