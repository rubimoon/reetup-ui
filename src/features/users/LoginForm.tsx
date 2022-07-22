import { ErrorMessage, Form, Formik } from "formik";
import { Button, Header, Label } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useAppDispatch } from "../../app/store/configureStore";
import { loginAsync } from "./userSlice";
import * as Yup from "yup";
import ModalWrapper from "../../app/common/modals/ModalWrapper";
import { closeModal } from "../../app/common/modals/modalSlice";
import { history } from "../..";

const LoginForm = () => {
  const dispatch = useAppDispatch();

  return (
    <ModalWrapper>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={Yup.object({
          email: Yup.string().required().email(),
          password: Yup.string().required(),
        })}
        onSubmit={async (values, { setErrors }) => {
          dispatch(loginAsync(values)).catch((error) => {
            setErrors(error);
          });
          dispatch(closeModal());
          history.push("/activities");
        }}
      >
        {({ handleSubmit, isSubmitting, errors }) => (
          <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
            <Header
              as="h2"
              content="Login to Reetup"
              color="teal"
              textAlign="center"
            />
            <MyTextInput name="email" placeholder="Email" />
            <MyTextInput
              name="password"
              placeholder="Password"
              type="password"
            />
            <ErrorMessage
              name="error"
              render={() => (
                <Label
                  style={{ marginBottom: 10 }}
                  basic
                  color="red"
                  content={errors}
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
    </ModalWrapper>
  );
};

export default LoginForm;
