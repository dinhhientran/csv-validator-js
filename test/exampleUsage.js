// Import the CSVValidator from the installed package
import CSVValidator from 'csv-validator-js';

// Define column definitions
const columnDefinitionsWithDuplicates = {
    'Invoice Number': { dataType: 'integer', validateDuplicates: true },
    'Invoice Amount': { dataType: 'decimal' },
    'Invoice Date': { dataType: 'date', format: 'MM/DD/YYYY' },
    'Due Date': { dataType: 'date', format: 'MM/DD/YYYY' },
    'Customer Email': { dataType: 'email' },
    'Customer Website': { dataType: 'url' },
    'Customer Phone': { dataType: 'phoneNumber' },
    'Discount Rate': { dataType: 'percentage' },
    'Tax Amount': { dataType: 'decimal', decimalPlaces: 2 },
    'Transaction Date': { dataType: 'datetime', format: 'MM/DD/YYYY HH:mm:ss' }
};

// Create an instance of the CSVValidator
const validatorWithDuplicates = new CSVValidator(columnDefinitionsWithDuplicates);

// Sample CSV content
const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,12/31/2020 14:30:00
123,200.00,01/15/2021,02/15/2021,customer@example.com,https://example.com,987-654-3210,20%,220.00,01/15/2021 15:00:00
`;

// Parse and validate the CSV content
validatorWithDuplicates.parseAndValidateCSV(csvContent, (isValid, result) => {
    if (isValid) {
        console.log('CSV file is valid.');
    } else {
        console.error('CSV file is invalid:', result);
    }
});
