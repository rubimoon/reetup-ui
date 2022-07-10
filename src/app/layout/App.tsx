import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Container } from "semantic-ui-react";
import {
  getCurrentUserAysnc,
  getFacebookLoginStatusAsync,
} from "../../features/users/userSlice";
import ModalManager from "../common/modals/ModalManager";
import { setAppLoaded } from "../store/commonSlice";
import { useAppDispatch, useAppSelector } from "../store/configureStore";
import AppRoutes from "./AppRoutes";
import LoadingComponent from "./LoadingComponent";
import NavBar from "./NavBar";

const App = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { token, appLoaded } = useAppSelector((state) => state.common);
  const currentUser = useAppSelector((state) => state.user.user);

  useEffect(() => {
    if (token) {
      console.log("token is ", token);
      console.log("user has token in the browser");
      dispatch(getCurrentUserAysnc())
        .catch((err) => {
          console.log(err);
        })
        .then(() => {
          dispatch(setAppLoaded());
        });
    } else {
      console.log("user doesn't have token the browser");
      dispatch(getFacebookLoginStatusAsync()).then(() => {
        dispatch(setAppLoaded());
      });
    }
  }, [dispatch, token]);

  if (!appLoaded) return <LoadingComponent content="Loading app..." />;

  return (
    <>
      <ModalManager />
      <ToastContainer position="bottom-right" hideProgressBar />
      <NavBar />
      <Container style={{ marginTop: "7em" }}>
        <AppRoutes location={location} isLoggedIn={!!currentUser} />
      </Container>
    </>
  );
};

export default App;
