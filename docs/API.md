# CSV Validator JS

A robust JavaScript library for validating CSV files with custom rules and error messages.

## Features

- Validate CSV files with custom rules for each column.
- Support for multiple data types: integer, decimal, boolean, date, datetime, string, percentage, email, URL, phone number, currency, and number.
- Customizable error messages for each column and validation rule.
- Multi-language support (English, Vietnamese, Chinese, Spanish, French).
- Option to skip empty lines.
- Option to validate header names.
- Custom empty value check function.
- Configurable starting row index for error messages.

## Installation

```bash
npm install csv-validator-js
```

### Basic Usage

Define the rules for each column in the CSV file. In this basic example, no optional options are used.

```javascript
import CSVValidator from 'csv-validator-js';

const columnDefinitions = {
    'Invoice Number': { dataType: 'integer', required: true },
    'Invoice Amount': { dataType: 'decimal', required: true },
    'Invoice Date': { dataType: 'date' },
    'Due Date': { dataType: 'date' }
};

const validator = new CSVValidator({
    columnDefinitions
});

const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date
123,100.00,12/31/2020,01/31/2021
124,200.00,01/15/2021,02/15/2021
`;

validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
    if (isValid) {
        console.log('CSV file is valid.');
    } else {
        console.error('CSV file is invalid:', result);
    }
});
```

### Result Returned

The result returned by the `CSVValidator` after validation is an object. The keys are row indices (starting from 0 for the header row) and the values are arrays of error messages for each row. This structure allows you to easily identify which rows have validation errors and what those errors are.

#### Example Result

```json
{
  "0": ["Invalid header name Invalid Invoice Number at column 1."],
  "2": [
    "Invoice Number is required.",
    "Invalid currency value",
    "Invalid date value",
    "Invalid date value",
    "Invalid email address",
    "Invalid decimal value",
    "Invalid datetime value"
  ],
  "3": [
    "Invoice Number must be an integer.",
    "Invalid percentage value",
    "Invalid decimal value"
  ]
}
```

### Error Messages

Each error message is descriptive and points to the specific issue in the CSV file. The possible error messages include:

- `Missing required value at row {row}, column {column} ({header}).`
- `Duplicate value "{value}" found in rows: {rows} for column: {column}.`
- `Row {row} is empty.`
- `Header length mismatch. Expected {expected} headers but got {actual}.`
- `CSV file is valid.`
- `Invalid header name {header} at column {column}.`
- `Invalid {dataType} value at row {row}, column {column} ({header}).`

#### Custom Error Messages

You can also define custom error messages for each column in the `columnDefinitions`. The custom error messages will include the header name and provide a clear description of the validation error.


### Data Types

Defines the types of data each column in the CSV file can hold.

## Data Types

### number
General numeric values. Optionally allow thousand separators.
- Valid examples: `123`, `1,234.56`, `-1234`

### integer
Whole numbers without decimal points.
- Valid examples: `123`, `-1234`

### decimal
Numbers with decimal points. Optionally specify the number of decimal places and allow thousand separators.
- Valid examples: `123.45`, `1,234.56`, `-1234.56`

### boolean
True or false values.
- Valid examples: `true`, `false`, `TRUE`, `FALSE`

### date
Date values. Optionally specify the date format.
- Valid examples: `12/31/2020`, `31-12-2020`, `2020-12-31`

### datetime
Date and time values. Optionally specify the date-time format.
- Valid examples: `12/31/2020 14:30:00`, `31-12-2020 14:30:00`, `2020-12-31T14:30:00`

### string
Text values.
- Valid examples: `Hello`, `123`, `abc123`

### percentage
Percentage values.
- Valid examples: `10%`, `100%`, `50.5%`

### email
Email addresses.
- Valid examples: `test@example.com`, `user.name+tag+sorting@example.com`

### url
URL addresses.
- Valid examples: `http://example.com`, `https://www.example.com`

### phoneNumber
Phone numbers. Optionally specify the format.
- Valid examples: `123-456-7890`, `(123) 456-7890`, `+1-123-456-7890`

### currency
Currency values.
- Valid examples: `$123.45`, `£123.45`, `€123.45`


Example of defining columns with different data types:

