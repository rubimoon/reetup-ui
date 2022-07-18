import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Header, Segment } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { v4 as uuid } from "uuid";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { categoryOptions } from "../../../app/common/options/categoryOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";
import { ActivityFormValues } from "../../../app/models/activity";
import {
  clearSelectedActivity,
  createActivityAsync,
  loadActivityAsync,
  resetActivityRegistry,
  updateActivityAsync,
} from "../activitySlice";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../app/store/configureStore";
import { history } from "../../..";
import { mapActivityToActivityFormValues } from "../../../app/common/utils/mapper";

const ActivityForm = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const { loadingInitial, selectedActivity } = useAppSelector(
    (state) => state.activities
  );
  const { user } = useAppSelector((state) => state.user);
  const initialFormValues = selectedActivity
    ? mapActivityToActivityFormValues(selectedActivity)
    : {
        id: undefined,
        title: "",
        category: "",
        description: "",
        date: null,
        city: "",
        venue: "",
      };

  const validationSchema = Yup.object({
    title: Yup.string().required("The activity title is required"),
    description: Yup.string().required("The activity description is required"),
    category: Yup.string().required(),
    date: Yup.string().required("Date is required").nullable(),
    venue: Yup.string().required(),
    city: Yup.string().required(),
  });

  useEffect(() => {
    dispatch(clearSelectedActivity());
    if (!id) return;
    dispatch(loadActivityAsync({ currentUser: user!, id }));
  }, [dispatch, id, user]);

  function handleFormSubmit(formValues: ActivityFormValues) {
    if (!user) return;
    dispatch(resetActivityRegistry());
    if (!formValues.id) {
      let newActivity = {
        ...formValues,
        id: uuid(),
      };
      newActivity.date = new Date(newActivity.date!).toISOString();
      dispatch(
        createActivityAsync({ currentUser: user, activity: newActivity })
      ).then(() => {
        history.push(`/activities/${newActivity.id}`);
      });
    } else {
      dispatch(
        updateActivityAsync({ currentUser: user, activity: formValues })
      ).then(() => {
        history.push(`/activities/${formValues.id}`);
      });
    }
  }

  if (loadingInitial) return <LoadingComponent content="Loading activity..." />;

  return (
    <Segment clearing>
      <Header content="Activity Details" sub color="teal" />
      <Formik
        validationSchema={validationSchema}
        enableReinitialize
        initialValues={initialFormValues}
        onSubmit={(values) => handleFormSubmit(values)}
      >
        {({ handleSubmit, isValid, isSubmitting, dirty }) => (
          <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
            <MyTextInput name="title" placeholder="Title" />
            <MyTextArea rows={3} placeholder="Description" name="description" />
            <MySelectInput
              options={categoryOptions}
              placeholder="Category"
              name="category"
            />
            <MyDateInput
              placeholderText="Date"
              name="date"
              showTimeSelect
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
            <Header content="Location Details" sub color="teal" />
            <MyTextInput placeholder="City" name="city" />
            <MyTextInput placeholder="Venue" name="venue" />
            <Button
              disabled={isSubmitting || !dirty || !isValid}
              loading={isSubmitting}
              floated="right"
              positive
              type="submit"
              content="Submit"
            />
            <Button
              as={Link}
              to="/activities"
              floated="right"
              type="button"
              content="Cancel"
            />
          </Form>
        )}
      </Formik>
    </Segment>
  );
};

export default ActivityForm;
