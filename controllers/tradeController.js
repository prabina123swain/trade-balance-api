const multer = require('multer');
const fs = require('fs');
const csvParser = require('csv-parser');
const Trade = require('../models/TradeModel');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });


// CSV upload endpoint
const uploadCsv = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const results = [];
    const errors = []; // Array to hold any errors encountered
    const duplicateEntries = []; // Array to store duplicate entries
    const newEntries = []; // Array to store new entries
    const newEntriesId = []; // Array to store new entries to be inserted

    console.log("\n\t#####  API request arrived upload csv ####### \t");

    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (row) => {
            // Validation checks
            if (!row['User_ID'] || !row['UTC_Time'] || !row['Operation'] || !row['Market'] ||
                !row['Buy/Sell Amount'] || !row['Price']) {
                errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
                return; // Skip this row
            }

            // Split market into base and quote coins
            const marketParts = row['Market'].split('/');
            if (marketParts.length !== 2) {
                errors.push(`Invalid market format in row: ${JSON.stringify(row)}`);
                return; // Skip this row
            }

            const [baseCoin, quoteCoin] = marketParts;

            const trade = {
                user_id: row['User_ID'],
                utc_time: new Date(row['UTC_Time']),
                operation: row['Operation'].toLowerCase(),
                base_coin: baseCoin,
                quote_coin: quoteCoin,
                amount: parseFloat(row['Buy/Sell Amount']),
                price: parseFloat(row['Price'])
            };

            results.push(trade);
        })
        .on('end', async () => {
            if (errors.length > 0) {
                console.error('Errors encountered during processing:', errors);
                return res.status(400).json({
                    success: false,
                    message: 'CSV file processed with errors. Please review the errors and re-upload.',
                    errors: errors
                });
            }

            try {
                // Check for duplicates in the database
                for (const trade of results) {
                    const existingTrade = await Trade.findOne({
                        user_id: trade.user_id,
                        utc_time: trade.utc_time,
                        operation: trade.operation,
                        base_coin: trade.base_coin,
                        quote_coin: trade.quote_coin
                    });

                    if (existingTrade) {
                        duplicateEntries.push(`Duplicate entry found for user_id: ${trade.user_id} at time: ${trade.utc_time}`);
                    } else {
                        newEntries.push(trade);
                        newEntriesId.push(`New Entry added for user_id: ${trade.user_id} at time: ${trade.utc_time}`);
                    }
                }

                // Insert new entries into the database if any exist
                if (newEntries.length > 0) {
                    await Trade.insertMany(newEntries);
                }

                // Prepare response object with both new and duplicate entries
                return res.status(200).json({
                    success: true,
                    message: 'CSV file processed successfully. New and duplicate entries are provided below.',
                    new_entries: newEntriesId, // Newly inserted entries
                    duplicate_entries: duplicateEntries // Duplicate entries found in the database
                });

            } catch (error) {
                console.error('Error saving data:', error.message);
                return res.status(500).json({
                    success: false,
                    message: 'Error saving data to the database',
                    error: error.message
                });
            } finally {
                // Delete the uploaded file after processing
                fs.unlink(req.file.path, (err) => {
                    if (err) console.log('Error deleting uploaded file:', err.message);
                });
            }
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Error reading CSV file',
                error: error.message
            });
        });
};


const getBalance = async (req, res) => {

    const { timestamp } = req.body;

    console.log(`\n\t#####  API request arrived for fetching balance on time stamp ${timestamp} ####### \t`);

    // Validate timestamp presence
    if (!timestamp) {
        return res.status(400).json({
            success: false,
            message: 'Timestamp is required.'
        });
    }

    // Validate timestamp format
    const parsedTimestamp = new Date(timestamp);
    if (isNaN(parsedTimestamp.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid timestamp format. Please provide a valid date string.'
        });
    }

    try {
        // Fetch trades before the given timestamp
        const trades = await Trade.find({
            utc_time: { $lt: parsedTimestamp }
        });

        const balances = {};

        // Calculate balances based on the trades
        trades.forEach(trade => {
            const asset = trade.base_coin;
            const amount = trade.amount;

            // Initialize balance if asset is not already present
            if (!balances[asset]) {
                balances[asset] = 0;
            }

            // Adjust balance based on the operation type
            if (trade.operation === 'buy') {
                balances[asset] += amount;
            } else if (trade.operation === 'sell') {
                balances[asset] -= amount;
            }
        });

        // Respond with the calculated balances
        return res.status(200).json({
            success: true,
            message: 'Asset balances fetched successfully.',
            data: balances
        })

    } catch (error) {
        console.error('Error fetching trades:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message // Optionally include error details for debugging
        });
    }
};


module.exports = {
    uploadCsv,
    getBalance,
    upload
};