```javascript
const columnDefinitions = {
    'IntegerColumn': {
        dataType: 'integer',
    },
    'DecimalColumn': {
        dataType: 'decimal',
        decimalPlaces: 2, // Optional
        allowThousandSeparator: true // Optional
    },
    'BooleanColumn': {
        dataType: 'boolean' // true, false, TRUE, FALSE
    },
    'DateColumn': {
        dataType: 'date',
        format: 'MM/DD/YYYY' // Optional, can be array of formats ['MM/DD/YYYY', 'M/D/YYYY']
    },
    'DateTimeColumn': {
        dataType: 'datetime',
        format: 'MM/DD/YYYY HH:mm:ss' // Optional,  can be array of formats ['MM/DD/YYYY HH:mm:ss', 'M/D/YYYY HH:mm:ss']
    },
    'StringColumn': {
        dataType: 'string'
    },
    'PercentageColumn': {
        dataType: 'percentage' // 10%, 20.5%
    },
    'EmailColumn': {
        dataType: 'email'
    },
    'URLColumn': {
        dataType: 'url' // http://example.com
    },
    'PhoneNumberColumn': {
        dataType: 'phoneNumber',
        format: 'XXX-XXX-XXXX' // Optional
    },
    'NumberColumn': {
        dataType: 'number',
        allowThousandSeparator: true // Optional
    },
    'CurrencyColumn': {
        dataType: 'currency',
        symbol: '$',                       // Optional: Currency symbol
        require_symbol: false,             // Optional: Require currency symbol (default: false)
        allow_space_after_symbol: false,   // Optional: Allow space after symbol (default: false)
        symbol_after_digits: false,        // Optional: Symbol after digits (default: false)
        allow_negatives: true,             // Optional: Allow negatives (default: true)
        parens_for_negatives: false,       // Optional: Parentheses for negatives (default: false)
        negative_sign_before_digits: false,// Optional: Negative sign before digits (default: false)
        negative_sign_after_digits: false, // Optional: Negative sign after digits (default: false)
        allow_negative_sign_placeholder: false,// Optional: Allow negative sign placeholder (default: false)
        thousands_separator: ',',          // Optional: Thousands separator (default: ',')
        decimal_separator: '.',            // Optional: Decimal separator (default: '.')
        allow_decimal: true,               // Optional: Allow decimal (default: true)
        require_decimal: false,            // Optional: Require decimal (default: false)
        digits_after_decimal: [2],         // Optional: Digits after decimal (default: [2])
        allow_space_after_digits: false    // Optional: Allow space after digits (default: false)
    }
};
```

## Options

### columnDefinitions (required)
An object defining the validation rules for each column. Each key should correspond to a column header, and each value should be an object specifying the validation rules and error messages for that column.

Example:
```javascript
const columnDefinitions = {
    'Invoice Number': {
        dataType: 'string',
        required: true, // Optional, default false
    },
    'Invoice Amount': {
        dataType: 'decimal',
        required: true,
        decimalPlaces: 2,
        errors: { // Optional custom error messages
            required: "Invoice Amount is required.",
            invalid: "Invoice Amount must be an decimal with two decimal places."
        }
    },
    'Custom Field': {
        dataType: 'customType',
        customValidator: (value) => value === 'custom', // Optional
        errors: { // Optional custom error messages
            invalid: "Custom Field must have the value 'custom'."
        }
    }
};
```

### globalCustomValidators (optional)
An object defining global custom validators for specific data types. Default is an empty object.

Example:
```javascript
const globalCustomValidators = {
    'customType': (value) => { return value === 'custom'; }
};
```

### defaultInvalidMessages (optional)
An object defining default invalid messages for specific data types. Default is an empty object.

Example:
```javascript
const defaultInvalidMessages = {
    'integer': "This field must be an integer."
};
```

### language (optional)
The language for error messages. Supported languages are 'en', 'vi', 'zh', 'es', and 'fr'. Default is 'en'.

Example:
```javascript
const language = 'en';
```

### messages (optional)
An object defining custom error messages. Default is an empty object.

Example:
```javascript
const messages = {
    'required': "This field is required."
};
```

### skipEmptyLines (optional)
A boolean indicating whether to skip empty lines. Default is true.

Example:
```javascript
const skipEmptyLines = true;
```

### validateHeaderNames (optional)
A boolean indicating whether to validate header names. Default is true.

Example:
```javascript
const validateHeaderNames = true;
```

### customEmptyValueCheck (optional)
A function to check if a value is considered empty. Default is null.

Example:
```javascript
const customEmptyValueCheck = (value) => { return value === ''; };
```

## Advanced Usage

### Using with String

