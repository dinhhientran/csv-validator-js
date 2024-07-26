const validCSV = {
    meta: {
        fields: ['InvoiceNumber', 'InvoiceAmount', 'InvoiceDate', 'DueDate', 'CustomerEmail']
    },
    data: [
        { InvoiceNumber: '123', InvoiceAmount: '100.00', InvoiceDate: '12/31/2020', DueDate: '01/31/2021', CustomerEmail: 'test@example.com' }
    ],
    errors: []
};

const invalidCSV = {
    meta: {
        fields: ['InvoiceNumber', 'InvoiceAmount', 'InvoiceDate', 'DueDate', 'CustomerEmail']
    },
    data: [
        { InvoiceNumber: '', InvoiceAmount: 'invalid-amount', InvoiceDate: '31/12/2020', DueDate: '2021-01-31', CustomerEmail: 'invalid-email' }
    ],
    errors: []
};

export default { validCSV, invalidCSV };
