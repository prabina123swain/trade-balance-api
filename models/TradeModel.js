const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    user_id: 
    { 
        type: String, 
        required: true
     },            // User ID
    utc_time:
     { 
        type: Date, 
        required: true
     },             // Time of the trade
    operation: 
    { 
        type: String, 
        enum: ['buy', 'sell'], 
        required: true
     }, // Buy or sell
    base_coin:
     { 
        type: String,
         required: true
     },          // Extracted from Market
    quote_coin:
     { 
        type: String,
         required: true 
    },         // Extracted from Market
    amount: 
    { 
        type: Number, 
        required: true
     },             // Buy/Sell amount
    price: 
    { 
        type: Number,
         required: true
    },              // Price of base coin in terms of quote coin
});

const TradeModel = mongoose.model('TradeModel', tradeSchema);
module.exports = TradeModel;
