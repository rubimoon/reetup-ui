import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { activitiesSlice } from "../../features/activities/activitySlice";
import { commentSlice } from "../../features/activities/details/commentSlice";
import { userSlice } from "../../features/users/userSlice";
import { commonSlice } from "./commonSlice";
import { modalSlice } from "./modalSlice";

export const store = configureStore({
  reducer: {
    common: commonSlice.reducer,
    activities: activitiesSlice.reducer,
    user: userSlice.reducer,
    modal: modalSlice.reducer,
    comment: commentSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
