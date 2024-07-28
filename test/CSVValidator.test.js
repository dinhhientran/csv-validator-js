const CSVValidator = require('../src/index'); // Adjust the path as needed

describe('CSVValidator', () => {
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

    const validator = new CSVValidator(columnDefinitions);

    it('validates CSV content as a string with multiple errors', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,12/31/2020 14:30:00
,invalid-amount,31/12/2020,2021-01-31,invalid-email,example.com,1234567890,15.5%,invalid,invalid
`;

        validator.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 2: Invoice Number is required.",
                "Row 2: Invalid currency value",
                "Row 2: Invalid date value",
                "Row 2: Invalid date value",
                "Row 2: Invalid email address",
                "Row 2: Invalid URL",
                "Row 2: Invalid phone number",
                "Row 2: Invalid decimal value",
                "Row 2: Invalid datetime value"
            ]));
        });
    });

    it('validates CSV content as a string with valid data', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,12/31/2020 14:30:00
124,200.00,01/15/2021,02/15/2021,customer@example.com,https://example.com,987-654-3210,20%,220.00,01/15/2021 15:00:00
`;

        validator.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(true);
            expect(result).toEqual(["CSV file is valid."]);
        });
    });

    it('validates required fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
,100.00,,,,,,,,
`;

        validator.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 1: Invoice Number is required."
            ]));
        });
    });

    it('validates integer fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
abc,100.00,,,,,,,,
`;

        validator.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 1: Invoice Number must be an integer."
            ]));
        });
    });

    it('validates decimal fields with correct decimal places', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,,,,,100.123,
`;

        validator.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 1: Invalid decimal value"
            ]));
        });
    });

    it('validates email fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,,invalid-email,,,,
`;

        validator.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 1: Invalid email address"
            ]));
        });
    });

    it('validates URL fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,,,invalid-url,,,
`;

        validator.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 1: Invalid URL"
            ]));
        });
    });


    it('validates phone number fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,,,,invalid-phone,,
`;

        validator.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 1: Invalid phone number"
            ]));
        });
    });

    it('validates percentage fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,,,,invalid-percent,,
`;

        validator.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 1: Invalid percentage value"
            ]));
        });
    });

    it('validates date fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,31/12/2020,,,,,,,
`;

        validator.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 1: Invalid date value"
            ]));
        });
    });

    it('validates datetime fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,,,,,,invalid-datetime
`;

        validator.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 1: Invalid datetime value"
            ]));
        });
    });

    it('validates duplicate values', () => {
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

        const validatorWithDuplicates = new CSVValidator(columnDefinitionsWithDuplicates);

        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,12/31/2020 14:30:00
123,200.00,01/15/2021,02/15/2021,customer@example.com,https://example.com,987-654-3210,20%,220.00,01/15/2021 15:00:00
`;

        validatorWithDuplicates.parseAndValidateCSV(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 1, 2: Duplicate value \"123\" found in rows: 1, 2 for column: Invoice Number."
            ]));
        });
    });
});
