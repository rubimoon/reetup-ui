import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Container } from "semantic-ui-react";
import { getCurrentUserAysnc } from "../../features/users/userSlice";
import ModalContainer from "../common/modals/ModalContainer";
import { setAppLoaded } from "../store/commonSlice";
import { useAppDispatch, useAppSelector } from "../store/configureStore";
import AppRoutes from "./AooRoutes";
import LoadingComponent from "./LoadingComponent";
import NavBar from "./NavBar";

const App = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { token, appLoaded } = useAppSelector((state) => state.common);
  const isLoggedIn = !!useAppSelector((state) => state.user.user);

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUserAysnc()).finally(() => setAppLoaded());
    }
    // } else {
    //   userStore.getFacebookLoginStatus().then(() => commonStore.setAppLoaded());
    // }
  }, [dispatch, token]);

  if (!appLoaded) return <LoadingComponent content="Loading app..." />;

  return (
    <>
      <ToastContainer position="bottom-right" hideProgressBar />
      <ModalContainer />
      <NavBar />
      <Container style={{ marginTop: "7em" }}>
        <AppRoutes location={location} isLoggedIn={isLoggedIn} />
      </Container>
    </>
  );
};

export default App;
