import { createSlice } from "@reduxjs/toolkit";

interface Modal {
  open: boolean;
  body: JSX.Element | null;
}

interface ModalState {
  modal: Modal;
}

const initialState: ModalState = {
  modal: {
    open: false,
    body: null,
  },
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.modal.open = true;
      state.modal.body = action.payload;
    },
    closeModal: (state) => {
      state.modal.open = false;
      state.modal.body = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
