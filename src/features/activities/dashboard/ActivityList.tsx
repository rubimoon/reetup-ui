import { format } from "date-fns";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Header } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";
import ActivityListItem from "./ActivityListItem";

interface Props {
  activities: { [key: string]: Activity };
}

const ActivityList = ({ activities }: Props) => {
  const [activitiesByDate, setActivitiesByDate] = useState<Activity[]>([]);
  const [groupedActivities, setGroupedActivities] = useState<
    [string, Activity[]][]
  >([]);

  const handleActivitiesByDate = useCallback(() => {
    const arr = Object.values(activities).sort(
      (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
    );
    setActivitiesByDate(arr);
  }, [activities]);

  const handleGroupedActivities = useCallback(() => {
    const arr = Object.entries(
      activitiesByDate.reduce((activities, activity) => {
        const date = format(new Date(activity.date!), "dd MMM yyyy");
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [key: string]: Activity[] })
    );
    setGroupedActivities(arr);
  }, [activitiesByDate]);

  useEffect(() => {
    handleActivitiesByDate();
    handleGroupedActivities();
  }, [handleActivitiesByDate, handleGroupedActivities]);

  if (!activities) return <h1>There is no Activity. Please create one.</h1>;

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
