
# API Documentation

## CSVValidator Class

### Constructor

```javascript
new CSVValidator(columnDefinitions, validateDuplicates = false, globalCustomValidators = {})
```

- `columnDefinitions`: An object defining the rules for each column. Each key is the column name, and the value is an object specifying the data type, format, required status, custom validators, and error messages.
- `validateDuplicates`: A boolean indicating whether to validate duplicates in the first column.
- `globalCustomValidators`: An object containing global custom validation functions.

### Methods

#### `validateCSV(data, callback)`

Validates the given CSV data.

- `data`: The CSV data to be validated.
- `callback(isValid, result)`: A callback function that is called with the validation result.

#### Example

```javascript
const columnDefinitions = {
    'InvoiceNumber': { dataType: 'integer', required: true, errors: { required: "Invoice Number is required.", invalid: "Invoice Number must be an integer." } }
};

const validator = new CSVValidator(columnDefinitions);
const csvData = { /* Your CSV data here */ };

validator.validateCSV(csvData, (isValid, result) => {
    if (isValid) {
        console.log('CSV file is valid.');
    } else {
        console.error('CSV file is invalid:', result);
    }
});
```

## Data Types

CSVValidatorJS supports the following data types:
- `integer`: Whole numbers.
- `decimal`: Floating-point numbers.
- `boolean`: True or false values.
- `date`: Date values with a specified format.
- `datetime`: Date and time values with a specified format.
- `string`: Textual data.
- `percentage`: Percentage values with a specified format.
- `email`: Email addresses.
- `url`: Web URLs.
- `phoneNumber`: Phone numbers with a specified format.
- `currency`: Monetary values with a specified currency format.
- `custom`: Any custom data type defined by the user, using a custom validation function.

### Example of Column Definitions

```javascript
const columnDefinitions = {
    'InvoiceNumber': { dataType: 'integer', required: true, errors: { required: "Invoice Number is required.", invalid: "Invoice Number must be an integer." } },
    'InvoiceAmount': { dataType: 'currency', format: 'USD', required: true, errors: { required: "Invoice Amount is required.", invalid: "Invoice Amount must be a valid currency amount." } },
    'InvoiceDate': { dataType: 'date', format: 'MM/DD/YYYY', required: true, errors: { required: "Invoice Date is required.", invalid: "Invoice Date must be a valid date (MM/DD/YYYY)." } },
    'DueDate': { dataType: 'date', format: 'MM/DD/YYYY', required: false, errors: { invalid: "Due Date must be a valid date (MM/DD/YYYY)." } },
    'CustomerEmail': { dataType: 'email', required: true, errors: { required: "Customer Email is required.", invalid: "Customer Email must be a valid email address." } },
    'CustomerWebsite': { dataType: 'url', required: false, errors: { invalid: "Customer Website must be a valid URL." } },
    'CustomerPhone': { dataType: 'phoneNumber', format: 'XXX-XXX-XXXX', required: false, errors: { invalid: "Customer Phone must be a valid phone number." } },
    'DiscountRate': { dataType: 'percentage', required: false, errors: { invalid: "Discount Rate must be a valid percentage." }, customValidator: value => /^\d+(\.\d{1,3})?\s?%$/.test(value) }
};
```

### Global Custom Validators

You can define global custom validators that can be applied across multiple columns.

```javascript
const globalCustomValidators = {
    required: (value, header) => {
        return value !== undefined && value !== null && value !== '';
    },
    percentage: (value) => {
        const regex = /^\d+(\.\d{1,3})?\s?%$/;
        return regex.test(value);
    }
};
```

### Example of Using Global Custom Validators

```javascript
const validator = new CSVValidator(columnDefinitions, true, globalCustomValidators);

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

validator.validateCSV(csvData, (isValid, result) => {
    if (isValid) {
        console.log('CSV file is valid.');
    } else {
        console.error('CSV file is invalid:', result);
    }
});
```

## Custom Validators for Specific Columns

You can define custom validators for specific columns.

```javascript
const columnDefinitions = {
    'DiscountRate': {
        dataType: 'percentage',
        customValidator: value => {
            // Custom validation logic
            return /^\d+(\.\d{1,3})?\s?%$/.test(value);
        },
        errors: {
            invalid: "Discount Rate must be a valid percentage."
        }
    }
};
```

### Example of Using Custom Validators for Specific Columns

```javascript
const validator = new CSVValidator(columnDefinitions);

const csvData = { /* Your CSV data here */ };

validator.validateCSV(csvData, (isValid, result) => {
    if (isValid) {
        console.log('CSV file is valid.');
    } else {
        console.error('CSV file is invalid:', result);
    }
});
```
