const jwt = require('jsonwebtoken')

/**
 * Вспомогательные функции.
 */
class SecondaryFunctions {

    //region Валидация параметров.

    /**
     * Проверять, является ли переменная "value" строкой.
     * @param value - параметр для проверки.
     * @returns {boolean} - true - строка / false - не строка.
     */
    static isString(value) {
        return ((typeof (value) === "string") ||
            (value instanceof String))
    }

    /**
     * Проверять, является ли переменная "value" пустой.
     * @param value - параметр для проверки.
     * @returns {boolean} - true - пустая / false - не пустая.
     */
    static isEmpty(value) {
        return value.trim() === ''
    }

    /**
     * Проверить, является ли объект пустым.
     * @param value - параметр для проверки.
     * @returns {boolean} - true - пустой, false - не пустой.
     */
    static isEmptyObject(value) {
        return !Object.keys(value).length
    }

    /**
     * Проверять, является ли переменная "value" числом.
     * @param value - параметр для проверки.
     * @returns {boolean} - true - число / false - не число.
     */
    static isNumber(value) {
        return (!isNaN(value))
    }

    /**
     * Проверять, является ли переменная "value" датой.
     * @param value - параметр для проверки.
     * @returns {boolean} - true - дата / false - не дата.
     */
    static isDate(value) {
        const date = new Date(value)
        return date instanceof Date &&
               !isNaN(date) &&
               date.toISOString().slice(0, 10) === value
    }

    /**
     * Проверять, является ли переменная "timeValue" временем.
     * @param timeValue - параметр для проверки времени.
     * @returns {boolean} - true - время / false - не время.
     */
    static isTime(timeValue) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        return timeRegex.test(timeValue);
    }


    //endregion

    //region Генерация токенов доступа к аккаунту.

    /**
     * Генерация JWT-токена.
     * @param id - Идентификатор.
     * @param fio - ФИО пользователя.
     * @param phone - Номер пользователя.
     * @param email - Почта пользователя.
     * @param role - Роль пользователя.
     * @returns {*} - jwt-токен.
     */
    static generateJwt = ({ id, fio = null, phone = null, email, role }) => {
        const payload = { id, email, role };
        if (fio !== null)
            payload.fio = fio;
        if (phone !== null)
            payload.phone = phone;

        return jwt.sign(
            payload,
            process.env.SECRET_KEY,
            {
                expiresIn: '24h'
            }
        );
    };

    //endregion

    //region Валидация данных пользователя.

    /**
     * Валидация почты. (a@a.a - не сработает).
     * @param email - почта.
     * @returns {boolean} - true - почта валидна / false - почта не валидна.
     */
    static validateEmail(email) {
        const regex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu
        return regex.test(email)
    }

    /**
     * Валидация пароля.
     * Длина пароля должна содержать больше 6 символов.
     * @param password - Пароль пользователя.
     * @returns {boolean} - true - пароль валиден / false - пароль не валиден.
     */
    static validatePassword(password) {
        return password.length >= 6
    }

    /**
     * Валидация телефона.
     * @param number - Телефон пользователя.
     * @returns {boolean} - true - телефон валиден / false - телефон не валиден.
     * */
    static validateNumber(number) {
        const regex = /^((\+7|7|8)+([0-9]){10})$|^((\+7|7|8)+(\s|\()([0-9]){3}(\s|\))([0-9]){3}(\s|-)?([0-9]){2}(\s|-)?([0-9]){2})$/
        return regex.test(number)
    }

    //endregion

}

module.exports = SecondaryFunctions