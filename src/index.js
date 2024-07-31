/*!
 * CSVValidator.js
 * A robust JavaScript library for validating CSV files with custom rules and error messages.
 *
 * @version 1.1.2
 * author: Hien Tran
 * license: MIT
 *
 * This file is part of the CSV Validator library.
 *
 * For detailed documentation and usage, visit the repository:
 * https://github.com/dinhhientran/csv-validator-js
 */

import moment from 'moment';
import Papa from 'papaparse';
import { isEmail, isDecimal, isURL, isNumeric, isCurrency } from 'validator';

class CSVValidator {
    constructor({
                    columnDefinitions,
                    globalCustomValidators = {},
                    defaultInvalidMessages = {},
                    language = 'en',
                    messages = {},
                    skipEmptyLines = true,
                    validateHeaderNames = true,
                    customEmptyValueCheck = null // New parameter
                }) {
        this.columnDefinitions = columnDefinitions;
        this.expectedHeaderLength = Object.keys(columnDefinitions).length;
        this.globalCustomValidators = globalCustomValidators;
        this.defaultInvalidMessages = {
            integer: '{header} is not a valid integer value',
            decimal: '{header} is not a valid decimal value',
            boolean: '{header} is not a valid boolean value',
            date: '{header} is not a valid date value (expected formats: {format})',
            datetime: '{header} is not a valid datetime value (expected formats: {format})',
            string: '{header} is not a valid string value',
            percentage: '{header} is not a valid percentage value',
            email: '{header} is not a valid email address',
            url: '{header} is not a valid URL',
            phoneNumber: '{header} is not a valid phone number',
            currency: '{header} is not a valid currency value',
            number: '{header} is not a valid number value',
            maxLength: '{header} exceeds the maximum length of {maxLength} characters',
            ...defaultInvalidMessages
        };
        this.language = language;
        this.messages = {
            en: {
                required: 'Missing required value at row {row}, column {column} ({header}).',
                duplicate: 'Duplicate value "{value}" found in rows: {rows} for column: {column}.',
                emptyRow: 'Row {row} is empty.',
                headerLength: 'Header length mismatch. Expected {expected} headers but got {actual}.',
                valid: 'CSV file is valid.',
                invalidHeader: 'Invalid header name: {header} at column {column}.',
                ...this.defaultInvalidMessages
            },
            vi: {
                required: 'Cần nhập giá trị ở hàng {row}, cột {column} ({header}).',
                duplicate: 'Giá trị "{value}" bị lặp lại ở các hàng: {rows} cho cột: {column}.',
                emptyRow: 'Hàng {row} bị trống.',
                headerLength: 'Số lượng cột không đúng. Cần phải có {expected} cột, nhưng thấy {actual}.',
                valid: 'Tệp CSV hợp lệ.',
                invalidHeader: 'Tên tiêu đề không hợp lệ {header} ở cột {column}.',
                ...this.defaultInvalidMessages
            },
            zh: {
                required: '第 {row} 行，第 {column} 列 ({header}) 缺少必填值。',
                duplicate: '在第 {rows} 行找到的重复值 "{value}"，列: {column}。',
                emptyRow: '第 {row} 行为空。',
                headerLength: '标题长度不匹配。预计 {expected} 个标题，但得到 {actual} 个。',
                valid: 'CSV 文件有效。',
                invalidHeader: '列 {column} 的标题名称 {header} 无效。',
                ...this.defaultInvalidMessages
            },
            es: {
                required: 'Falta el valor requerido en la fila {row}, columna {column} ({header}).',
                duplicate: 'Valor duplicado "{value}" encontrado en las filas: {rows} para la columna: {column}.',
                emptyRow: 'La fila {row} está vacía.',
                headerLength: 'Desajuste de longitud de encabezado. Se esperaban {expected} encabezados pero se obtuvieron {actual}.',
                valid: 'El archivo CSV es válido.',
                invalidHeader: 'Nombre de encabezado inválido {header} en la columna {column}.',
                ...this.defaultInvalidMessages
            },
            fr: {
                required: 'Valeur requise manquante à la ligne {row}, colonne {column} ({header}).',
                duplicate: 'Valeur en double "{value}" trouvée dans les lignes : {rows} pour la colonne : {column}.',
                emptyRow: 'La ligne {row} est vide.',
                headerLength: 'Désaccord sur la longueur de l\'en-tête. {expected} en-têtes attendus mais {actual} obtenus.',
                valid: 'Le fichier CSV est valide.',
                invalidHeader: 'Nom d\'en-tête invalide {header} à la colonne {column}.',
                ...this.defaultInvalidMessages
            }
        };
        this.skipEmptyLines = skipEmptyLines;
        this.validateHeaderNames = validateHeaderNames;
        this.customEmptyValueCheck = customEmptyValueCheck; // Set the custom blank value check function
        this.seenValues = {};
    }

