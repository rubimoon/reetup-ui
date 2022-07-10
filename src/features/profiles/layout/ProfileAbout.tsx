import { useEffect, useState } from "react";
import { Button, Grid, Header, Tab } from "semantic-ui-react";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import ProfileEditForm from "../form/ProfileEditForm";
import { setIsCurrentUser } from "../profileSlice";

const ProfileAbout = () => {
  const { profile, isCurrentUser } = useAppSelector((state) => state.profile);
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user && profile) {
      dispatch(setIsCurrentUser(user.username === profile.username));
    }
  }, [dispatch, profile, user]);

  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width="16">
          <Header
            floated="left"
            icon="user"
            content={`About ${profile?.displayName}`}
          />
          {isCurrentUser && (
            <Button
              floated="right"
              basic
              content={editMode ? "Cancel" : "Edit Profile"}
              onClick={() => setEditMode(!editMode)}
            />
          )}
        </Grid.Column>
        <Grid.Column width="16">
          {editMode ? (
            <ProfileEditForm setEditMode={setEditMode} />
          ) : (
            <span style={{ whiteSpace: "pre-wrap" }}>{profile?.bio}</span>
          )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
};

export default ProfileAbout;
