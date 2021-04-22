import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { atlabs } from 'innovation-sandbox';

const app = express();

// Add critical middleware
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

// Handle requests to send SMS
app.post('/send-sms', async (req, res) => {
  const { to, message } = req.body;
  const phoneNumPattern = /^\+234[0-9]{10}$/;
  if (!to || !phoneNumPattern.test(to) || !message) {
    res.status(400).json({
      message: 'invalid request data'
    });
    return;
  }

  try {
    const response = await atlabs.SMS.SMSService({
      sandbox_key: process.env.SANDBOX_KEY,
      payload: {
        to,
        message,
        from: 'FSI'
      }
    });

    res.status(200).json({
      status: 'Sent',
      message: response.SMSMessageData.Message
    });
  } catch (e) {
    res.status(500).json({
      message: 'Unable to complete your request'
    });
    console.warn(e);
  }
});

// handle requests to buy/send airtime
app.post('/buy-airtime', async (req, res) => {
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

// Catch-all error handler
app.use((err, req, res, next) => {
  console.log(err.status, req.path, err.message);
  res.status(err.status || 500).json({
    message: err.message
  });
});

export default app;
