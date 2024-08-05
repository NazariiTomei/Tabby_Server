const axios = require('axios');

class TabbyService {
  constructor() {
    this.baseUrl = 'https://api.tabby.ai/api/v2/';
    this.pkTest = 'pk_test_8bf040dc-20c7-426c-ac41-578df6cae114'; // Replace with your actual public key
    this.skTest = 'sk_test_7fbfe24d-7072-4f22-9693-ca874aa21cde'; // Replace with your actual secret key
  }

  async createSession(data) {
    console.log("start createsession");
    const body = this.getConfig(data);
    console.log(body);
    try {
      const response = await axios.post(`${this.baseUrl}checkout`, body, {
        headers: {
          Authorization: `Bearer ${this.pkTest}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("response.data",response.data);
      return response.data;
    } catch (error) {
        console.log(error.message);
      throw new Error(`Error creating session: ${error.message}`);
    }
  }

  async getSession(paymentId) {
    try {
      const response = await axios.get(`${this.baseUrl}checkout/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${this.skTest}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching session: ${error.message}`);
    }
  }

  getConfig(data) {
    return {
      payment: {
        amount: data.amount,
        currency: data.currency,
        buyer: {
          phone: data.buyer_phone,
          email: data.buyer_email,
          name: data.full_name,
        },
        shipping_address: {
          city: data.city,
          address: data.address,
          zip: data.zip,
        },
        order: {
          tax_amount: '0.00',
          shipping_amount: '0.00',
          discount_amount: '0.00',
          updated_at: new Date().toISOString(),
          reference_id: data.order_id,
          items: data.items,
        },
        buyer_history: {
          loyalty_level: data.loyalty_level,
        },
      },
      lang: 'en',
      CallBackUrl: data.callback_url,
      ErrorUrl: data.callback_url,
    };
  }
}

module.exports = TabbyService;
