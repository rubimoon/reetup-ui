import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { loadActivitiesAsync, setPagingParams } from "./activitySlice";

export default function useActivities() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.user);
  const {
    loadingInitial,
    pagination,
    pagingParams,
    startDate,
    filter,
    groupedActivities,
    activityRegistry,
  } = useAppSelector((state) => state.activities);

  const [loadingNext, setLoadingNext] = useState(false);

  const handleGetNext = () => {
    if (!currentUser) return;
    setLoadingNext(true);
    dispatch(setPagingParams(pagination!.currentPage + 1));
    dispatch(
      loadActivitiesAsync({ currentUser, pagingParams, startDate, filter })
    );
    setLoadingNext(false);
  };

  useEffect(() => {
    if (!currentUser || Object.keys(activityRegistry).length > 1) return;
    dispatch(
      loadActivitiesAsync({ currentUser, pagingParams, startDate, filter })
    );
  }, [
    activityRegistry,
    currentUser,
    dispatch,
    filter,
    pagingParams,
    startDate,
  ]);

  return {
    handleGetNext,
    loadingNext,
    pagination,
    loadingInitial,
    groupedActivities,
  };
}
