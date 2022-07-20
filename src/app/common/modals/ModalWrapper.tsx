import { FC } from "react";
import { Modal } from "semantic-ui-react";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { closeModal } from "./modalSlice";

const ModalWrapper: FC = ({ children }) => {
  const modal = useAppSelector((state) => state.modal.modal);
  const dispatch = useAppDispatch();
  const handleCloseModel = () => dispatch(closeModal());

  return (
    <Modal open={modal.open} onClose={handleCloseModel} size="mini">
      <Modal.Content>{children}</Modal.Content>
    </Modal>
  );
};

export default ModalWrapper;
