import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { Activity } from "../../app/models/activity";
import { PagingParams } from "../../app/models/pagination";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { loadActivitiesAsync, setPagingParams } from "./activitySlice";

export default function useActivities() {
  const {
    activityRegistry,
    loadingInitial,
    pagingParams,
    predicate,
    pagination,
  } = useAppSelector((state) => state.activities);

  const [loadingNext, setLoadingNext] = useState(false);

  const dispatch = useAppDispatch();

  const generateAxiosParams = useCallback(() => {
    const params = new URLSearchParams();
    params.append("pageNumber", pagingParams.pageNumber.toString());
    params.append("pageSize", pagingParams.pageSize.toString());
    predicate.forEach((value, key) => {
      if (key === "startDate") {
        params.append(key, (value as Date).toISOString());
      } else {
        params.append(key, value);
      }
    });
    return params;
  }, [pagingParams.pageNumber, pagingParams.pageSize, predicate]);

  useEffect(() => {
    if (activityRegistry.size <= 1) {
      const params = generateAxiosParams();
      dispatch(loadActivitiesAsync({ params }));
      setLoadingNext(false);
    }
  }, [
    activityRegistry.size,
    dispatch,
    generateAxiosParams,
    loadingInitial,
    pagination,
  ]);

  const handleGetNext = () => {
    const params = generateAxiosParams();
    setLoadingNext(true);
    setPagingParams(new PagingParams(pagination!.currentPage + 1));
    dispatch(loadActivitiesAsync({ params }));
    setLoadingNext(false);
  };

  const activitiesByDate = Array.from(activityRegistry.values()).sort(
    (a, b) => a.date!.getTime() - b.date!.getTime()
  );

  const groupedActivities = Object.entries(
    activitiesByDate.reduce((activities, activity) => {
      const date = format(activity.date!, "dd MMM yyyy");
      activities[date] = activities[date]
        ? [...activities[date], activity]
        : [activity];
      return activities;
    }, {} as { [key: string]: Activity[] })
  );

  const hasMore =
    !loadingNext &&
    !!pagination &&
    pagination.currentPage < pagination.totalPages;

  return {
    handleGetNext,
    loadingNext,
    groupedActivities,
    hasMore,
    loadingInitial,
  };
}
