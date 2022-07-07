import { ErrorMessage, Form, Formik } from "formik";
import { Button, Header, Label } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useAppDispatch } from "../../app/store/configureStore";
import { loginAsync } from "./userSlice";

const LoginForm = () => {
  const dispatch = useAppDispatch();
  return (
    <Formik
      initialValues={{ email: "", password: "", error: null }}
      onSubmit={(values, { setErrors }) => {
        dispatch(loginAsync({ creds: values, setErrors }));
      }}
    >
      {({ handleSubmit, isSubmitting, errors }) => (
        <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
          <Header
            as="h2"
            content="Login to Reactivites"
            color="teal"
            textAlign="center"
          />
          <MyTextInput name="email" placeholder="Email" />
          <MyTextInput name="password" placeholder="Password" type="password" />
          <ErrorMessage
            name="error"
            render={() => (
              <Label
                style={{ marginBottom: 10 }}
                basic
                color="red"
                content={errors.error}
              />
            )}
          />
          <Button
            loading={isSubmitting}
            positive
            content="Login"
            type="submit"
            fluid
          />
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
