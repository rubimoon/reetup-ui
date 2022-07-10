import { Route, Routes } from "react-router-dom";
import HomePage from "../../features/home/HomePage";
import ProtectedRoute from "./PrivateRoute";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import ActivityDetails from "../../features/activities/details/ActivityDetails";
import ActivityForm from "../../features/activities/form/ActivityForm";
import NotFound from "../errors/ui/NotFound";
import RegisterSuccess from "../../features/users/RegisterSuccess";
import ConfirmEmail from "../../features/users/ConfirmEmail";
import ServerError from "../errors/ui/ServerError";
import TestErrors from "../errors/ui/TestError";

interface Props {
  location: any;
  isLoggedIn: boolean;
}

const AppRoutes = ({ location, isLoggedIn }: Props) => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/activities" element={<ActivityDashboard />} />
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
      <Route path="/errors" element={<TestErrors />} />
      <Route path="/server-error" element={<ServerError />} />
      <Route path="/account/registerSuccess" element={<RegisterSuccess />} />
      <Route path="/account/verifyEmail" element={<ConfirmEmail />} />
      <Route path="not-found" element={<NotFound />} />

      {/* <PrivateRoute
          path="/profiles/:username"
          element={
            <ProtectedRoute
              isAuthenticated={isLoggedIn}
              outlet={<ProfilePage />}
            />
          }
        /> */}
      {/* 
      

      
        <Route element={NotFound} /> */}
    </Routes>
  );
};

export default AppRoutes;
