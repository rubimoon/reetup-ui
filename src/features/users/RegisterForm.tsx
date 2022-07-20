import { ErrorMessage, Form, Formik } from "formik";
import { Button, Header } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { registerAsync } from "./userSlice";
import { history } from "../../";
import ModalWrapper from "../../app/common/modals/ModalWrapper";
import ValidationErrors from "../../app/errors/ui/ValidationErrors";
import { closeModal } from "../../app/common/modals/modalSlice";

const RegisterForm = () => {
  const dispatch = useAppDispatch();
  const registeredEmail = useAppSelector((state) => state.user.user?.email);
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
        onSubmit={(values, { setErrors }) => {
          dispatch(registerAsync({ creds: values })).catch((error) =>
            setErrors(error)
          );
          dispatch(closeModal());
          history.push(`/account/registerSuccess?email=${registeredEmail}`);
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
              content="Sign up to Reactivites"
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
