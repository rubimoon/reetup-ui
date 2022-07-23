import { ErrorMessage, Form, Formik } from "formik";
import { Button, Header } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import * as Yup from "yup";
import { useAppDispatch } from "../../app/store/configureStore";
import { registerAsync } from "./userSlice";

import ModalWrapper from "../../app/common/modals/ModalWrapper";
import ValidationErrors from "../../app/errors/ui/ValidationErrors";

const RegisterForm = () => {
  const dispatch = useAppDispatch();

  return (
    <ModalWrapper>
      <Formik
        initialValues={{
          displayName: "",
          username: "",
          email: "",
          password: "",
          error: null,
        }}
        onSubmit={async (values, { setErrors }) => {
          dispatch(registerAsync(values))
            .unwrap()
            .catch((error) => {
              setErrors({ error: error.error });
            });
        }}
        validationSchema={Yup.object({
          displayName: Yup.string().required(),
          username: Yup.string().required(),
          email: Yup.string().required().email(),
          password: Yup.string().required(),
        })}
      >
        {({ handleSubmit, isSubmitting, errors, isValid, dirty }) => (
          <Form
            className="ui form error"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <Header
              as="h2"
              content="Sign up to Reetup"
              color="teal"
              textAlign="center"
            />
            <MyTextInput name="displayName" placeholder="Display Name" />
            <MyTextInput name="username" placeholder="Username" />
            <MyTextInput name="email" placeholder="Email" />
            <MyTextInput
              name="password"
              placeholder="Password"
              type="password"
            />
            <ErrorMessage
              name="error"
              render={() => <ValidationErrors errors={errors.error} />}
            />
            <Button
              disabled={!isValid || !dirty || isSubmitting}
              loading={isSubmitting}
              positive
              content="Register"
              type="submit"
              fluid
            />
          </Form>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default RegisterForm;
