import { Fragment, useEffect, useState } from "react";
import { Header } from "semantic-ui-react";
import { formatDate } from "../../../app/common/utils/date";
import { Activity } from "../../../app/models/activity";
import ActivityListItem from "./ActivityListItem";

interface Props {
  activityRegistry: { [key: string]: Activity };
}

const ActivityList = ({ activityRegistry }: Props) => {
  const [groupedActivities, setGroupedActivities] = useState<
    [string, Activity[]][]
  >([]);

  useEffect(() => {
    const activitiesByDate = Object.values(activityRegistry).sort(
      (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
    );
    const arr = Object.entries(
      activitiesByDate.reduce((activities, activity) => {
        const date = formatDate(activity.date!);
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [key: string]: Activity[] })
    );
    setGroupedActivities(arr);
  }, [activityRegistry]);

  if (!activityRegistry)
    return <h1>There is no Activity. Please create one.</h1>;

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
