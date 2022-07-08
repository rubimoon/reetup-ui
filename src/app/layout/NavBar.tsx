import { Link, NavLink } from "react-router-dom";
import { Button, Container, Menu, Image, Dropdown } from "semantic-ui-react";
import { logout } from "../../features/users/userSlice";
import { useAppDispatch, useAppSelector } from "../store/configureStore";

const NavBar = () => {
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const isLoggedIn = !!user;
  const handleLogout = () => dispatch(logout());

  return (
    <Menu inverted fixed="top">
      <Container>
        <Menu.Item as={NavLink} to="/" header>
          <img
            src="/assets/logo.png"
            alt="logo"
            style={{ marginRight: "10px" }}
          />
          Reactivities
        </Menu.Item>
        {isLoggedIn && (
          <>
            <Menu.Item as={NavLink} to="/activities" name="Activities" />
            <Menu.Item as={NavLink} to="/errors" name="Errors" />
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
                src={user?.image || "/assets/user.png"}
                avatar
                spaced="right"
              />
              <Dropdown pointing="top left" text={user?.displayName}>
                <Dropdown.Menu>
                  <Dropdown.Item
                    as={Link}
                    to={`/profiles/${user?.username}`}
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
          </>
        )}
      </Container>
    </Menu>
  );
};

export default NavBar;
