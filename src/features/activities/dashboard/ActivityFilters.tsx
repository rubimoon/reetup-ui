import Calendar from "react-calendar";
import { Header, Menu } from "semantic-ui-react";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import { setPredicate } from "../activitySlice";

const ActivityFilters = () => {
  const { predicate } = useAppSelector((state) => state.activities);
  const dispatch = useAppDispatch();
  return (
    <>
      <Menu vertical size="large" style={{ width: "100%", marginTop: 25 }}>
        <Header icon="filter" attached color="teal" content="Filters" />
        <Menu.Item
          content="All Activites"
          active={"all" in predicate}
          onClick={() =>
            dispatch(setPredicate({ predicate: "all", value: "true" }))
          }
        />
        <Menu.Item
          content="I'm going"
          active={"isGoing" in predicate}
          onClick={() =>
            dispatch(setPredicate({ predicate: "isGoing", value: "true" }))
          }
        />
        <Menu.Item
          content="I'm hosting"
          active={"isHost" in predicate}
          onClick={() =>
            dispatch(setPredicate({ predicate: "isHost", value: "true" }))
          }
        />
      </Menu>
      <Header />
      <Calendar
        onChange={(date: any) =>
          dispatch(
            setPredicate({ predicate: "startDate", value: date as Date })
          )
        }
        value={predicate["startDate"] || new Date()}
      />
    </>
  );
};

export default ActivityFilters;
