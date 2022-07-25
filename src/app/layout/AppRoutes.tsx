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
import NavBar from "./NavBar";
import { Container } from "semantic-ui-react";
import { useUserAuth } from "../../features/users/userSlice";

interface Props {
  location: any;
}

const AppRoutes = ({ location }: Props) => {
  const isLoggedIn = useUserAuth();
  const wrapper = (Children: () => JSX.Element) => (
    <>
      <NavBar />
      <Container style={{ marginTop: "7em" }}>
        <Children />
      </Container>
    </>
  );

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/activities"
        element={
          <ProtectedRoute
            isAuthenticated={isLoggedIn}
            outlet={wrapper(ActivityDashboard)}
          />
        }
      />
      <Route
        path="/activities/:id"
        element={
          <ProtectedRoute
            isAuthenticated={isLoggedIn}
            outlet={wrapper(ActivityDetails)}
          />
        }
      />
      <Route
        key={location.key}
        path="/createActivity"
        element={
          <ProtectedRoute
            isAuthenticated={isLoggedIn}
            outlet={wrapper(ActivityForm)}
          />
        }
      />
      <Route
        key={location.key}
        path="/manage/:id"
        element={
          <ProtectedRoute
            isAuthenticated={isLoggedIn}
            outlet={wrapper(ActivityForm)}
          />
        }
      />
      <Route
        path="/profiles/:username"
        element={
          <ProtectedRoute
            isAuthenticated={isLoggedIn}
            outlet={wrapper(ProfilePage)}
          />
        }
      />
      <Route path="/server-error" element={wrapper(ServerError)} />
      <Route
        path="/account/registerSuccess"
        element={wrapper(RegisterSuccess)}
      />
      <Route path="/account/verifyEmail" element={wrapper(ConfirmEmail)} />
      <Route path="*" element={wrapper(NotFound)} />
    </Routes>
  );
};

export default AppRoutes;
