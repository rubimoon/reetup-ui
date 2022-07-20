import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import {
  loadActivitiesAsync,
  setPagingParams,
  setRetainState,
} from "./activitySlice";

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
    retainState,
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
    if (retainState) return;
    dispatch(
      loadActivitiesAsync({
        currentUser: currentUser!,
        pagingParams,
        startDate,
        filter,
      })
    );
    return () => {
      dispatch(setRetainState());
    };
  }, [currentUser, dispatch, filter, pagingParams, retainState, startDate]);

  return {
    handleGetNext,
    loadingNext,
    pagination,
    loadingInitial,
    groupedActivities,
  };
}
