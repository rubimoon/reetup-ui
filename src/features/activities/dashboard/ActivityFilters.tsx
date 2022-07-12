import { format } from "date-fns";
import { useState } from "react";
import Calendar from "react-calendar";
import { Header, Menu } from "semantic-ui-react";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import { loadActivitiesAsync, setPredicate } from "../activitySlice";

const ActivityFilters = () => {
  const { predicate } = useAppSelector((state) => state.activities);
  const [dateValue, setDateValue] = useState<Date>(new Date());
  const dispatch = useAppDispatch();

  const handleStartFilter = (date: any) => {
    setDateValue(new Date(date));
    // const plainDate = format(dateValue, "yyyy-MM-dd");
    const plainDate = dateValue.toISOString();
    dispatch(setPredicate({ predicate: "startDate", value: plainDate }));
    dispatch(loadActivitiesAsync());
  };

  return (
    <>
      <Menu vertical size="large" style={{ width: "100%", marginTop: 25 }}>
        <Header icon="filter" attached color="teal" content="Filters" />
        <Menu.Item
          content="All Activites"
          active={"all" in predicate}
          onClick={() => {
            dispatch(setPredicate({ predicate: "all", value: "true" }));
            dispatch(loadActivitiesAsync());
          }}
        />
        <Menu.Item
          content="I'm going"
          active={"isGoing" in predicate}
          onClick={() => {
            dispatch(setPredicate({ predicate: "isGoing", value: "true" }));
            dispatch(loadActivitiesAsync());
          }}
        />
        <Menu.Item
          content="I'm hosting"
          active={"isHost" in predicate}
          onClick={() => {
            dispatch(setPredicate({ predicate: "isHost", value: "true" }));
            dispatch(loadActivitiesAsync());
          }}
        />
      </Menu>
      <Header />
      <Calendar
        onChange={(date: any) => handleStartFilter(date)}
        value={dateValue || new Date()}
      />
    </>
  );
};

export default ActivityFilters;
