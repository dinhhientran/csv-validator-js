(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['moment', 'papaparse'], factory);
    } else if (typeof module === 'object' && typeof exports !== 'undefined') {
        // Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(require('moment'), require('papaparse'));
    } else {
        // Browser globals (root is window)
        root.CSVValidator = factory(root.moment, root.Papa);
    }
}(this, function (moment, Papa) {
    class CSVValidator {
        constructor(columnDefinitions, globalCustomValidators = {}, defaultInvalidMessages = {}, language = 'en', messages = {}) {
            this.columnDefinitions = columnDefinitions;
            this.expectedHeaderLength = Object.keys(columnDefinitions).length;
            this.globalCustomValidators = globalCustomValidators;
            this.defaultInvalidMessages = {
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
                number: 'Invalid number value',
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
                    ...this.defaultInvalidMessages
                },
                vi: {
                    required: 'Cần nhập giá trị ở hàng {row}, cột {column} ({header}).',
                    duplicate: 'Giá trị "{value}" bị lặp lại ở các hàng: {rows} cho cột: {column}.',
                    emptyRow: 'Hàng {row} bị trống.',
                    headerLength: 'Số lượng cột không đúng. Cần phải có {expected} cột, nhưng thấy {actual}.',
                    valid: 'Tệp CSV hợp lệ.',
                    ...this.defaultInvalidMessages
                },
                zh: {
                    required: '第 {row} 行，第 {column} 列 ({header}) 缺少必填值。',
                    duplicate: '在第 {rows} 行找到的重复值 "{value}"，列: {column}。',
                    emptyRow: '第 {row} 行为空。',
                    headerLength: '标题长度不匹配。预计 {expected} 个标题，但得到 {actual} 个。',
                    valid: 'CSV 文件有效。',
                    ...this.defaultInvalidMessages
                },
                es: {
                    required: 'Falta el valor requerido en la fila {row}, columna {column} ({header}).',
                    duplicate: 'Valor duplicado "{value}" encontrado en las filas: {rows} para la columna: {column}.',
                    emptyRow: 'La fila {row} está vacía.',
                    headerLength: 'Desajuste de longitud de encabezado. Se esperaban {expected} encabezados pero se obtuvieron {actual}.',
                    valid: 'El archivo CSV es válido.',
                    ...this.defaultInvalidMessages
                },
                fr: {
                    required: 'Valeur requise manquante à la ligne {row}, colonne {column} ({header}).',
                    duplicate: 'Valeur en double "{value}" trouvée dans les lignes : {rows} pour la colonne : {column}.',
                    emptyRow: 'La ligne {row} est vide.',
                    headerLength: 'Désaccord sur la longueur de l\'en-tête. {expected} en-têtes attendus mais {actual} obtenus.',
                    valid: 'Le fichier CSV est valide.',
                    ...this.defaultInvalidMessages
                }
            };
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

        parseAndValidateCSV(content, callback, isFile = false) {
            const parseConfig = {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    this.validateCSV(results, callback);
                }
            };

            Papa.parse(content, parseConfig);
        }

        validateCSV(data, callback) {
            let meta = data.meta,
                rows = data.data,
                errors = data.errors;

            if (errors.length > 0) {
                callback(false, errors.map((e) => `Row ${e.row + 1}: ${e.message}`));
                return;
            }

            const headerValidationResult = this.validateHeaderLength(meta.fields);
            if (!headerValidationResult.isValid) {
                callback(false, headerValidationResult.errors.map((msg) => `Row 1: ${msg}`)); // Assuming header errors belong to row 1
                return;
            }

            let rowErrors = [];
            for (let i = 0; i < rows.length; i++) {
                if (this.isEmptyRow(rows[i])) {
                    rowErrors.push(this.getMessage('emptyRow', { row: i + 1 }));
                    continue;
                }

                const rowValidationResult = this.validateRow(rows[i], i + 1, meta.fields);
                if (!rowValidationResult.isValid) {
                    rowErrors = rowErrors.concat(rowValidationResult.errors);
                }
            }

            // Check for duplicates across all columns marked with validateDuplicates
            for (let column in this.seenValues) {
                if (this.seenValues.hasOwnProperty(column)) {
                    for (let value in this.seenValues[column]) {
                        if (this.seenValues[column].hasOwnProperty(value) && this.seenValues[column][value].length > 1) {
                            let duplicateRows = this.seenValues[column][value].join(', ');
                            rowErrors.push(`Row ${duplicateRows}: ${this.getMessage('duplicate', { value, rows: duplicateRows, column })}`);
                        }
                    }
                }
            }

            if (rowErrors.length > 0) {
                callback(false, rowErrors);
            } else {
                callback(true, [this.getMessage('valid')]);
            }
        }

        validateHeaderLength(headers) {
            let isValid = true;
            let errors = [];

            if (headers.length !== this.expectedHeaderLength) {
                isValid = false;
                errors.push(this.getMessage('headerLength', { expected: this.expectedHeaderLength, actual: headers.length }));
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
                const type = definition && definition.dataType;
                const dateFormat = definition && definition.format;
                const decimalPlaces = definition && definition.decimalPlaces;
                const required = definition && definition.required;
                const validateDuplicates = definition && definition.validateDuplicates;
                const customErrors = (definition && definition.errors) || {};
                const customRequiredValidator = (definition && definition.customRequiredValidator) || this.globalCustomValidators.required;
                const customValidator = definition && definition.customValidator;

                // Check if the entire row is empty
                if (this.isEmptyRow(row)) {
                    errors.push(this.getMessage('emptyRow', { row: rowIndex }));
                    isValid = false;
                    break; // No need to check further if the entire row is empty
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

                // Check for required fields using custom validator if provided
                if (required && (customRequiredValidator ? !customRequiredValidator(value, header) : (value === undefined || value === null || value === ''))) {
                    isValid = false;
                    errors.push(`Row ${rowIndex}: ${customErrors.required || this.getMessage('required', { row: rowIndex, column: i + 1, header })}`);
                    continue; // No need to check further validation if required field is missing
                }

                // Use custom validator for this column if provided
                if (customValidator) {
                    const customValidationResult = customValidator(value);
                    if (customValidationResult !== true) {
                        isValid = false;
                        errors.push(`Row ${rowIndex}: ${customValidationResult || customErrors.invalid || this.getMessage(type, { row: rowIndex, column: i + 1, header })}`);
                    }
                } else if (!this.validateValue(value, type, dateFormat, decimalPlaces)) {
                    isValid = false;
                    errors.push(`Row ${rowIndex}: ${customErrors.invalid || this.getMessage(type, { row: rowIndex, column: i + 1, header })}`);
                }
            }

            return { isValid, errors };
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
                return this.isEmail(value);
            } else if (type === 'url') {
                return this.isURL(value);
            } else if (type === 'phoneNumber') {
                return this.isPhoneNumber(value, dateFormat);
            } else if (type === 'currency') {
                return this.isCurrency(value, dateFormat);
            } else if (type === 'number') {
                return this.isNumber(value);
            } else if (type === 'string') {
                return true; // No validation needed for string type
            }
            return false;
        }

        isInteger(value) {
            return value !== undefined && value !== null && value !== '' && !isNaN(value) && Number.isInteger(parseFloat(value));
        }

        isDecimal(value, decimalPlaces) {
            if (value === undefined || value === null || value === '' || isNaN(value)) {
                return false;
            }
            const regex = new RegExp(`^\\d+(\\.\\d{1,${decimalPlaces}})?$`);
            return regex.test(value);
        }

        isBoolean(value) {
            return value === 'true' || value === 'false';
        }

        isDate(value, dateFormat) {
            if (!dateFormat) return false;
            const date = moment(value, dateFormat, true);
            return date.isValid();
        }

        isDateTime(value, dateFormat) {
            if (!dateFormat) return false;
            const dateTime = moment(value, dateFormat, true);
            return dateTime.isValid();
        }

        isPercentage(value) {
            const regex = /^\d+(\.\d{1,3})?\s?%$/;
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

        isNumber(value) {
            return value !== undefined && value !== null && value !== '' && !isNaN(value);
        }

        isEmptyRow(row) {
            if (typeof row === 'string' && row.trim() === '') {
                return true;
            }
            if (Object.keys(row).length === 0) {
                return true;
            }
            return Object.values(row).every(value => value === null || value === undefined || value.trim() === '');
        }
    }

    return CSVValidator;
}));
