import Calendar from "react-calendar";
import { Header, Menu } from "semantic-ui-react";
import { useAppSelector } from "../../../app/store/configureStore";
import { setPredicate } from "../activitySlice";

const ActivityFilters = () => {
  const { predicate } = useAppSelector((state) => state.activities);
  return (
    <>
      <Menu vertical size="large" style={{ width: "100%", marginTop: 25 }}>
        <Header icon="filter" attached color="teal" content="Filters" />
        <Menu.Item
          content="All Activites"
          active={predicate.has("all")}
          onClick={() => setPredicate({ predicate: "all", value: "true" })}
        />
        <Menu.Item
          content="I'm going"
          active={predicate.has("isGoing")}
          onClick={() => setPredicate({ predicate: "isGoing", value: "true" })}
        />
        <Menu.Item
          content="I'm hosting"
          active={predicate.has("isHost")}
          onClick={() => setPredicate({ predicate: "isHost", value: "true" })}
        />
      </Menu>
      <Header />
      <Calendar
        onChange={(date: any) =>
          setPredicate({ predicate: "startDate", value: date as Date })
        }
        value={predicate.get("startDate") || new Date()}
      />
    </>
  );
};

export default ActivityFilters;
