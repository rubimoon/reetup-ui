import { Link, NavLink } from "react-router-dom";
import { Button, Container, Menu, Image, Dropdown } from "semantic-ui-react";
import {
  logout,
  useLoggedInUser,
  useUserAuth,
} from "../../features/users/userSlice";
import { setToken } from "../store/commonSlice";
import { useAppDispatch } from "../store/configureStore";
import { history } from "../..";

const NavBar = () => {
  const isLoggedIn = useUserAuth();
  const currentUser = useLoggedInUser();
  const dispatch = useAppDispatch();
  const handleLogout = () => {
    dispatch(setToken(null));
    dispatch(logout());
    history.push("/");
  };

  return (
    <Menu inverted fixed="top">
      <Container>
        <Menu.Item as={NavLink} to="/" header>
          <img
            src="/assets/logo.png"
            alt="logo"
            style={{ marginRight: "10px" }}
          />
          Reetup
        </Menu.Item>
        {isLoggedIn && (
          <>
            ( <Menu.Item as={NavLink} to="/activities" name="Activities" />
            <Menu.Item>
              <Button
                as={NavLink}
                to="/createActivity"
                positive
                content="Create Activity"
              />
            </Menu.Item>
            <Menu.Item position="right">
              <Image
                src={currentUser.image || "/assets/user.png"}
                avatar
                spaced="right"
              />
              <Dropdown pointing="top left" text={currentUser.displayName}>
                <Dropdown.Menu>
                  <Dropdown.Item
                    as={Link}
                    to={`/profiles/${currentUser.username}`}
                    text="My Profile"
                    icon="user"
                  />
                  <Dropdown.Item
                    onClick={handleLogout}
                    text="Logout"
                    icon="power"
                  />
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>
            )
          </>
        )}
      </Container>
    </Menu>
  );
};

export default NavBar;
