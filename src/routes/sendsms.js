import express from 'express';
import { atlabs } from 'innovation-sandbox';

const router = express.Router();

// Handle requests to send SMS
router.post('/send-sms', async (req, res) => {
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

export default router;
