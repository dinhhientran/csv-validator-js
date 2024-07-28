
const CSVValidator = require('../src/index');

const columnDefinitions = {
    'InvoiceNumber': {
        dataType: 'integer',
        required: true,
        validateDuplicates: true,
        errors: {
            required: "Invoice Number is required."
        }
    },
    'InvoiceAmount': {
        dataType: 'currency',
        format: 'USD',
        required: true,
        errors: {
            required: "Invoice Amount is required."
        }
    },
    'InvoiceDate': {
        dataType: 'date',
        format: 'MM/DD/YYYY',
        required: true,
        errors: {
            required: "Invoice Date is required."
        }
    },
    'DueDate': {
        dataType: 'date',
        format: 'MM/DD/YYYY',
        required: false // Optional
    },
    'CustomerEmail': {
        dataType: 'email',
        required: true,
        errors: {
            required: "Customer Email is required."
        }
    },
    'CustomerWebsite': {
        dataType: 'url',
        required: false // Optional
    },
    'CustomerPhone': {
        dataType: 'phoneNumber',
        format: 'XXX-XXX-XXXX',
        required: false // Optional
    },
    'DiscountRate': {
        dataType: 'percentage',
        required: false, // Optional
        customValidator: function(value) {
            return /^\d+(\.\d{1,3})?\s?%$/.test(value);
        }
    },
    'TotalAmount': {
        dataType: 'number',
        required: true,
        errors: {
            required: "Total Amount is required.",
            invalid: "Total Amount must be a valid number."
        }
    },
    'TaxAmount': {
        dataType: 'decimal',
        required: true,
        decimalPlaces: 2,
        errors: {
            required: "Tax Amount is required.",
            invalid: "Tax Amount must be a valid decimal number with up to 2 decimal places."
        }
    },
    'TransactionDate': {
        dataType: 'datetime',
        format: 'MM/DD/YYYY HH:mm:ss',
        required: true,
        errors: {
            required: "Transaction Date is required.",
            invalid: "Transaction Date must be a valid datetime."
        }
    }
};

const globalCustomValidators = {
    required: function(value, header) {
        return value !== undefined && value !== null && value !== '';
    },
    percentage: function(value) {
        const regex = /^\d+(\.\d{1,3})?\s?%$/;
        return regex.test(value);
    }
};

const defaultInvalidMessages = {
    integer: 'Invalid integer value',
    decimal: 'Invalid decimal value',
    boolean: 'Invalid boolean value',
    date: 'Invalid date value',
    datetime: 'Invalid datetime value',
    string: 'Invalid string value',
    percentage: 'Invalid percentage value',
    email: 'Invalid email address',
    url: 'Invalid URL',
    phoneNumber: 'Invalid phone number',
    currency: 'Invalid currency value',
    number: 'Invalid number value'
};

const messages = {
    vi: {
        required: 'Cần nhập giá trị ở hàng {row}, cột {column} ({header}).',
        duplicate: 'Giá trị "{value}" bị lặp lại ở các hàng: {rows} cho cột: {column}.',
        emptyRow: 'Hàng {row} bị trống.',
        headerLength: 'Số lượng cột không đúng. Cần phải có {expected} cột, nhưng thấy {actual}.',
        valid: 'Tệp CSV hợp lệ.',
        ...defaultInvalidMessages
    }
};

const validator = new CSVValidator(columnDefinitions, globalCustomValidators, defaultInvalidMessages, 'vi', messages);

const csvContent = `
InvoiceNumber,InvoiceAmount,InvoiceDate,DueDate,CustomerEmail,CustomerWebsite,CustomerPhone,DiscountRate,TotalAmount,TaxAmount,TransactionDate
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,10.00,12/31/2020 14:30:00
,invalid-amount,31/12/2020,2021-01-31,invalid-email,example.com,1234567890,15.5%,125.50,invalid,invalid
`;

validator.parseAndValidateCSV(csvContent, (isValid, result) => {
    if (isValid) {
        console.log('CSV file is valid.');
    } else {
        console.error('CSV file is invalid:', result);
    }
});
