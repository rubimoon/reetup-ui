import { Route, Routes } from "react-router-dom";
import HomePage from "../../features/home/HomePage";
import ProtectedRoute from "./PrivateRoute";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import ActivityDetails from "../../features/activities/details/ActivityDetails";
import ActivityForm from "../../features/activities/form/ActivityForm";

interface Props {
  location: any;
  isLoggedIn: boolean;
}

const AppRoutes = ({ location, isLoggedIn }: Props) => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path={"/(.+)"}>
        <Route
          path="/activities"
          element={
            <ProtectedRoute
              isAuthenticated={false}
              outlet={<ActivityDashboard />}
            />
          }
        />
        <Route
          path="/activities/:id"
          element={
            <ProtectedRoute
              isAuthenticated={isLoggedIn}
              outlet={<ActivityDetails />}
            />
          }
        />
        <Route
          key={location.key}
          path="/createActivity"
          element={
            <ProtectedRoute
              isAuthenticated={isLoggedIn}
              outlet={<ActivityForm />}
            />
          }
        />
        <Route
          key={location.key}
          path="/manage/:id"
          element={
            <ProtectedRoute
              isAuthenticated={isLoggedIn}
              outlet={<ActivityForm />}
            />
          }
        />

        {/* <PrivateRoute
          path="/profiles/:username"
          element={
            <ProtectedRoute
              isAuthenticated={isLoggedIn}
              outlet={<ProfilePage />}
            />
          }
        /> */}
        {/* <PrivateRoute path="/errors" element={TestErrors} />
        <Route path="/server-error" element={ServerError} />
        <Route path="/account/registerSuccess" element={RegisterSuccess} />
        <Route path="/account/verifyEmail" element={ConfirmEmail} />
        <Route element={NotFound} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
