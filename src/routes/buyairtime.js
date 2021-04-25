import express from 'express';
import { atlabs } from 'innovation-sandbox';

const router = express.Router();

// handle requests to buy/send airtime
router.post('/buy-airtime', async (req, res) => {
  const { amount, phoneNumber } = req.body;
  const moneyPattern = /\d{2,4}$/;
  const phoneNumPattern = /^\+234[0-9]{10}$/;
  if (!amount || !moneyPattern.test(amount) || !phoneNumber || !phoneNumPattern.test(phoneNumber)) {
    res.status(400).json({
      message: 'invalid request data'
    });
    return;
  }

  try {
    const { errorMessage, responses } = await atlabs.Airtime.SendAirtime({
      sandbox_key: process.env.SANDBOX_KEY,
      payload: {
        recipients: [{ phoneNumber, amount, currencyCode: 'NGN' }]
      }
    });

    if (errorMessage !== 'None') {
      res.status(500).json({
        message: 'Unable to complete your request'
      });
      return;
    }

    res.status(200).json({
      status: responses[0].status,
      message: `RequestId: ${responses[0].requestId}, Discount: ${responses[0].discount}`
    });
  } catch (e) {
    res.status(500).json({
      message: 'Unable to complete your request'
    });
    console.warn(e);
  }
});

export default router;
