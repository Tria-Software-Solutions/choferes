import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as PaymentService from "../../services/paymentService";
import { PaymentQuery } from "../../services/paymentService";
import { Payment } from "../../models/Payment";
import { RootState } from "../store";
import { getApiErrorMessage } from "../../utils/apiError";

// paymentSlice manages the biweekly payments (boletas) of the employees.
interface PaymentState {
  payments: Payment[];
  isLoadingPayments: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  isLoadingPayments: false,
  error: null,
};

export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async (params: PaymentQuery = {}, { rejectWithValue }) => {
    try {
      const response = await PaymentService.getPayments(params);
      return response.data;
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to fetch payments");
      return rejectWithValue(message);
    }
  },
);

export const createPayment = createAsyncThunk(
  "payments/createPayment",
  async (
    input: Parameters<typeof PaymentService.createPayment>[0],
    { rejectWithValue },
  ) => {
    try {
      return await PaymentService.createPayment(input);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to create payment");
      return rejectWithValue(message);
    }
  },
);

export const updatePayment = createAsyncThunk(
  "payments/updatePayment",
  async (
    { id, input }: { id: number; input: Parameters<typeof PaymentService.updatePayment>[1] },
    { rejectWithValue },
  ) => {
    try {
      return await PaymentService.updatePayment(id, input);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to update payment");
      return rejectWithValue(message);
    }
  },
);

export const recalculatePayment = createAsyncThunk(
  "payments/recalculatePayment",
  async (id: number, { rejectWithValue }) => {
    try {
      return await PaymentService.recalculatePayment(id);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to recalculate payment");
      return rejectWithValue(message);
    }
  },
);

export const sendPaymentEmail = createAsyncThunk(
  "payments/sendPaymentEmail",
  async (
    { id, pdfBase64, pdfFileName }: { id: number; pdfBase64?: string; pdfFileName?: string },
    { rejectWithValue },
  ) => {
    try {
      return await PaymentService.sendPaymentEmail(id, { pdfBase64, pdfFileName });
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to send payment email");
      return rejectWithValue(message);
    }
  },
);

export const deletePayment = createAsyncThunk(
  "payments/deletePayment",
  async (id: number, { rejectWithValue }) => {
    try {
      return await PaymentService.deletePayment(id);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to delete payment");
      return rejectWithValue(message);
    }
  },
);

const upsertPayment = (state: PaymentState, payment: Payment) => {
  const index = state.payments.findIndex((item) => item.id === payment.id);
  if (index >= 0) {
    state.payments[index] = payment;
  } else {
    state.payments = [payment, ...state.payments];
  }
};

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.isLoadingPayments = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.payments = action.payload;
        state.isLoadingPayments = false;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoadingPayments = false;
        state.error = (action.payload as string | null) || "Failed to fetch payments";
      })
      .addCase(createPayment.fulfilled, (state, action: PayloadAction<Payment>) => {
        upsertPayment(state, action.payload);
      })
      .addCase(updatePayment.fulfilled, (state, action: PayloadAction<Payment>) => {
        upsertPayment(state, action.payload);
      })
      .addCase(recalculatePayment.fulfilled, (state, action: PayloadAction<Payment>) => {
        upsertPayment(state, action.payload);
      })
      .addCase(sendPaymentEmail.fulfilled, (state, action: PayloadAction<Payment>) => {
        upsertPayment(state, action.payload);
      })
      .addCase(deletePayment.fulfilled, (state, action: PayloadAction<number>) => {
        state.payments = state.payments.filter((payment) => payment.id !== action.payload);
      });
  },
});

export const selectPayments = (state: RootState) => state.payments.payments;
export const selectIsLoadingPayments = (state: RootState) =>
  state.payments.isLoadingPayments;
export const selectPaymentsError = (state: RootState) => state.payments.error;

export default paymentSlice.reducer;
