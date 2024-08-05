const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Replace with your Tabby API credentials and Ecwid API key
const merchantID = 'your-merchant-id';
const secretKey = 'sk_test_7fbfe24d-7072-4f22-9693-ca874aa21cde';
const ecwidStoreId = 'your-store-id';
const ecwidApiKey = 'your-ecwid-api-key';

// API endpoint to create a Tabby payment
app.post('/api/tabby/create-payment', async (req, res) => {
    try {
        const { amount, currency, order_reference_id, description, buyer, success_url, failure_url } = req.body;

        // Make a request to Tabby's API to create a payment session
        const response = await axios.post('https://api.tabby.ai/v1/checkout', {
            amount: {
                amount: amount,
                currency: currency
            },
            description: description,
            order: {
                reference_id: order_reference_id
            },
            buyer: {
                name: buyer.name,
                email: buyer.email,
                phone: buyer.phone
            },
            merchant_code: merchantID,
            merchant_urls: {
                success: success_url,
                failure: failure_url,
                callback: 'http://localhost:5000/api/tabby/callback'  // Your callback endpoint
            }
        }, {
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Send the Tabby payment URL back to the front-end
        if (response.data && response.data.payment_url) {
            res.json({ payment_url: response.data.payment_url });
        } else {
            res.status(500).json({ error: 'Failed to create payment' });
        }
    } catch (error) {
        console.error('Error creating Tabby payment:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Callback endpoint to handle payment status
app.post('/api/tabby/callback', async (req, res) => {
    try {
        const paymentData = req.body;

        // Log the payment data for debugging
        console.log('Payment callback received:', paymentData);

        if (paymentData.status === 'AUTHORIZED') {
            // Update order status in Ecwid
            const orderReferenceId = paymentData.order.reference_id; // Assuming this matches the Ecwid order ID

            const ecwidOrderUpdate = {
                paymentStatus: 'PAID',
                fulfillmentStatus: 'PROCESSING' // You can choose the appropriate status here
            };

            const ecwidResponse = await axios.put(
                `https://app.ecwid.com/api/v3/${ecwidStoreId}/orders/${orderReferenceId}?token=${ecwidApiKey}`,
                ecwidOrderUpdate
            );

            console.log('Ecwid order update response:', ecwidResponse.data);
        }

        // Send an acknowledgment to Tabby
        res.status(200).send('Callback received');
    } catch (error) {
        console.error('Error handling callback:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
