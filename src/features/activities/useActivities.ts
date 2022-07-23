import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { useLoggedInUser } from "../users/userSlice";
import { loadActivitiesAsync, setPagingNumber } from "./activitySlice";

export default function useActivities() {
  const dispatch = useAppDispatch();
  const currentUser = useLoggedInUser();
  const { isLoadingInitial, pagination, pagingParams, startDate, filter } =
    useAppSelector((state) => state.activities);

  const [isLoadingNext, setIsLoadingNext] = useState(false);

  const handleGetNext = () => {
    setIsLoadingNext(true);
    dispatch(setPagingNumber(pagination!.currentPage + 1));
    dispatch(
      loadActivitiesAsync({
        currentUser,
        pagingParams,
        startDate,
        filter,
      })
    );
    setIsLoadingNext(false);
  };

  useEffect(() => {
    dispatch(
      loadActivitiesAsync({
        currentUser,
        pagingParams,
        startDate,
        filter,
      })
    );
  }, [currentUser, dispatch, filter, pagingParams, startDate]);

  return {
    handleGetNext,
    isLoadingNext,
    pagination,
    isLoadingInitial,
  };
}
