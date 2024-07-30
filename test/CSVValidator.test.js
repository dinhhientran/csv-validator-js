const CSVValidator = require('../src/index').default; // Adjust the path as needed

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

    const validator = new CSVValidator({
        columnDefinitions: columnDefinitions,
        validateHeaderNames: false,
        errorMessageRowIndexStart: 2 // Default value, you can remove this if it's always 2
    });

    it('validates CSV content as a string with multiple errors', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,12/31/2020 14:30:00
,invalid-amount,31/12/2020,2021-01-31,invalid-email,example.com,1234567890,15.5%,invalid,invalid
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            console.log(result)
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 3: Invoice Number is required.",
                "Row 3: Invalid currency value",
                "Row 3: Invalid date value",
                "Row 3: Invalid date value",
                "Row 3: Invalid email address",
                "Row 3: Invalid decimal value",
                "Row 3: Invalid datetime value"
            ]));
        });
    });

    it('validates CSV content as a string with valid data', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,12/31/2020 14:30:00
124,200.00,01/15/2021,02/15/2021,customer@example.com,https://example.com,987-654-3210,20%,220.00,01/15/2021 15:00:00
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(true);
            expect(result).toEqual(["CSV file is valid."]);
        });
    });

    it('validates required fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
,100.00,,,,,,,,
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 2: Invoice Number is required."
            ]));
        });
    });

    it('validates integer fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
abc,100.00,,,,,,,,
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 2: Invoice Number must be an integer."
            ]));
        });
    });

    it('validates decimal fields with correct decimal places', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,,,,,100.123,
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 2: Invalid decimal value"
            ]));
        });
    });

    it('validates email fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,invalid-email,,,,,
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 2: Invalid email address"
            ]));
        });
    });

    it('validates URL fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,,invalid-url,,,,
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 2: Invalid URL"
            ]));
        });
    });

    it('validates phone number fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,,,invalid-phone,,,
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 2: Invalid phone number"
            ]));
        });
    });

    it('validates percentage fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,,,,invalid-percent,,
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 2: Invalid percentage value"
            ]));
        });
    });

    it('validates date fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,31/12/2020,,,,,,,
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 2: Invalid date value"
            ]));
        });
    });

    it('validates datetime fields', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,,,,,,,,invalid-datetime
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 2: Invalid datetime value"
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

        const validator = new CSVValidator({
            columnDefinitions: columnDefinitionsWithDuplicates,
            validateHeaderNames: false
        });

        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,12/31/2020 14:30:00
123,200.00,01/15/2021,02/15/2021,customer@example.com,https://example.com,987-654-3210,20%,220.00,01/15/2021 15:00:00
`;

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Duplicate value \"123\" found in rows: 2, 3 for column: Invoice Number."
            ]));
        });
    });

    it('validates CSV content as a string with columns Status and Series', () => {
        const csvContent = `
Status,Series,Number,Deal #,Issuer,sellerID,Buyer,buyerID,Funder,Face Value,Fund Amount,Interest,Rate,TIIE,Cash Interest,Service Fee,Service Fee Rate,VAT,VAT %,Tech Fee,Tech Fee Rate,VAT Tech Fee,VAT %,Advance Amount,Advance %,CAP,CAP %,Capital Balance,Interest Balance,Overdue Interest Balance,Total Balance,Period,Initial Date,Due Date,Allowance Date
Activo,D,378,FPF190405NW7-378,CAPITAL AUTOMATICO SAPI DE CV SOFOM ENR,FPF190405NW7-SR,FRABEL SA DE CV,FRA961126F59-SR,JunoMx Capital SOFOM ENR,"2,140,168","1,712,134","60,995",14%, TIIE , -   ,"17,121",1.00%,"2,739",16.00%,, -   ,, -   ,"1,712,134",80%,"428,034",20%,"1,712,134","60,995", -   ,"1,773,129",90,7/15/2024,10/13/2024,
Activo,D,379,FPF190405NW7-379,CAPITAL AUTOMATICO SAPI DE CV SOFOM ENR,FPF190405NW7-SR,FRABEL SA DE CV,FRA961126F59-SR,JunoMx Capital SOFOM ENR,"4,423,360","3,538,688","123,854",14%, TIIE , -   ,"35,387",1.00%,"5,662",16.00%,, -   ,, -   ,"3,538,688",80%,"884,672",20%,"3,538,688","123,854", -   ,"3,662,542",90,7/15/2024,10/13/2024,
`;

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
            validateHeaderNames: false,
            customEmptyValueCheck: (value) => {
                return value != null && value.trim() == '' || value.trim() === '-';
            }
        });
        let isValid;
        let result;

        validator.parseAndValidateCSVString(csvContent, (valid, res) => {
            isValid = valid;
            result = res;
        });

        expect(isValid).toBe(true);
    });

    it('validates Mepco CSV content', () => {
        const csvContent = `
Finance Reference Number,Policy ID,Supplier Name,Supplier Reference Number,Supplier Sector,Supplier Country,Account Debtor,Account Debtor Reference Number,Account Debtor Rating (S&P),Account Debtor Rating (Moody's),Account Debtor Rating (A.M. Best),Account Debtor Sector,Account  Debtor Country,Parent Obligor ,Parent Obligor Reference Number,Parent Obligor Rating (S&P),Parent Obligor Rating (Moody's),Parent Obligor (A.M. Best),Transaction Date,Transaction Due Date Earliest,Transaction Due Date,Maturity Date, Net Transaction Amount ,Est. Program Fee, Net Funding Amount 
20231222048354-1,EBEP0097148,EVERYTHING BREAKS INC,ADM000051,4030,US,CONTINENTAL INDEMNITY COMPANY,INS000084,,A3,A,4030,US,North American Casualty Group/Generali,COR10013,,A3,A,1/15/2024,2/11/2024,3/11/2024,4/11/2024, 76.88 , 9.99 , 66.89 
20231229054601-1,35179000054,EFG COMPANIES,ADM004437,4030,US,AMERICAN SECURITY INSURANCE,INS000014,A,A2,A+,4030,US,Assurant,COR10005,A,A2,A+,1/15/2024,2/11/2024,3/11/2024,4/11/2024, 170.29 , 20.43 , 149.86 
`;

        const csvColumns = {
            'FinanceReferenceNumber': { dataType: 'string', required: true },
            'PolicyId': { dataType: 'string', required: true },
            'Supplier': { dataType: 'string' },
            'SupplierRefNumber': { dataType: 'string' },
            'SupplierSector': { dataType: 'string' },
            'SupplierCountry': { dataType: 'string' },
            'AccountDebtor': { dataType: 'string' },
            'AccountDebtorRefNumber': { dataType: 'string' },
            'AccountDebtorRatingSP': { dataType: 'string' },
            'AccountDebtorRatingMoody': { dataType: 'string' },
            'AccountDebtorRatingAmBest': { dataType: 'string' },
            'AccountDebtorSector': { dataType: 'string' },
            'AccountDebtorCountry': { dataType: 'string' },
            'ParentObligor': { dataType: 'string' },
            'ParentObligorRefNumber': { dataType: 'string' },
            'ParentObligorRatingSP': { dataType: 'string' },
            'ParentObligorRatingMoody': { dataType: 'string' },
            'ParentObligorRatingAmBest': { dataType: 'string' },
            'TransactionDate': { dataType: 'date', format: ['MM/DD/YYYY', 'M/D/YYYY'], required: true },
            'TransactionDueDateEarliest': { dataType: 'date', format: ['MM/DD/YYYY', 'M/D/YYYY'] },
            'TransactionDueDate': { dataType: 'date', format: ['MM/DD/YYYY', 'M/D/YYYY'] },
            'MaturityDate': { dataType: 'date', format: ['MM/DD/YYYY', 'M/D/YYYY'] },
            'NetTransactionAmount': { dataType: 'number' },
            'EstProgramFee': { dataType: 'number' },
            'NetFundingAmount': { dataType: 'number' }
        };

        const validator = new CSVValidator({
            columnDefinitions: csvColumns,
            validateHeaderNames: false
        });
        let isValid;
        let result;

        validator.parseAndValidateCSVString(csvContent, (valid, res) => {
            isValid = valid;
            result = res;
        });

        console.log(result);

        expect(isValid).toBe(true);
    });

    it('validates header names', () => {
        const csvContent = `
Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,12/31/2020 14:30:00
`;

        const validator = new CSVValidator({
            columnDefinitions: columnDefinitions,
            validateHeaderNames: true
        });

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(true);
            expect(result).toEqual(["CSV file is valid."]);
        });
    });

    it('fails on invalid header names', () => {
        const csvContent = `
Invalid Invoice Number,Invoice Amount,Invoice Date,Due Date,Customer Email,Customer Website,Customer Phone,Discount Rate,Tax Amount,Transaction Date
123,100.00,12/31/2020,01/31/2021,test@example.com,http://example.com,123-456-7890,10%,110.00,12/31/2020 14:30:00
`;

        const validator = new CSVValidator({
            columnDefinitions: columnDefinitions,
            validateHeaderNames: true
        });

        validator.parseAndValidateCSVString(csvContent, (isValid, result) => {
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 1: Invalid header name Invalid Invoice Number at column 1."
            ]));
        });
    });
});

describe('CSVValidator - isDecimal Function', () => {
    const validator = new CSVValidator({
        columnDefinitions: {},
        validateHeaderNames: false
    });

    it('validates decimal values with specific decimal places', () => {
        expect(validator.isDecimal("123.45", 2)).toBe(true);
        expect(validator.isDecimal("123.456", 2)).toBe(false);
        expect(validator.isDecimal("123.4", 2)).toBe(false);
        expect(validator.isDecimal("123.456", 3)).toBe(true);
    });

    it('validates decimal values with comma as thousand separator', () => {
        expect(validator.isDecimal("1,234.56", 2, true)).toBe(true);
        expect(validator.isDecimal("1,234,567.89", 2, true)).toBe(true);
        expect(validator.isDecimal("12,34.56", 2, true)).toBe(true);
        expect(validator.isDecimal("1,234.567", 2, true)).toBe(false);
    });

    it('validates decimal values with no specific decimal places', () => {
        expect(validator.isDecimal("123.456")).toBe(true);
        expect(validator.isDecimal("123")).toBe(true);
        expect(validator.isDecimal("1,234.567", null, true)).toBe(true);
    });

    it('validates negative decimal values', () => {
        expect(validator.isDecimal("-123.45", 2)).toBe(true);
        expect(validator.isDecimal("-1,234.56", 2, true)).toBe(true);
        expect(validator.isDecimal("-123.456", 2)).toBe(false);
        expect(validator.isDecimal("-1,234.567", null, true)).toBe(true);
    });

    it('fails on invalid decimal values', () => {
        expect(validator.isDecimal("abc", 2)).toBe(false);
        expect(validator.isDecimal("123.45.67", 2)).toBe(false);
        expect(validator.isDecimal("123,45", 2)).toBe(false);
        expect(validator.isDecimal("1,234.56.78", 2)).toBe(false);
    });
});

describe('isInteger function', () => {
    const validator = new CSVValidator({ columnDefinitions: {} });

    it('should return true for valid integer values', () => {
        expect(validator.isInteger("123")).toBe(true);
        expect(validator.isInteger("0")).toBe(true);
        expect(validator.isInteger("-123")).toBe(true);
    });

    it('should return false for invalid integer values', () => {
        expect(validator.isInteger("123.45")).toBe(false);
        expect(validator.isInteger("abc")).toBe(false);
        expect(validator.isInteger("123a")).toBe(false);
        expect(validator.isInteger("12 3")).toBe(false);
        expect(validator.isInteger("")).toBe(false);
        expect(validator.isInteger(null)).toBe(false);
        expect(validator.isInteger(undefined)).toBe(false);
    });

    it('should return false for values with commas', () => {
        expect(validator.isInteger("1,234")).toBe(false);
        expect(validator.isInteger("12,34")).toBe(false);
    });

    it('should return true for integer values with spaces', () => {
        expect(validator.isInteger(" 123 ")).toBe(true);
        expect(validator.isInteger(" 0 ")).toBe(true);
        expect(validator.isInteger(" -123 ")).toBe(true);
    });

    it('should return false for values with decimal places', () => {
        expect(validator.isInteger("123.0")).toBe(false);
        expect(validator.isInteger("-123.0")).toBe(false);
        expect(validator.isInteger("0.0")).toBe(false);
    });
});

describe('isDate function', () => {
    const validator = new CSVValidator({ columnDefinitions: {} });

    it('should return true for valid date values with given formats', () => {
        expect(validator.isDate("12/31/2020", 'MM/DD/YYYY')).toBe(true);
        expect(validator.isDate("31/12/2020", 'DD/MM/YYYY')).toBe(true);
        expect(validator.isDate("2020-12-31", 'YYYY-MM-DD')).toBe(true);
    });

    it('should return false for invalid date values with given formats', () => {
        expect(validator.isDate("12/31/2020", 'DD/MM/YYYY')).toBe(false);
        expect(validator.isDate("31/12/2020", 'MM/DD/YYYY')).toBe(false);
        expect(validator.isDate("2020-31-12", 'YYYY-MM-DD')).toBe(false);
    });

    it('should return true for valid date values with popular formats when format is not given', () => {
        expect(validator.isDate("12/31/2020")).toBe(true);
        expect(validator.isDate("31/12/2020")).toBe(true);
        expect(validator.isDate("2020-12-31")).toBe(true);
        expect(validator.isDate("12-31-2020")).toBe(true);
        expect(validator.isDate("31-12-2020")).toBe(true);
        expect(validator.isDate("2020/12/31")).toBe(true);
        expect(validator.isDate("12/31/2020")).toBe(true);
        expect(validator.isDate("31/12/2020")).toBe(true);
        expect(validator.isDate("20201231")).toBe(true);
    });

    it('should return false for invalid date values with popular formats when format is not given', () => {
        expect(validator.isDate("31/31/2020")).toBe(false);
        expect(validator.isDate("2020-31-31")).toBe(false);
        expect(validator.isDate("12-31-20")).toBe(false);
        expect(validator.isDate("31/12/20")).toBe(false);
        expect(validator.isDate("2020-12-31T00:00:00")).toBe(false);
    });

    it('should return false for null, undefined, or empty string', () => {
        expect(validator.isDate(null)).toBe(false);
        expect(validator.isDate(undefined)).toBe(false);
        expect(validator.isDate('')).toBe(false);
    });
});

describe('isNumeric function', () => {
    const validator = new CSVValidator({ columnDefinitions: {} });

    it('should return true for valid numeric values', () => {
        expect(validator.isNumeric("123")).toBe(true);
        expect(validator.isNumeric("-123")).toBe(true);
        expect(validator.isNumeric("123.45")).toBe(true);
        expect(validator.isNumeric("-123.45")).toBe(true);
        expect(validator.isNumeric("1,234")).toBe(true);
        expect(validator.isNumeric("-1,234")).toBe(true);
        expect(validator.isNumeric("1,234.56")).toBe(true);
        expect(validator.isNumeric("-1,234.56")).toBe(true);
    });

    it('should return false for invalid numeric values', () => {
        expect(validator.isNumeric("123abc")).toBe(false);
        expect(validator.isNumeric("abc123")).toBe(false);
        expect(validator.isNumeric("123.45.67")).toBe(false);
        expect(validator.isNumeric("")).toBe(false);
        expect(validator.isNumeric(" ")).toBe(false);
    });

    it('should return false for null, undefined, or empty string', () => {
        expect(validator.isNumeric(null)).toBe(false);
        expect(validator.isNumeric(undefined)).toBe(false);
        expect(validator.isNumeric('')).toBe(false);
    });

    it('should return true for valid numeric values without thousand separators', () => {
        expect(validator.isNumeric("1234567890")).toBe(true);
        expect(validator.isNumeric("-1234567890")).toBe(true);
        expect(validator.isNumeric("1234567890.123")).toBe(true);
        expect(validator.isNumeric("-1234567890.123")).toBe(true);
    });

    it('should return false for numeric values with misplaced thousand separators', () => {
        expect(validator.isNumeric("1,23,456")).toBe(false);
        expect(validator.isNumeric("1234,567")).toBe(false);
        expect(validator.isNumeric("12,34,567.89")).toBe(false);
        expect(validator.isNumeric("12,345,67.89")).toBe(false);
    });

});

describe('CSVValidator.isURL', () => {
    let validator;

    beforeAll(() => {
        validator = new CSVValidator({
            columnDefinitions: {}
        });
    });

    it('should return true for valid URLs', () => {
        expect(validator.isURL("http://example.com")).toBe(true);
        expect(validator.isURL("https://example.com")).toBe(true);
        expect(validator.isURL("http://www.example.com")).toBe(true);
        expect(validator.isURL("https://www.example.com")).toBe(true);
        expect(validator.isURL("https://example.com/path?name=value#anchor")).toBe(true);
        expect(validator.isURL("http://subdomain.example.com")).toBe(true);
        expect(validator.isURL("https://subdomain.example.com")).toBe(true);
        expect(validator.isURL("ftp://example.com")).toBe(true);
    });

    it('should return false for invalid URLs', () => {
        expect(validator.isURL("http//example.com")).toBe(false);
        expect(validator.isURL("http:/example.com")).toBe(false);
        expect(validator.isURL("http:example.com")).toBe(false);
        expect(validator.isURL("http://example")).toBe(false);
        expect(validator.isURL("http://.com")).toBe(false);
        expect(validator.isURL("http://com")).toBe(false);
        expect(validator.isURL("http://example.com:port")).toBe(false);
    });

    it('should return false for non-string values', () => {
        expect(validator.isURL(null)).toBe(false);
        expect(validator.isURL(undefined)).toBe(false);
        expect(validator.isURL({})).toBe(false);
        expect(validator.isURL([])).toBe(false);
        expect(validator.isURL(true)).toBe(false);
    });

    it('should return false for empty strings', () => {
        expect(validator.isURL("")).toBe(false);
    });
});

describe('CSVValidator.isPhoneNumber', () => {
    let validator;

    beforeAll(() => {
        validator = new CSVValidator({
            columnDefinitions: {}
        });
    });

    it('should return true for valid phone numbers in various popular formats', () => {
        expect(validator.isPhoneNumber("123-456-7890")).toBe(true);
        expect(validator.isPhoneNumber("(123) 456-7890")).toBe(true);
        expect(validator.isPhoneNumber("123.456.7890")).toBe(true);
        expect(validator.isPhoneNumber("123 456 7890")).toBe(true);
        expect(validator.isPhoneNumber("+1-123-456-7890")).toBe(true);
        expect(validator.isPhoneNumber("+91 (123) 456-7890")).toBe(true);
        expect(validator.isPhoneNumber("+44 123 456 7890")).toBe(true);
        expect(validator.isPhoneNumber("1234567890")).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
        expect(validator.isPhoneNumber("123-45a-7890")).toBe(false);
    });

    it('should return false for non-string values', () => {
        expect(validator.isPhoneNumber(1234567890)).toBe(false);
        expect(validator.isPhoneNumber(null)).toBe(false);
        expect(validator.isPhoneNumber(undefined)).toBe(false);
        expect(validator.isPhoneNumber({})).toBe(false);
        expect(validator.isPhoneNumber([])).toBe(false);
        expect(validator.isPhoneNumber(true)).toBe(false);
    });

    it('should return false for empty strings', () => {
        expect(validator.isPhoneNumber("")).toBe(false);
    });

    it('should return true for valid phone numbers matching specific format', () => {
        expect(validator.isPhoneNumber("123-456-7890", "XXX-XXX-XXXX")).toBe(true);
        expect(validator.isPhoneNumber("123 456 7890", "XXX XXX XXXX")).toBe(true);
        expect(validator.isPhoneNumber("(123) 456-7890", "(XXX) XXX-XXXX")).toBe(true);
    });

    it('should return false for phone numbers not matching specific format', () => {
        expect(validator.isPhoneNumber("123.456.7890", "XXX-XXX-XXXX")).toBe(false);
        expect(validator.isPhoneNumber("123-456-7890", "XXX XXX XXXX")).toBe(false);
        expect(validator.isPhoneNumber("123-456-7890", "(XXX) XXX-XXXX")).toBe(false);
    });
});

describe('CSVValidator.isCurrency', () => {
    let validator;

    beforeAll(() => {
        validator = new CSVValidator({
            columnDefinitions: {}
        });
    });

    it('should return true for valid currency values with default options', () => {
        expect(validator.isCurrency("123.45")).toBe(true);
        expect(validator.isCurrency("$123.45")).toBe(true);
        expect(validator.isCurrency("123")).toBe(true);
        expect(validator.isCurrency("1,234.56")).toBe(true);
        expect(validator.isCurrency("-123.45")).toBe(true);
    });

    it('should return false for invalid currency values with default options', () => {
        expect(validator.isCurrency("123.456")).toBe(false);
        expect(validator.isCurrency("123,45")).toBe(false);
        expect(validator.isCurrency("123.45.67")).toBe(false);
        expect(validator.isCurrency("123.45$")).toBe(false);
        expect(validator.isCurrency("abc")).toBe(false);
    });

    it('should return true for valid currency values with custom options', () => {
        const options = {
            symbol: '€',
            require_symbol: true,
            decimal_separator: ',',
            thousands_separator: '.',
            allow_decimal: true,
            digits_after_decimal: [2]
        };
        expect(validator.isCurrency("€1.234,56", options)).toBe(true);
        expect(validator.isCurrency("€123,45", options)).toBe(true);
        expect(validator.isCurrency("€1.234", options)).toBe(true);
    });

    it('should return false for invalid currency values with custom options', () => {
        const options = {
            symbol: '€',
            require_symbol: true,
            decimal_separator: '.',
            thousands_separator: ',',
            allow_decimal: true,
            digits_after_decimal: [2]
        };
        expect(validator.isCurrency("1,234.56", options)).toBe(false);
        expect(validator.isCurrency("€123,45", options)).toBe(false);
        expect(validator.isCurrency("€1.234,56", options)).toBe(false);
        expect(validator.isCurrency("€123.4", options)).toBe(false);
    });

    it('should return true for valid currency values without decimal', () => {
        const options = {
            allow_decimal: false
        };
        expect(validator.isCurrency("12345", options)).toBe(true);
        expect(validator.isCurrency("$12345", options)).toBe(true);
        expect(validator.isCurrency("1,234,567", options)).toBe(true);
    });

    it('should return false for invalid currency values without decimal', () => {
        const options = {
            allow_decimal: false
        };
        expect(validator.isCurrency("123.45", options)).toBe(false);
        expect(validator.isCurrency("$123.45", options)).toBe(false);
        expect(validator.isCurrency("1,234.56", options)).toBe(false);
    });
});

describe('CSVValidator.isEmptyRow', () => {
    let validator;

    beforeAll(() => {
        validator = new CSVValidator({
            columnDefinitions: {}
        });
    });

    it('should return true for empty rows', () => {
        expect(validator.isEmptyRow({})).toBe(true);
        expect(validator.isEmptyRow({ col1: '', col2: '', col3: '' })).toBe(true);
        expect(validator.isEmptyRow({ col1: null, col2: null, col3: null })).toBe(true);
        expect(validator.isEmptyRow({ col1: undefined, col2: undefined, col3: undefined })).toBe(true);
    });

    it('should return false for non-empty rows', () => {
        expect(validator.isEmptyRow({ col1: 'value', col2: '', col3: '' })).toBe(false);
        expect(validator.isEmptyRow({ col1: '', col2: 'value', col3: '' })).toBe(false);
        expect(validator.isEmptyRow({ col1: '', col2: '', col3: 'value' })).toBe(false);
        expect(validator.isEmptyRow({ col1: 'value1', col2: 'value2', col3: 'value3' })).toBe(false);
    });

    it('should return true for custom empty value check with default implementation', () => {
        const customValidator = new CSVValidator({
            columnDefinitions: {},
            customEmptyValueCheck: (value) => value === '-' || value.trim() === ''
        });

        expect(customValidator.isEmptyRow({ col1: '-', col2: '-', col3: '-' })).toBe(true);
        expect(customValidator.isEmptyRow({ col1: ' ', col2: ' ', col3: ' ' })).toBe(true);
        expect(customValidator.isEmptyRow({ col1: '-', col2: '', col3: ' ' })).toBe(true);
    });

    it('should return false for custom empty value check with default implementation', () => {
        const customValidator = new CSVValidator({
            columnDefinitions: {},
            customEmptyValueCheck: (value) => value === '-' || value.trim() === ''
        });

        expect(customValidator.isEmptyRow({ col1: 'value', col2: '-', col3: '-' })).toBe(false);
        expect(customValidator.isEmptyRow({ col1: '-', col2: 'value', col3: '-' })).toBe(false);
        expect(customValidator.isEmptyRow({ col1: '-', col2: '-', col3: 'value' })).toBe(false);
        expect(customValidator.isEmptyRow({ col1: 'value1', col2: 'value2', col3: 'value3' })).toBe(false);
    });
});
