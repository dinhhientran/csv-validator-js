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
            expect(isValid).toBe(false);
            expect(result).toEqual(expect.arrayContaining([
                "Row 3: Invoice Number is required.",
                "Row 3: Invalid currency value",
                "Row 3: Invalid date value",
                "Row 3: Invalid date value",
                "Row 3: Invalid email address",
                "Row 3: Invalid URL",
                "Row 3: Invalid phone number",
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
});
