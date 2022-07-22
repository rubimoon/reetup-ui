import { Link } from "react-router-dom";
import {
  Container,
  Header,
  Segment,
  Image,
  Button,
  Divider,
} from "semantic-ui-react";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { openModal } from "../../app/common/modals/modalSlice";
import { facebookLoginAsync } from "../users/userSlice";
import { history } from "../../";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { fbLoading, user, fbAccessToken } = useAppSelector(
    (state) => state.user
  );
  const isLoggedIn = !!user;

  const handleFacebookLogin = () => {
    dispatch(facebookLoginAsync(fbAccessToken));
    history.push("/activities");
  };

  return (
    <Segment inverted textAlign="center" vertical className="masthead">
      <Container text>
        <Header as="h1" inverted>
          <Image
            size="massive"
            src="/assets/logo.png"
            alt="logo"
            style={{ marginBottom: 12 }}
          />
          Reactivities
        </Header>
        {isLoggedIn ? (
          <>
            <Header as="h2" inverted content="Welcome to Reactivities" />
            <Button as={Link} to="/activities" size="huge" inverted>
              Go to Activities!
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => dispatch(openModal("LoginForm"))}
              size="huge"
              inverted
            >
              Login!
            </Button>
            <Button
              onClick={() => dispatch(openModal("RegisterForm"))}
              size="huge"
              inverted
            >
              Register!
            </Button>
            <Divider horizontal inverted>
              Or
            </Divider>
            <Button
              loading={fbLoading}
              size="huge"
              inverted
              color="facebook"
              content="Login with Facebook"
              onClick={handleFacebookLogin}
            />
          </>
        )}
      </Container>
    </Segment>
  );
};

export default HomePage;
