import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Activity } from "../../app/models/activity";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { loadActivitiesAsync, setPagingParams } from "./activitySlice";

export default function useActivities() {
  const {
    activityRegistry,
    loadingInitial,
    pagination,
    pagingParams,
    startDate,
    filter,
  } = useAppSelector((state) => state.activities);
  const [loadingNext, setLoadingNext] = useState(false);
  const [groupedActivities, setGroupedActivities] = useState<
    [string, Activity[]][]
  >([]);
  const dispatch = useAppDispatch();

  const handleGetNext = () => {
    setLoadingNext(true);
    dispatch(setPagingParams(pagination!.currentPage + 1));
    setLoadingNext(false);
  };

  useEffect(() => {
    console.log("registry size", Object.keys(activityRegistry).length);
    if (Object.keys(activityRegistry).length <= 1) {
      dispatch(loadActivitiesAsync({ pagingParams, startDate, filter }));
    }
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
  }, [activityRegistry, dispatch, filter, pagingParams, startDate]);

  return {
    groupedActivities,
    handleGetNext,
    loadingNext,
    pagination,
    loadingInitial,
  };
}
