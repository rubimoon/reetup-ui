import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { loadActivitiesAsync, setPagingParams } from "./activitySlice";

export default function useActivities() {
  const { loadingInitial, pagination, pagingParams, startDate, filter } =
    useAppSelector((state) => state.activities);
  const [loadingNext, setLoadingNext] = useState(false);

  const dispatch = useAppDispatch();

  const handleGetNext = () => {
    setLoadingNext(true);
    dispatch(setPagingParams(pagination!.currentPage + 1));
    setLoadingNext(false);
  };

  useEffect(() => {
    dispatch(loadActivitiesAsync({ pagingParams, startDate, filter }));
    setLoadingNext(false);
  }, [dispatch, filter, pagingParams, startDate]);

  return {
    handleGetNext,
    loadingNext,
    pagination,
    loadingInitial,
  };
}
