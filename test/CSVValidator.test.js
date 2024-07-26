import CSVValidator from '../src/CSVValidator';
import sampleData from './sampleData';

test('validate valid CSV data', () => {
    const columnDefinitions = {
        'InvoiceNumber': { dataType: 'integer', required: true },
        'InvoiceAmount': { dataType: 'currency', format: 'USD', required: true },
        'InvoiceDate': { dataType: 'date', format: 'MM/DD/YYYY', required: true },
        'DueDate': { dataType: 'date', format: 'MM/DD/YYYY', required: false },
        'CustomerEmail': { dataType: 'email', required: true }
    };

    const validator = new CSVValidator(columnDefinitions);
    validator.validateCSV(sampleData.validCSV, (isValid, result) => {
        expect(isValid).toBe(true);
    });
});

test('validate invalid CSV data', () => {
    const columnDefinitions = {
        'InvoiceNumber': { dataType: 'integer', required: true },
        'InvoiceAmount': { dataType: 'currency', format: 'USD', required: true },
        'InvoiceDate': { dataType: 'date', format: 'MM/DD/YYYY', required: true },
        'DueDate': { dataType: 'date', format: 'MM/DD/YYYY', required: false },
        'CustomerEmail': { dataType: 'email', required: true }
    };

    const validator = new CSVValidator(columnDefinitions);
    validator.validateCSV(sampleData.invalidCSV, (isValid, result) => {
        expect(isValid).toBe(false);
    });
});
