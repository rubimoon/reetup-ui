import { createSlice } from "@reduxjs/toolkit";

interface Modal {
  open: boolean;
  modalType: string | null;
}

interface ModalState {
  modal: Modal;
}

const initialState: ModalState = {
  modal: {
    open: false,
    modalType: null,
  },
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.modal.open = true;
      state.modal.modalType = action.payload;
    },
    closeModal: (state) => {
      state.modal.open = false;
      state.modal.modalType = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
