import { Fragment } from "react";
import { Header } from "semantic-ui-react";
import { useAppSelector } from "../../../app/store/configureStore";
import ActivityListItem from "./ActivityListItem";

const ActivityList = () => {
  const groupedActivities = useAppSelector(
    (state) => state.activities.groupedActivities
  );

  return (
    <>
      {groupedActivities.map(([group, activities]) => (
        <Fragment key={group}>
          <Header sub color="teal">
            {group}
          </Header>
          {activities.map((activity) => (
            <ActivityListItem key={activity.id} activity={activity} />
          ))}
        </Fragment>
      ))}
    </>
  );
};

export default ActivityList;
