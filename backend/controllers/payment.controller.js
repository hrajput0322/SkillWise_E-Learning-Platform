const razorpay = require("razorpay");
const crypto = require("crypto");

const paymentVerification = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  const body_data = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
    .update(body_data)
    .digest('hex');

  const isValid = expectedSignature === razorpay_signature;

  if (isValid) {
    return res.json({ success: true, message: 'Payment successful' });
  } else {
    return res.json({ success: false, message: 'Payment failed' });
  }
};

const checkout = async (req, res) => {
  const { name, amount } = req.body;
  
  try {
    const order = await razorpay.orders.create({
      amount: Number(amount * 100),
      currency: 'INR',
      receipt: name
    });

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create order' });
  }
};

module.exports = { paymentVerification, checkout };