```javascript
import CSVValidator from 'csv-validator-js';

const columnDefinitions = {
    'Invoice Number': {
        dataType: 'integer',
        required: true,
        errors: {
            required: "Invoice Number is required.",
            invalid: "Invoice Number must be an integer."
        }
    },
    'Invoice Amount': {
        dataType: 'currency',
        required: true,
        errors: {
            required: "Invoice Amount is required.",
            invalid: "Invalid currency value"
        }
    },
    'Invoice Date': {
        dataType: 'date',
        format: 'MM/DD/YYYY',
        errors: {
            invalid: "Invalid date value"
        }
    },
    'Due Date': {
        dataType: 'date',
        format: 'MM/DD/YYYY',
        errors: {
            invalid: "Invalid date value"
        }
    },
    'Customer Email': {
        dataType: 'email',
        errors: {
            invalid: "Invalid email address"
        }
    },
    'Customer Website': {
        dataType: 'url',
        errors: {
            invalid: "Invalid URL"
        }
    },
    'Customer Phone': {
        dataType: 'phoneNumber',
        errors: {
            invalid: "Invalid phone number"
        }
    },
    'Discount Rate': {
        dataType: 'percentage',
        errors: {
            invalid: "Invalid percentage value"
        }
    },
    'Tax Amount': {
        dataType: 'decimal',
        decimalPlaces: 2,
        errors: {
            invalid: "Invalid decimal value"
        }
    },
    'Transaction Date': {
        dataType: 'datetime',
        format: 'MM/DD/YYYY HH:mm:ss',
        errors: {
            invalid: "Invalid datetime value"
        }
    }
};

const validator = new CSVValidator({
    columnDefinitions: columnDefinitions,
    validateHeaderNames: false
});

const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,12/31/2020 14:30:00
,invalid-amount,31/12/2020,2021-01-31,invalid-email,example.com,1234567890,15.5%,invalid,invalid
`;

validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
    if (isValid) {
        console.log('CSV file is valid.');
    } else {
        console.error('CSV file is invalid:', result);
    }
});
```

### Using with File

```javascript
_onDrop = (acceptedFiles) => {
    const csvColumns = {
        'Status': { dataType: 'string', required: true },
        'Series': { dataType: 'string', required: true },
        'Number': { dataType: 'integer' },
        'Deal': { dataType: 'string', required: true },
        'Issuer': { dataType: 'string' },
        'IssuerId': { dataType: 'string', required: true },
        'Buyer': { dataType: 'string' },
        'BuyerId': { dataType: 'string', required: true },
        'Funder': { dataType: 'string' },
        'FaceValue': { dataType: 'number', required: true },
        'RequiredRepaymentAmount': { dataType: 'number' },
        'Interest': { dataType: 'number' },
        'Rate': { dataType: 'percentage' },
        'Tiie': { dataType: 'string' },
        'CashInterest': { dataType: 'number' },
        'ServiceFee': { dataType: 'number' },
        'ServiceFeeRate': { dataType: 'percentage' },
        'Vat': { dataType: 'number' },
        'VatRate': { dataType: 'percentage' },
        'TechFee': { dataType: 'number' },
        'TechFeeRate': { dataType: 'percentage' },
        'VatTechFee': { dataType: 'number' },
        'VatTechFeeRate': { dataType: 'percentage' },
        'AdvanceAmount': { dataType: 'number' },
        'AdvanceRate': { dataType: 'percentage' },
        'Cap': { dataType: 'number' },
        'CapRate': { dataType: 'percentage' },
        'CapitalBalance': { dataType: 'number' },
        'InterestBalance': { dataType: 'number' },
        'OverdueInterestBalance': { dataType: 'number' },
        'TotalBalance': { dataType: 'number' },
        'Period': { dataType: 'integer' },
        'InitialDate': { dataType: 'date', format: ['MM/DD/YYYY', 'M/D/YYYY'], required: true },
        'DueDate': { dataType: 'date', format: ['MM/DD/YYYY', 'M/D/YYYY'], required: true },
        'AllowanceDate': { dataType: 'date', format: ['MM/DD/YYYY', 'M/D/YYYY'] }
    };

    const validator = new CSVValidator({
        columnDefinitions: csvColumns,
        validateHeaderNames: false
    });

    let allErrors = [];
    let valid = true;

    acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            validator.parseAndValidateCSVFile(file, (isValid, result) => {
                if (isValid) {
                    console.log('CSV file is valid.');
                } else {
                    valid = false;
                    allErrors.concat(result);
                    console.error('CSV file is invalid:', result);
                }
            });
        };
        reader.readAsText(file);
    });
};
```

### HTML for File Upload

```html
<input type="file" id="csvFileInput" accept=".csv">
```

### Result Inspection

To inspect the validation results, you can use the callback function provided in the `parseAndValidateCSVFile` method. Here is an example of how to log and handle the validation results:

```javascript
validator.parseAndValidateCSVFile(csvContent, function(isValid, result) {
    if (isValid) {
        console.log('CSV file is valid.');
    } else {
        console.error('CSV file is invalid:', result);
        // Handle the validation errors
        result.forEach(error => {
            console.error(error);
        });
    }
});
```

## License

This project is licensed under the MIT License.

## Author

- **Author Name**: [Hien Tran](https://github.com/dinhhientran)
- **Contact**: dinhientrn@gmail.com
