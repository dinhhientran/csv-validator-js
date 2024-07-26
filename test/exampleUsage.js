import CSVValidator from '../src/CSVValidator';

// Define column rules
const columnDefinitions = {
    'InvoiceNumber': { dataType: 'integer', required: true, errors: { required: "Invoice Number is required.", invalid: "Invoice Number must be an integer." } },
    'InvoiceAmount': { dataType: 'currency', format: 'USD', required: true, errors: { required: "Invoice Amount is required.", invalid: "Invoice Amount must be a valid currency amount." } },
    'InvoiceDate': { dataType: 'date', format: 'MM/DD/YYYY', required: true, errors: { required: "Invoice Date is required.", invalid: "Invoice Date must be a valid date (MM/DD/YYYY)." } },
    'DueDate': { dataType: 'date', format: 'MM/DD/YYYY', required: false, errors: { invalid: "Due Date must be a valid date (MM/DD/YYYY)." } },
    'CustomerEmail': { dataType: 'email', required: true, errors: { required: "Customer Email is required.", invalid: "Customer Email must be a valid email address." } },
    'CustomerWebsite': { dataType: 'url', required: false, errors: { invalid: "Customer Website must be a valid URL." } },
    'CustomerPhone': { dataType: 'phoneNumber', format: 'XXX-XXX-XXXX', required: false, errors: { invalid: "Customer Phone must be a valid phone number." } },
    'DiscountRate': { dataType: 'percentage', required: false, errors: { invalid: "Discount Rate must be a percentage." }, customValidator: value => /^\d+(\.\d{1,3})?\s?%$/.test(value) }
};

// Define global custom validators
const globalCustomValidators = {
    required: (value, header) => {
        return value !== undefined && value !== null && value !== '';
    },
    percentage: (value) => {
        const regex = /^\d+(\.\d{1,3})?\s?%$/;
        return regex.test(value);
    }
};

// Initialize the validator
const validator = new CSVValidator(columnDefinitions, true, globalCustomValidators);

// Example CSV data
const csvData = {
    meta: {
        fields: ['InvoiceNumber', 'InvoiceAmount', 'InvoiceDate', 'DueDate', 'CustomerEmail', 'CustomerWebsite', 'CustomerPhone', 'DiscountRate']
    },
    data: [
        { InvoiceNumber: '123', InvoiceAmount: '100.00', InvoiceDate: '12/31/2020', DueDate: '01/31/2021', CustomerEmail: 'test@example.com', CustomerWebsite: 'http://example.com', CustomerPhone: '123-456-7890', DiscountRate: '10%' },
        { InvoiceNumber: '', InvoiceAmount: 'invalid-amount', InvoiceDate: '31/12/2020', DueDate: '2021-01-31', CustomerEmail: 'invalid-email', CustomerWebsite: 'example.com', CustomerPhone: '1234567890', DiscountRate: '15.5%' }
    ],
    errors: []
};

// Validate the CSV data
validator.validateCSV(csvData, (isValid, result) => {
    if (isValid) {
        console.log('CSV file is valid.');
    } else {
        console.error('CSV file is invalid:', result);
    }
});
