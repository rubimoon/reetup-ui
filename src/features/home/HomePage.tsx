import { Link } from "react-router-dom";
import {
  Container,
  Header,
  Segment,
  Image,
  Button,
  Divider,
} from "semantic-ui-react";
import { useAppDispatch } from "../../app/store/configureStore";
import { openModal } from "../../app/common/modals/modalSlice";
import { useUserAuth } from "../users/userSlice";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useUserAuth();

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
          Reetup
        </Header>
        {isLoggedIn ? (
          <>
            <Header as="h2" inverted content="Welcome to Reetup" />
            <Button as={Link} to="/activities" size="huge" inverted>
              See what’s happening!
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
              size="huge"
              inverted
              color="facebook"
              content="Login with Facebook"
            />
          </>
        )}
      </Container>
    </Segment>
  );
};

export default HomePage;
