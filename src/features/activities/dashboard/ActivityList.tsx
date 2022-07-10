import { Fragment } from "react";
import { Header } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";
import ActivityListItem from "./ActivityListItem";

interface Props {
  groupedActivities: [string, Activity[]][];
}
const ActivityList = ({ groupedActivities }: Props) => {
  console.log("groupedActivities", groupedActivities);
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
