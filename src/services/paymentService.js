import api from './api';

export const paymentService = {
  /**
   * Creates a PayMongo Checkout Session on the backend.
   * Supports: gcash, paymaya, card
   * The backend uses PAYMONGO_SECRET_KEY — never expose it here.
   */
  async createCheckout(billIds) {
    const { data } = await api.post('/payments/checkout', { billIds });
    // data.checkoutUrl is the hosted PayMongo checkout URL
    return data.checkoutUrl;
  },

  async getPaymentHistory() {
    const { data } = await api.get('/payments/history');
    return data;
  },
};