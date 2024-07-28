
# CSVValidatorJS API Documentation

## CSVValidator Class

### Constructor

Creates an instance of the CSVValidator class.

#### Parameters

- `columnDefinitions` (object): An object defining the columns and their validation rules.
- `globalCustomValidators` (object, optional): An object containing global custom validators.
- `defaultInvalidMessages` (object, optional): An object containing default invalid messages.
- `language` (string, optional): The language for error messages. Default is 'en'.
- `messages` (object, optional): An object containing messages for different languages.

### Methods

#### parseAndValidateCSV

Parses and validates CSV content.

##### Parameters

- `csvContent` (string|File): The CSV content as a string or a File object.
- `callback` (function): A callback function to handle the validation result. The function signature should be `function(isValid, result)`.
- `isFile` (boolean, optional): A flag indicating if the CSV content is a File object. Default is false.

##### Usage

```javascript
validator.parseAndValidateCSV(csvContent, function(isValid, result) {
    if (isValid) {
        console.log('CSV file is valid.');
    } else {
        console.error('CSV file is invalid:', result);
    }
}, true);
```

### Column Definitions

Column definitions are used to specify validation rules for each column in the CSV file. Each column definition is an object with the following properties:

- `dataType` (string): The data type of the column. Supported types are:
    - `integer`
    - `decimal`
    - `boolean`
    - `date`
    - `datetime`
    - `string`
    - `percentage`
    - `email`
    - `url`
    - `phoneNumber`
    - `currency`
    - `number`
- `required` (boolean, optional): Indicates if the column is required. Default is false.
- `format` (string, optional): The format for date, datetime, phoneNumber, and currency data types.
- `validateDuplicates` (boolean, optional): Indicates if duplicate values should be validated. Default is false.
- `errors` (object, optional): Custom error messages for the column. The object can have the following properties:
    - `required` (string): Custom error message for required validation.
    - `invalid` (string): Custom error message for invalid data type.
- `customValidator` (function, optional): A custom validator function for the column. The function signature should be `function(value)`.

### Global Custom Validators

Global custom validators are functions that can be used to validate specific data types. Each validator function should have the following signature: `function(value, dateFormat)`.

### Default Invalid Messages

Default invalid messages are used when a specific error message is not provided in the column definitions. The following default invalid messages are supported:

- `integer`
- `decimal`
- `boolean`
- `date`
- `datetime`
- `string`
- `percentage`
- `email`
- `url`
- `phoneNumber`
- `currency`
- `number`

### Messages

Messages are used to customize error messages for different languages. The messages object should have the following structure:

```javascript
const messages = {
    en: {
        required: 'Missing required value at row {row}, column {column} ({header}).',
        duplicate: 'Duplicate value "{value}" found in rows: {rows} for column: {column}.',
        emptyRow: 'Row {row} is empty.',
        headerLength: 'Header length mismatch. Expected {expected} headers but got {actual}.',
        valid: 'CSV file is valid.',
        ...defaultInvalidMessages
    },
    vi: {
        required: 'Cần nhập giá trị ở hàng {row}, cột {column} ({header}).',
        duplicate: 'Giá trị "{value}" bị lặp lại ở các hàng: {rows} cho cột: {column}.',
        emptyRow: 'Hàng {row} bị trống.',
        headerLength: 'Số lượng cột không đúng. Cần phải có {expected} cột, nhưng thấy {actual}.',
        valid: 'Tệp CSV hợp lệ.',
        ...defaultInvalidMessages
    },
    // Add more languages as needed
};
```

### Example

```javascript
import CSVValidator from 'csvvalidatorjs';

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
```
