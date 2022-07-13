import { useState } from "react";
import Calendar from "react-calendar";
import { Header, Menu } from "semantic-ui-react";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import { setFilter, setStartDate } from "../activitySlice";

const ActivityFilters = () => {
  const { filter } = useAppSelector((state) => state.activities);
  const [dateValue, setDateValue] = useState<Date>(new Date());
  const dispatch = useAppDispatch();

  const handleStartDate = (date: any) => {
    setDateValue(new Date(date));
    const plainDate = dateValue.toISOString();
    dispatch(setStartDate(plainDate));
  };

  return (
    <>
      <Menu vertical size="large" style={{ width: "100%", marginTop: 25 }}>
        <Header icon="filter" attached color="teal" content="Filters" />
        <Menu.Item
          content="All Activites"
          active={filter === "all"}
          onClick={() => {
            dispatch(setFilter("all"));
          }}
        />
        <Menu.Item
          content="I'm going"
          active={filter === "isGoing"}
          onClick={() => {
            dispatch(setFilter("isGoing"));
          }}
        />
        <Menu.Item
          content="I'm hosting"
          active={filter === "isHost"}
          onClick={() => {
            dispatch(setFilter("isHost"));
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
