Asset Management API: This project provides an API for managing and tracking asset balances based on trade transactions stored in a database.

Task1 - It allows users to upload trade data to database through a CSV file.

Task1 Live api -  https://trade-balance-api.onrender.com/api/upload-csv


Task2 - it retrieve their asset balances at any given timestamp

Task2 Live api -  https://trade-balance-api.onrender.com/api/get-balance


Folder structure

├── controllers        

│   ├── balanceController.js  
│   └── tradeController.js    

├── models             
│   └── TradeModel.js         

├── routes             

│   ├── balanceRoute.js       
│   └── tradeRoute.js       

├── uploads            

├── .env               

├── index.js           

└── README.md          


Project Structure
The project is structured to keep business logic separate from routes, making it easier to maintain and scale. Here's an overview of the folder structure:


API Endpoints

1. Upload CSV File
   
        Endpoint: /upload-csv
        Method: POST
        Description: Uploads a CSV file containing trade transactions and stores the data in MongoDB. Duplicate entries are filtered, and only new entries are inserted into the database. Duplicate entries are returned separately in the response.
        
        Request:
        
        Header: Content-Type: multipart/form-data
        Body: A CSV file uploaded with the field name file.
        CSV File Format:
        
        The CSV file should have the following columns:
                        User_ID	Unique identifier for the user making the trade
                        UTC_Time	Timestamp of the trade in UTC format
                        Operation	buy or sell
                        Market	Asset market, e.g., BTC/USD
                        Buy/Sell Amount	Amount of the asset bought or sold
                        Price	Price of the asset at the time of the trade
        
        Response :{
          "success": true,
          "message": "CSV file processed successfully. Below are the details of the new and duplicate entries.",
          "new_entries": [ ... ],        // Array of newly inserted records
          "duplicate_entries": [ ... ]   // Array of duplicate records found in the database
        }
        

2. Get Asset Balance
   
    Endpoint: /get-balance
    Method: POST
    Description: Returns the asset-wise balance for a user at the given timestamp, based on all trades recorded before the timestamp.
    
    Request:
    
    Header: Content-Type: application/json
    Body: JSON with the timestamp field.
   
    {
   
      "timestamp": "YYYY-MM-DD HH:MM:SS"
   
    }
   
    timestamp is a string representing the cutoff time for calculating balances. Trades after this timestamp are not considered.
    Response:
    
    Returns a JSON object with each asset and its respective balance.
   
    {
   
      "BTC": 15,
      "MATIC": 100
   
    }



Working of API Endpoints

 1-Upload CSV File Workflow
 
        File Upload: Users upload a CSV file containing trade data.
        
        Data Parsing: The server parses the CSV file row-by-row.
        
        Validation: Checks if all required fields are present.
        Validates the format of the Market field.
        
        Duplicate Detection: For each row, the server checks if a record with the same User_ID, UTC_Time, and Market already exists in the database.
        
        Database Insertion: New entries are inserted into the Trades collection.
        
        Duplicate entries are not inserted and are instead collected in the duplicate_entries array.
        
        Response: The response contains two arrays: new_entries and duplicate_entries.
        
2-Get Asset Balance Workflow

        Request Handling: The API receives a request with a timestamp.
        
        Query Database: All trades that occurred before the given timestamp are fetched.
        
        Balance Calculation: For each trade, the balance of the respective asset is updated based on the operation (buy or sell).
         If buy, the amount is added to the balance.
         If sell, the amount is subtracted.
         
        Response: The final balance for each asset is returned as a JSON object.
        
3-Error Handling
        
        The API provides structured and informative error responses for various scenarios:
        
        400 Bad Request: Missing required fields or invalid data format.
        500 Internal Server Error: Issues related to file processing or database operations.
