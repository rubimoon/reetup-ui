import { Modal } from "semantic-ui-react";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { closeModal } from "../../store/modalSlice";

const ModalContainer = () => {
  const modal = useAppSelector((state) => state.modal.modal);
  const dispatch = useAppDispatch();
  const handleCloseModel = () => dispatch(closeModal());

  return (
    <Modal open={modal.open} onClose={handleCloseModel} size="mini">
      <Modal.Content>{modal.body}</Modal.Content>
    </Modal>
  );
};

export default ModalContainer;
