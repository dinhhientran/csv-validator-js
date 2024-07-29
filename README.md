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

## Data Types

- `integer`: Validates that the value is an integer.
- `decimal`: Validates that the value is a decimal number. You can specify the number of decimal places.
- `boolean`: Validates that the value is a boolean.
- `date`: Validates that the value is a date. You can specify the date format.
- `datetime`: Validates that the value is a datetime. You can specify the datetime format.
- `string`: Validates that the value is a string.
- `percentage`: Validates that the value is a percentage.
- `email`: Validates that the value is an email address.
- `url`: Validates that the value is a URL.
- `phoneNumber`: Validates that the value is a phone number.
- `currency`: Validates that the value is a currency.
- `number`: Validates that the value is a number.

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
        errors: {
            required: "Invoice Amount is required.", // Optional
            invalid: "Invoice Amount must be an decimal with two decimal places." //optional
        }
    },
    'Custom Field': {
        dataType: 'customType',
        customValidator: (value) => value === 'custom', // Optional
        errors: {
            invalid: "Custom Field must have the value 'custom'." // Optional
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

### errorMessageRowIndexStart (optional)
The starting index for row numbers in error messages. Default is 2.

Example:
```javascript
const errorMessageRowIndexStart = 2;
```

## Usage

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
        'Interest': { data type: 'number' },
        'Rate': { data type: 'percentage' },
        'Tiie': { data type: 'string' },
        'CashInterest': { data type: 'number' },
        'ServiceFee': { data type: 'number' },
        'ServiceFeeRate': { data type: 'percentage' },
        'Vat': { data type: 'number' },
        'VatRate': { data type: 'percentage' },
        'TechFee': { data type: 'number' },
        'TechFeeRate': { data type: 'percentage' },
        'VatTechFee': { data type: 'number' },
        'VatTechFeeRate': { data type: 'percentage' },
        'AdvanceAmount': { data type: 'number' },
        'AdvanceRate': { data type: 'percentage' },
        'Cap': { data type: 'number' },
        'CapRate': { data type: 'percentage' },
        'CapitalBalance': { data type: 'number' },
        'InterestBalance': { data type: 'number' },
        'OverdueInterestBalance': { data type: 'number' },
        'TotalBalance': { data type: 'number' },
        'Period': { data type: 'integer' },
        'InitialDate': { data type: 'date', format: ['MM/DD/YYYY', 'M/D/YYYY'], required: true },
        'DueDate': { data type: 'date', format: ['MM/DD/YYYY', 'M/D/YYYY'], required: true },
        'AllowanceDate': { data type: 'date', format: ['MM/DD/YYYY', 'M/D/YYYY'] }
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
                    allErrors are allErrors.concat(result);
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

To inspect the validation results, you can use the callback function provided in the `parseAndValidateCSV` method. Here is an example of how to log and handle the validation results:

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

In the example above, the `result` parameter will contain an array of error messages if the CSV file is invalid. You can iterate over this array to inspect and handle each validation error.

result:

```
[
  "Row 2: Invoice Number is required.",
  "Row 2: Invalid value at row 2, column 2 (InvoiceAmount). Expected type currency.",
  "Row 2: Invalid email address.",
  "Row 2: Invalid URL.",
  "Row 2: Invalid value at row 2, column 11 (TransactionDate). Expected type datetime."
]
```

## License

This project is licensed under the MIT License.

## Author

- **Author Name**: [Hien Tran](https://github.com/dinhhientran)
- **Contact**: dinhientrn@gmail.com
