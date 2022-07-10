import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { Activity } from "../../app/models/activity";
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
  const [groupedActivities, setGroupedActivities] = useState<
    [string, Activity[]][]
  >([]);
  const [axiosParams, setAxiosParams] = useState<URLSearchParams>();
  const dispatch = useAppDispatch();

  const handleAxiosParams = useCallback(() => {
    console.log("handleAxiosParams");
    const params = new URLSearchParams();
    params.append("pageNumber", pagingParams.pageNumber!.toString());
    params.append("pageSize", pagingParams.pageSize!.toString());
    Object.entries(predicate).forEach((value) => {
      if (value[0] === "startDate") {
        params.append(value[0], (value[1] as Date).toISOString());
      } else {
        params.append(value[0], value[1]);
      }
    });
    setAxiosParams(params);
  }, [pagingParams.pageNumber, pagingParams.pageSize, predicate]);

  const handleGroupedActivities = useCallback(() => {
    console.log("handleGroupedActivities");
    const activitiesByDate = Object.values(activityRegistry).sort(
      (a, b) => a.date!.getTime() - b.date!.getTime()
    );

    const arr = Object.entries(
      activitiesByDate.reduce((activities, activity) => {
        const date = format(activity.date!, "dd MMM yyyy");
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [key: string]: Activity[] })
    );
    setGroupedActivities(arr);
  }, [activityRegistry]);

  const handleGetNext = () => {
    console.log("handleNext");
    setLoadingNext(true);
    dispatch(setPagingParams(pagination!.currentPage + 1));
    handleAxiosParams();
    if (axiosParams) {
      dispatch(loadActivitiesAsync({ params: axiosParams }));
    }
    setLoadingNext(false);
  };

  useEffect(() => {
    console.log("useEffect");
    handleAxiosParams();
    if (axiosParams) {
      dispatch(loadActivitiesAsync({ params: axiosParams }));
    } else {
      console.log("axiosParam is false");
    }
    handleGroupedActivities();
    setLoadingNext(false);
  }, [axiosParams, dispatch, handleAxiosParams, handleGroupedActivities]);

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
