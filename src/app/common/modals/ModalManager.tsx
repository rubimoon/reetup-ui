import { FC } from "react";
import LoginForm from "../../../features/users/LoginForm";
import RegisterForm from "../../../features/users/RegisterForm";
import { useAppSelector } from "../../store/configureStore";

export default function ModalManager() {
  const currentModal = useAppSelector((state) => state.modal.modal);
  let renderedModal;
  if (currentModal) {
    const { modalType } = currentModal;

    if (modalType) {
      let ModalComponent: FC;
      switch (modalType) {
        case "LoginForm":
          ModalComponent = LoginForm;
          renderedModal = <ModalComponent />;
          break;
        case "RegisterForm":
          ModalComponent = RegisterForm;
          renderedModal = <ModalComponent />;
          break;
      }
    }
  }

  return <span>{renderedModal}</span>;
}
