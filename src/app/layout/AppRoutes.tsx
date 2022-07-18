import { Route, Routes } from "react-router-dom";
import HomePage from "../../features/home/HomePage";
import ProtectedRoute from "../auth/ProtectedRoute";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import ActivityDetails from "../../features/activities/details/ActivityDetails";
import ActivityForm from "../../features/activities/form/ActivityForm";
import NotFound from "../errors/ui/NotFound";
import RegisterSuccess from "../../features/users/RegisterSuccess";
import ConfirmEmail from "../../features/users/ConfirmEmail";
import ServerError from "../errors/ui/ServerError";
import TestErrors from "../errors/ui/TestError";
import ProfilePage from "../../features/profiles/layout/ProfilePage";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/configureStore";
import { getCurrentUserAysnc } from "../../features/users/userSlice";

interface Props {
  location: any;
}

const AppRoutes = ({ location }: Props) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  useEffect(() => {
    dispatch(getCurrentUserAysnc());
  }, [dispatch]);
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/activities"
        element={
          <ProtectedRoute
            isAuthenticated={!!user}
            outlet={<ActivityDashboard />}
          />
        }
      />
      <Route
        path="/activities/:id"
        element={
          <ProtectedRoute
            isAuthenticated={!!user}
            outlet={<ActivityDetails />}
          />
        }
      />
      <Route
        key={location.key}
        path="/createActivity"
        element={
          <ProtectedRoute isAuthenticated={!!user} outlet={<ActivityForm />} />
        }
      />
      <Route
        key={location.key}
        path="/manage/:id"
        element={
          <ProtectedRoute isAuthenticated={!!user} outlet={<ActivityForm />} />
        }
      />
      <Route
        path="/profiles/:username"
        element={
          <ProtectedRoute isAuthenticated={!!user} outlet={<ProfilePage />} />
        }
      />
      <Route path="/errors" element={<TestErrors />} />
      <Route path="/server-error" element={<ServerError />} />
      <Route path="/account/registerSuccess" element={<RegisterSuccess />} />
      <Route path="/account/verifyEmail" element={<ConfirmEmail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
