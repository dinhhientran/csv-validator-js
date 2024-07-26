import moment from 'moment';

class CSVValidator {
    constructor(columnDefinitions, validateDuplicates = false, globalCustomValidators = {}) {
        this.columnDefinitions = columnDefinitions;
        this.expectedHeaderLength = Object.keys(columnDefinitions).length;
        this.validateDuplicates = validateDuplicates;
        this.globalCustomValidators = globalCustomValidators;
        this.seenValues = {};
    }

    validateCSV(data, callback) {
        const { meta, data: rows, errors } = data;

        if (errors.length > 0) {
            callback(false, errors.map(e => `Row ${e.row + 1}: ${e.message}`));
            return;
        }

        const headerValidationResult = this.validateHeaderLength(meta.fields);
        if (!headerValidationResult.isValid) {
            callback(false, headerValidationResult.errors);
            return;
        }

        let rowErrors = [];
        for (let i = 0; i < rows.length; i++) {
            if (this.isEmptyRow(rows[i])) {
                rowErrors.push(`Row ${i + 1} is empty.`);
                continue;
            }

            const rowValidationResult = this.validateRow(rows[i], i + 1, meta.fields);
            if (!rowValidationResult.isValid) {
                rowErrors = rowErrors.concat(rowValidationResult.errors);
            }
        }

        if (this.validateDuplicates) {
            // Check for duplicates in the first column
            Object.keys(this.seenValues).forEach(value => {
                if (this.seenValues[value].length > 1) {
                    const duplicateRows = this.seenValues[value].join(', ');
                    rowErrors.push(`Duplicate value "${value}" found in rows: ${duplicateRows}.`);
                }
            });
        }

        if (rowErrors.length > 0) {
            callback(false, rowErrors);
        } else {
            callback(true, 'CSV file is valid.');
        }
    }

    validateHeaderLength(headers) {
        let isValid = true;
        let errors = [];

        if (headers.length !== this.expectedHeaderLength) {
            isValid = false;
            errors.push(`Header length mismatch. Expected ${this.expectedHeaderLength} headers but got ${headers.length}.`);
        }

        return { isValid, errors };
    }

    validateRow(row, rowIndex, headers) {
        let isValid = true;
        let errors = [];

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const value = row[header];
            const definition = this.columnDefinitions[header];
            const type = definition?.dataType;
            const dateFormat = definition?.format;
            const required = definition?.required;
            const customErrors = definition?.errors || {};
            const customRequiredValidator = definition?.customRequiredValidator || this.globalCustomValidators.required;
            const customValidator = definition?.customValidator;

            // Track duplicates in the first column if validation is enabled
            if (i === 0 && this.validateDuplicates) {
                if (!this.seenValues[value]) {
                    this.seenValues[value] = [];
                }
                this.seenValues[value].push(rowIndex);
            }

            // Check for required fields using custom validator if provided
            if (required && (customRequiredValidator ? !customRequiredValidator(value, header) : (value === undefined || value === null || value === ''))) {
                isValid = false;
                errors.push(customErrors.required || `Missing required value at row ${rowIndex}, column ${i + 1} (${header}).`);
                continue; // No need to check further validation if required field is missing
            }

            // Use custom validator for this column if provided
            if (customValidator && !customValidator(value)) {
                isValid = false;
                errors.push(customErrors.invalid || `Invalid value at row ${rowIndex}, column ${i + 1} (${header}).`);
            } else if (!customValidator && !this.validateValue(value, type, dateFormat)) {
                isValid = false;
                errors.push(customErrors.invalid || `Invalid value at row ${rowIndex}, column ${i + 1} (${header}). Expected type ${type}${type === 'date' || type === 'datetime' ? ` (format: ${dateFormat})` : ''}.`);
            }
        }

        return { isValid, errors };
    }

    validateValue(value, type, dateFormat) {
        if (this.globalCustomValidators[type]) {
            return this.globalCustomValidators[type](value, dateFormat);
        }

        if (type === 'integer') {
            return this.isInteger(value);
        } else if (type === 'decimal') {
            return this.isDouble(value);
        } else if (type === 'boolean') {
            return this.isBoolean(value);
        } else if (type === 'date' || type === 'datetime') {
            return this.isDateTime(value, dateFormat);
        } else if (type === 'percentage') {
            return this.isPercentage(value);
        } else if (type === 'email') {
            return this.isEmail(value);
        } else if (type === 'url') {
            return this.isURL(value);
        } else if (type === 'phoneNumber') {
            return this.isPhoneNumber(value, dateFormat);
        } else if (type === 'currency') {
            return this.isCurrency(value, dateFormat);
        } else if (type === 'string') {
            return true; // No validation needed for string type
        }
        return false;
    }

    isInteger(value) {
        return value !== undefined && value !== null && value !== '' && !isNaN(value) && Number.isInteger(parseFloat(value));
    }

    isDouble(value) {
        return value !== undefined && value !== null && value !== '' && !isNaN(value) && !isNaN(parseFloat(value));
    }

    isBoolean(value) {
        return value === 'true' || value === 'false';
    }

    isDateTime(value, dateFormat) {
        if (!dateFormat) return false;
        const date = moment(value, dateFormat, true);
        if (date.isValid()) {
            return true;
        }
        // Try parsing with default formats if provided format fails
        const alternativeFormats = ['M/D/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD HH:mm:ss'];
        for (let format of alternativeFormats) {
            if (moment(value, format, true).isValid()) {
                return true;
            }
        }
        return false;
    }

    isPercentage(value) {
        const regex = /^\d+(\.\d{1,2})?\s?%$/;
        return regex.test(value);
    }

    isEmail(value) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
    }

    isURL(value) {
        const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        return regex.test(value);
    }

    isPhoneNumber(value, format) {
        const regex = /^\d{3}-\d{3}-\d{4}$/;
        return regex.test(value);
    }

    isCurrency(value, format) {
        const regex = /^\d+(\.\d{2})?$/;
        return regex.test(value);
    }

    isEmptyRow(row) {
        return Object.values(row).every(value => value === null || value === '');
    }
}

export default CSVValidator;
