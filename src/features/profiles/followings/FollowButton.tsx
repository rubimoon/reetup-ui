import { SyntheticEvent } from "react";
import { Reveal, Button } from "semantic-ui-react";
import { Profile } from "../../../app/models/profile";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import { useLoggedInUser } from "../../users/userSlice";
import { updateFollowingAsync } from "../profileSlice";

interface Props {
  profile: Profile;
}

const FollowButton = ({ profile }: Props) => {
  const { isLoading } = useAppSelector((state) => state.profile);
  // const { currentUser } = useAppSelector((state) => state.user);
  const currentUser = useLoggedInUser();
  const dispatch = useAppDispatch();

  if (currentUser?.username === profile.username) return null;

  function handleFollow(e: SyntheticEvent, username: string) {
    e.preventDefault();
    profile.isFollowing
      ? dispatch(updateFollowingAsync({ username, following: false }))
      : dispatch(updateFollowingAsync({ username, following: true }));
  }

  return (
    <Reveal animated="move">
      <Reveal.Content visible style={{ width: "100%" }}>
        <Button
          fluid
          color="teal"
          content={profile.isFollowing ? "Following" : "Not following"}
        />
      </Reveal.Content>
      <Reveal.Content hidden style={{ width: "100%" }}>
        <Button
          fluid
          basic
          color={profile.isFollowing ? "red" : "green"}
          content={profile.isFollowing ? "Unfollow" : "Follow"}
          loading={isLoading}
          onClick={(e) => handleFollow(e, profile.username)}
        />
      </Reveal.Content>
    </Reveal>
  );
};

export default FollowButton;
