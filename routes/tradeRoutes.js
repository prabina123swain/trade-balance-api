const express = require('express');
const { uploadCsv, getBalance, upload } = require('../controllers/tradeController');

const router = express.Router();

// Route for uploading CSV
router.post('/upload-csv', upload.single('file'), uploadCsv);

// Route for getting asset balances
router.post('/get-balance', getBalance);

module.exports = router;
