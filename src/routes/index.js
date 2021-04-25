import express from 'express';

import smsController from './sendsms';
import airtimeController from './buyairtime';

const router = express.Router();

router.use('/sms', smsController);
router.use('/airtime', airtimeController);

export default router;
