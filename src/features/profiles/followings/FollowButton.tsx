import { SyntheticEvent } from "react";
import { Reveal, Button } from "semantic-ui-react";
import { updateFollowingAsync } from ".";
import { Profile } from "../../../app/models/profile";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";

interface Props {
  profile: Profile;
}

const FollowButton = ({ profile }: Props) => {
  const { loading } = useAppSelector((state) => state.profile);
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();

  if (user?.username === profile.username) return null;

  function handleFollow(e: SyntheticEvent, username: string) {
    e.preventDefault();
    profile.following
      ? dispatch(updateFollowingAsync({ username, following: false }))
      : dispatch(updateFollowingAsync({ username, following: true }));
  }

  return (
    <Reveal animated="move">
      <Reveal.Content visible style={{ width: "100%" }}>
        <Button
          fluid
          color="teal"
          content={profile.following ? "Following" : "Not following"}
        />
      </Reveal.Content>
      <Reveal.Content hidden style={{ width: "100%" }}>
        <Button
          fluid
          basic
          color={profile.following ? "red" : "green"}
          content={profile.following ? "Unfollow" : "Follow"}
          loading={loading}
          onClick={(e) => handleFollow(e, profile.username)}
        />
      </Reveal.Content>
    </Reveal>
  );
};

export default FollowButton;
