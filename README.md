
# CSVValidatorJS

CSVValidatorJS is a robust JavaScript library for validating CSV files with custom rules and error messages. It supports various data types, including integers, decimals, booleans, dates, datetimes, percentages, emails, URLs, phone numbers, currencies, and general numbers. The library also supports multi-language error messages.

## Features

- Validate various data types.
- Customizable error messages.
- Support for multiple languages.
- Duplicate value detection.
- Custom validators.
- Decimal place validation for decimals.

## Installation

```bash
npm install csvvalidatorjs
```

## Usage

### Basic Example

#### Using CSV Content as a String

```javascript
import CSVValidator from 'csvvalidatorjs';

// Define column rules
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
        required: false 
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
        required: false 
    },
    'CustomerPhone': { 
        dataType: 'phoneNumber', 
        format: 'XXX-XXX-XXXX', 
        required: false 
    },
    'DiscountRate': { 
        dataType: 'percentage', 
        required: false, 
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

// Define global custom validators
const globalCustomValidators = {
    required: function(value, header) {
        return value !== undefined && value !== null && value !== '';
    },
    percentage: function(value) {
        const regex = /^\d+(\.\d{1,3})?\s?%$/;
        return regex.test(value);
    }
};

// Default invalid messages
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

// Messages for different languages
const messages = {
    es: {
        required: 'Falta el valor requerido en la fila {row}, columna {column} ({header}).',
        duplicate: 'Valor duplicado "{value}" encontrado en las filas: {rows} para la columna: {column}.',
        emptyRow: 'La fila {row} está vacía.',
        headerLength: 'Desajuste de longitud de encabezado. Se esperaban {expected} encabezados pero se obtuvieron {actual}.',
        valid: 'El archivo CSV es válido.',
        ...defaultInvalidMessages
    },
    fr: {
        required: 'Valeur requise manquante à la ligne {row}, colonne {column} ({header}).',
        duplicate: 'Valeur en double "{value}" trouvée dans les lignes : {rows} pour la colonne : {column}.',
        emptyRow: 'La ligne {row} est vide.',
        headerLength: 'Désaccord sur la longueur de l'en-tête. {expected} en-têtes attendus mais {actual} obtenus.',
        valid: 'Le fichier CSV est valide.',
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
    zh: {
        required: '第 {row} 行，第 {column} 列 ({header}) 缺少必填值。',
        duplicate: '在第 {rows} 行找到的重复值 "{value}"，列: {column}。',
        emptyRow: '第 {row} 行为空。',
        headerLength: '标题长度不匹配。预计 {expected} 个标题，但得到 {actual} 个。',
        valid: 'CSV 文件有效。',
        ...defaultInvalidMessages
    }
};

// Initialize the validator
const validator = new CSVValidator(columnDefinitions, globalCustomValidators, defaultInvalidMessages, 'vi', messages);

// Example CSV content as a string
const csvContent = `
InvoiceNumber,InvoiceAmount,InvoiceDate,DueDate,CustomerEmail,CustomerWebsite,CustomerPhone,DiscountRate,TotalAmount,TaxAmount,TransactionDate
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,10.00,12/31/2020 14:30:00
,invalid-amount,31/12/2020,2021-01-31,invalid-email,example.com,1234567890,15.5%,125.50,invalid,invalid
`;

// Parse and validate the CSV content
validator.parseAndValidateCSV(csvContent, function(isValid, result) {
    if (isValid) {
        console.log('CSV file is valid.');
    } else {
        console.error('CSV file is invalid:', result);
    }
});
```

#### Using CSV Content as a File

```javascript
import CSVValidator from 'csvvalidatorjs';

// Define column rules
const columnDefinitions = {
    // same as above
};

// Define global custom validators
const globalCustomValidators = {
    // same as above
};

// Default invalid messages
const defaultInvalidMessages = {
    // same as above
};

// Messages for different languages
const messages = {
    // same as above
};

// Initialize the validator
const validator = new CSVValidator(columnDefinitions, globalCustomValidators, defaultInvalidMessages, 'vi', messages);

document.getElementById('csvFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        validator.parseAndValidateCSV(file, function(isValid, result) {
            if (isValid) {
                console.log('CSV file is valid.');
            } else {
                console.error('CSV file is invalid:', result);
            }
        }, true);
    }
});
```

### HTML for File Upload

```html
<input type="file" id="csvFileInput" accept=".csv">
```

## License

This project is licensed under the MIT License.
