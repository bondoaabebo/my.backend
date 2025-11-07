import express from 'express';
import Voucher from '../src/models/Voucher.js';

const router = express.Router();

// إضافة كود جديد
router.post('/', async (req, res) => {
  try {
    const { code, days } = req.body;
    const voucher = new Voucher({ code, days });
    await voucher.save();
    res.status(201).json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
