import { ErrorMessage, Form, Formik } from "formik";
import { Button, Header, Label } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useAppDispatch } from "../../app/store/configureStore";
import { loginAsync } from "./userSlice";
import * as Yup from "yup";
import ModalWrapper from "../../app/common/modals/ModalWrapper";

const LoginForm = () => {
  const dispatch = useAppDispatch();

  return (
    <ModalWrapper>
      <Formik
        initialValues={{ email: "", password: "", error: null }}
        validationSchema={Yup.object({
          email: Yup.string().required().email(),
          password: Yup.string().required(),
        })}
        onSubmit={async (values, { setErrors }) => {
          dispatch(loginAsync(values))
            .unwrap()
            .catch((error) => {
              setErrors({ error: error.error });
            });
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
    </ModalWrapper>
  );
};

export default LoginForm;
