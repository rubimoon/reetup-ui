import { useState } from "react";
import Calendar from "react-calendar";
import { Header, Menu } from "semantic-ui-react";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import {
  resetActivityRegistry,
  setFilter,
  setStartDate,
} from "../activitySlice";
import { ActivityFilter } from "../activityState";

const ActivityFilters = () => {
  const { filter } = useAppSelector((state) => state.activities);
  const [dateValue, setDateValue] = useState<Date>(new Date());
  const dispatch = useAppDispatch();

  const handleStartDate = (date: any) => {
    setDateValue(new Date(date));
    const plainDate = dateValue.toISOString();
    dispatch(resetActivityRegistry());
    dispatch(setStartDate(plainDate));
  };

  const handleFilter = (filter: ActivityFilter) => {
    dispatch(resetActivityRegistry());
    dispatch(setFilter(filter));
  };

  return (
    <>
      <Menu vertical size="large" style={{ width: "100%", marginTop: 25 }}>
        <Header icon="filter" attached color="teal" content="Filters" />
        <Menu.Item
          content="All Activites"
          active={filter === "all"}
          onClick={() => {
            handleFilter("all");
          }}
        />
        <Menu.Item
          content="I'm going"
          active={filter === "isGoing"}
          onClick={() => {
            handleFilter("isGoing");
          }}
        />
        <Menu.Item
          content="I'm hosting"
          active={filter === "isHost"}
          onClick={() => {
            handleFilter("isHost");
          }}
        />
      </Menu>
      <Header />
      <Calendar
        onChange={(date: any) => handleStartDate(date)}
        value={dateValue || new Date()}
      />
    </>
  );
};

export default ActivityFilters;
