import moment from 'moment';

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

    validateCSV(data, callback) {
        let meta = data.meta,
            rows = data.data,
            errors = data.errors;

        if (errors.length > 0) {
            callback(false, errors.map(function (e) {
                return 'Row ' + (e.row + 1) + ': ' + e.message;
            }));
            return;
        }

        let headerValidationResult = this.validateHeaderLength(meta.fields);
        if (!headerValidationResult.isValid) {
            callback(false, headerValidationResult.errors);
            return;
        }

        let rowErrors = [];
        for (let i = 0; i < rows.length; i++) {
            if (this.isEmptyRow(rows[i])) {
                rowErrors.push(this.getMessage('emptyRow', { row: i + 1 }));
                continue;
            }

            let rowValidationResult = this.validateRow(rows[i], i + 1, meta.fields);
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
                        rowErrors.push(this.getMessage('duplicate', { value: value, rows: duplicateRows, column: column }));
                    }
                }
            }
        }

        if (rowErrors.length > 0) {
            callback(false, rowErrors);
        } else {
            callback(true, this.getMessage('valid'));
        }
    }

    validateHeaderLength(headers) {
        let isValid = true;
        let errors = [];

        if (headers.length !== this.expectedHeaderLength) {
            isValid = false;
            errors.push(this.getMessage('headerLength', { expected: this.expectedHeaderLength, actual: headers.length }));
        }

        return { isValid: isValid, errors: errors };
    }

    validateRow(row, rowIndex, headers) {
        let isValid = true;
        let errors = [];

        for (let i = 0; i < headers.length; i++) {
            let header = headers[i];
            let value = row[header];
            let definition = this.columnDefinitions[header];
            let type = definition && definition.dataType;
            let dateFormat = definition && definition.format;
            let decimalPlaces = definition && definition.decimalPlaces;
            let required = definition && definition.required;
            let validateDuplicates = definition && definition.validateDuplicates;
            let customErrors = (definition && definition.errors) || {};
            let customRequiredValidator = (definition && definition.customRequiredValidator) || this.globalCustomValidators.required;
            let customValidator = definition && definition.customValidator;

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
                errors.push(customErrors.required || this.getMessage('required', { row: rowIndex, column: i + 1, header: header }));
                continue; // No need to check further validation if required field is missing
            }

            // Use custom validator for this column if provided
            if (customValidator && !customValidator(value)) {
                isValid = false;
                errors.push(customErrors.invalid || this.getMessage(type, { row: rowIndex, column: i + 1, header: header }));
            } else if (!customValidator && !this.validateValue(value, type, dateFormat, decimalPlaces)) {
                isValid = false;
                errors.push(customErrors.invalid || this.getMessage(type, { row: rowIndex, column: i + 1, header: header }));
            }
        }

        return { isValid: isValid, errors: errors };
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
        return Object.values(row).every(function (value) {
            return value === null || value === '';
        });
    }
}

export default CSVValidator;
