import { Fragment, useMemo } from "react";
import { Header } from "semantic-ui-react";
import { formatDate } from "../../../app/common/utils/date";
import { Activity } from "../../../app/models/activity";
import { useAppSelector } from "../../../app/store/configureStore";
import ActivityListItem from "./ActivityListItem";

const ActivityList = () => {
  const { activityRegistry } = useAppSelector((state) => state.activities);
  const groupedActivities = useMemo(() => {
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
    return arr;
  }, [activityRegistry]);

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