    getMessage(key, replacements) {
        replacements = replacements || {};
        let message = this.messages[this.language][key] || this.messages['en'][key] || key;
        for (let placeholder in replacements) {
            if (replacements.hasOwnProperty(placeholder)) {
                message = message.replace('{' + placeholder + '}', replacements[placeholder]);
            }
        }
        return message;
    }

    parseAndValidateCSVFile(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.parseAndValidateCSVString(content, callback);
        };
        reader.readAsText(file);
    }

    parseAndValidateCSVString(content, callback) {
        const parseConfig = {
            header: true,
            skipEmptyLines: this.skipEmptyLines,
            worker: true,
            complete: (results) => {
                this.validateCSV(results, callback);
            }
        };
        Papa.parse(content, parseConfig);
    }

    validateCSV(data, callback) {
        let meta = data.meta,
            rows = data.data;

        const headerValidationResult = this.validateHeaderLength(meta.fields);
        if (!headerValidationResult.isValid) {
            callback(false, headerValidationResult.errors.reduce((acc, msg) => {
                acc[0] = acc[0] || [];
                acc[0].push(msg);
                return acc;
            }, {}));
            return;
        }

        let rowErrors = {};
        for (let i = 0; i < rows.length; i++) {
            if (this.isEmptyRow(rows[i])) {
                rowErrors[i + 1] = rowErrors[i + 1] || [];
                rowErrors[i + 1].push(this.getMessage('emptyRow', { row: i + 1 }));
                continue;
            }

            const rowValidationResult = this.validateRow(rows[i], i + 1, meta.fields);
            if (!rowValidationResult.isValid) {
                rowErrors[i + 1] = rowErrors[i + 1] || [];
                rowErrors[i + 1] = rowErrors[i + 1].concat(rowValidationResult.errors);
            }
        }

        // Check for duplicates across all columns marked with validateDuplicates
        for (let column in this.seenValues) {
            if (this.seenValues.hasOwnProperty(column)) {
                for (let value in this.seenValues[column]) {
                    if (this.seenValues[column].hasOwnProperty(value) && this.seenValues[column][value].length > 1) {
                        let duplicateRows = this.seenValues[column][value].map(row => row).join(', ');
                        this.seenValues[column][value].forEach(rowIndex => {
                            rowErrors[rowIndex] = rowErrors[rowIndex] || [];
                            rowErrors[rowIndex].push(this.getMessage('duplicate', { value: value, rows: duplicateRows, column: column }));
                        });
                    }
                }
            }
        }

        if (Object.keys(rowErrors).length > 0) {
            callback(false, rowErrors);
        } else {
            callback(true, { 0: [this.getMessage('valid')] });
        }
    }

    validateHeaderLength(headers) {
        let isValid = true;
        let errors = [];

        if (headers.length !== this.expectedHeaderLength) {
            isValid = false;
            errors.push(this.getMessage('headerLength', { expected: this.expectedHeaderLength, actual: headers.length }));
        }

        if (this.validateHeaderNames) {
            headers.forEach((header, index) => {
                if (!this.columnDefinitions[header]) {
                    isValid = false;
                    errors.push(this.getMessage('invalidHeader', { header, column: index + 1 }));
                }
            });
        }

        return { isValid, errors };
    }

    validateRow(row, rowIndex, headers) {
        let isValid = true;
        let errors = [];

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const value = row[header];
            const definition = Object.values(this.columnDefinitions)[i];
            const type = definition && definition.dataType;
            const dateFormat = definition && definition.format;
            const decimalPlaces = definition && definition.decimalPlaces;
            const required = definition && definition.required;
            const validateDuplicates = definition && definition.validateDuplicates;
            const customErrors = (definition && definition.errors) || {};
            const customRequiredValidator = (definition && definition.customRequiredValidator) || this.globalCustomValidators.required;
            const customValidator = definition && definition.customValidator;
            const maxLength = definition && definition.maxLength;

            // Check if value is blank
            if (this.isBlankValue(value)) {
                if (required) {
                    isValid = false;
                    errors.push(customErrors.required || this.getMessage('required', { row: rowIndex, column: i + 1, header }));
                }
                continue; // Skip further validation if value is blank
            }

            // Check for max length if it's a string
            if (type === 'string' && maxLength && value.length > maxLength) {
                isValid = false;
                errors.push(customErrors.invalid || this.getMessage('maxLength', { header, maxLength }));
            }

            // Track duplicates if validation is enabled for this column
            if (validateDuplicates) {
                if (!this.seenValues[header]) {
                    this.seenValues[header] = {};
                }
                if (!this.seenValues[header][value]) {
                    this.seenValues[header][value] = [];
                }
                this.seenValues[header][value].push(rowIndex);
            }

            // Use custom validator for this column if provided
            if (customValidator && !customValidator(value)) {
                isValid = false;
                errors.push(customErrors.invalid || this.getMessage(type, { row: rowIndex, column: i + 1, header }));
            } else if (!customValidator && !this.validateValue(value, type, dateFormat, decimalPlaces)) {
                isValid = false;
                errors.push(customErrors.invalid || this.getMessage(type, { row: rowIndex, column: i + 1, header, format: Array.isArray(dateFormat) ? dateFormat.join(', ') : dateFormat }));
            }
        }

        return { isValid, errors };
    }

    isBlankValue(value) {
        if (this.customEmptyValueCheck) {
            return this.customEmptyValueCheck(value);
        }
        return value === undefined || value === null || value.trim() === '';
    }

    validateValue(value, type, dateFormat, decimalPlaces) {
        if (this.globalCustomValidators[type]) {
            return this.globalCustomValidators[type](value, dateFormat, decimalPlaces);
        }

        if (type === 'integer') {
            return this.isInteger(value);
        } else if (type === 'decimal') {
            return this.isDecimal(value, decimalPlaces);
        } else if (type === 'boolean') {
            return this.isBoolean(value);
        } else if (type === 'date') {
            return this.isDate(value, dateFormat);
        } else if (type === 'datetime') {
            return this.isDateTime(value, dateFormat);
        } else if (type === 'percentage') {
            return this.isPercentage(value);
        } else if (type === 'email') {
            return isEmail(value);
        } else if (type === 'url') {
            return this.isURL(value);
        } else if (type === 'phoneNumber') {
            return this.isPhoneNumber(value, dateFormat);
        } else if (type === 'currency') {
            return this.isCurrency(value, dateFormat);
        } else if (type === 'number') {
            return this.isNumeric(value);
        } else if (type === 'string') {
            return true; // No validation needed for string type
        }
        return false;
    }

    isInteger(value) {
        if (value === undefined || value === null || value === '' || isNaN(value)) {
            return false;
        }

        // Remove commas and trim spaces
        value = value.replace(/,/g, '').trim();

        // Check if the value is an integer and does not contain any decimal point
        return Number.isInteger(parseFloat(value)) && value.indexOf('.') === -1;
    }

    isBoolean(value) {
        if (value === undefined || value === null || value === '') {
            return false;
        }

        // Normalize the value to lower case for comparison
        value = value.trim().toLowerCase();

        return value === 'true' || value === 'false';
    }

    isDate(value, dateFormats) {
        if (!value) return false;

        if (!dateFormats) {
            // Popular date formats
            dateFormats = [
                'MM/DD/YYYY',
                'DD/MM/YYYY',
                'YYYY-MM-DD',
                'MM-DD-YYYY',
                'DD-MM-YYYY',
                'YYYY/MM/DD',
                'M/D/YYYY',
                'D/M/YYYY',
                'YYYYMMDD'
            ];
        }

        if (!Array.isArray(dateFormats)) {
            dateFormats = [dateFormats];
        }

        return dateFormats.some(format => moment(value, format, true).isValid());
    }

    isDateTime(value, dateFormats) {
        if (!value) return false;

        if (!dateFormats) {
            // Popular datetime formats
            dateFormats = [
                'MM/DD/YYYY HH:mm:ss',
                'DD/MM/YYYY HH:mm:ss',
                'YYYY-MM-DD HH:mm:ss',
                'MM-DD-YYYY HH:mm:ss',
                'DD-MM-YYYY HH:mm:ss',
                'YYYY/MM/DD HH:mm:ss',
                'M/D/YYYY H:m:s',
                'D/M/YYYY H:m:s',
                'YYYYMMDD HHmmss',
                'YYYY-MM-DDTHH:mm:ss' // ISO 8601 format
            ];
        }

        if (!Array.isArray(dateFormats)) {
            dateFormats = [dateFormats];
        }

        return dateFormats.some(format => moment(value, format, true).isValid());
    }

    isPercentage(value) {
        const regex = /^\d+(\.\d{1,3})?\s?%$/;
        return regex.test(value);
    }

    isURL(value) {
        return typeof value === 'string' && isURL(value);
    }

    isNumeric(value) {
        if (typeof value !== 'string') {
            return false;
        }

        if (value == null || value == undefined || value.trim() == '') {
            return false;
        }

        value = value.trim();

        // Validate the placement of thousand separators using regex
        const thousandSeparatorRegex = /^-?\d{1,3}(,\d{3})*(\.\d+)?$/;
        if (!thousandSeparatorRegex.test(value)) {
            // Also allow numbers without thousand separators
            const noSeparatorRegex = /^-?\d+(\.\d+)?$/;
            if (!noSeparatorRegex.test(value)) {
                return false;
            }
        }

        // Remove commas from the value
        const normalizedValue = value.replace(/,/g, '');

        // Use the isNumeric function from the validator library
        return isNumeric(normalizedValue);
    }

    isDecimal(value, decimalPlaces = null, allowThousandSeparator = false) {
        if (value == null || value == undefined || value.trim() == '') {
            return false;
        }

        value = value.trim();

        if (allowThousandSeparator) {
            value = value.replace(/,/g, '');
        }

        if (decimalPlaces != null && decimalPlaces != undefined) {
            return isDecimal(value, {force_decimal: true, decimal_digits: decimalPlaces});
        } else {
            return isDecimal(value);
        }
    }

    isPhoneNumber(value, format = null) {
        if (typeof value !== 'string') return false;

        // If a specific format is provided, validate against that format
        if (format) {
            const regex = new RegExp(`^${format.replace(/X/g, '\\d').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\-/g, '\\-').replace(/\s/g, '\\s').replace(/\./g, '\\.')}$`);
            return regex.test(value);
        }

        // Comprehensive regex to match popular phone number formats
        const regex = /^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?[\d-.\s]{7,10}$/;
        return regex.test(value);
    }

    isCurrency(value, options = {}) {
        if (typeof value !== 'string') return false;

        // Default options for currency validation
        const defaultOptions = {
            symbol: '$',
            require_symbol: false,
            allow_space_after_symbol: false,
            symbol_after_digits: false,
            allow_negatives: true,
            parens_for_negatives: false,
            negative_sign_before_digits: false,
            negative_sign_after_digits: false,
            allow_negative_sign_placeholder: false,
            thousands_separator: ',',
            decimal_separator: '.',
            allow_decimal: true,
            require_decimal: false,
            digits_after_decimal: [2],
            allow_space_after_digits: false
        };

        // Merge user options with default options
        const mergedOptions = { ...defaultOptions, ...options };

        return isCurrency(value, mergedOptions);
    }

    isEmptyRow(row) {
        return Object.values(row).every(value => this.isBlankValue(value));
    }
}

export default CSVValidator;
