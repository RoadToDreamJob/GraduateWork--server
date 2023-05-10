/**
 * Список кодов-состояния HTTP.
 */
class ErrorHandler extends Error {
    /**
     * Контруктор класса.
     * @param status - статус-код.
     * @param message - сообщение об ошибке.
     */
    constructor(status, message) {
        super();

        this.message = message
        this.status = status
    }

    /**
     * "Плохой запрос".
     * Сервер не понимает запрос из-за неверного синтаксиса.
     * @param message - сообщение.
     */
    static badRequest(message) {
        return new ErrorHandler(400, message);
    }

    /**
     * "Не авторизованно".
     * Для получения запрашиваемого ответа нужна аутентификация.
     * @param message - сообщение.
     */
    static unauthorized(message) {
        return new ErrorHandler(401, message);
    }

    /**
     * "Запрещено".
     * У клиента нет прав доступа к содержимому,
     * поэтому сервер отказывается дать надлежащий ответ.
     * @param message - сообщение.
     */
    static forbidden(message) {
        return new ErrorHandler(403, message);
    }


    /**
     * "Внутренняя ошибка сервера".
     * Сервер столкнулся с ошибкой,
     * которую не знает как обработать.
     * @param message - сообщение.
     */
    static internal(message) {
        return new ErrorHandler(500, message);
    }

    /**
     * Конфликт запроса с текущим состоянием сервера.
     * @param message
     */
    static conflict(message) {
        return new ErrorHandler(409, message);
    }
}

module.exports = ErrorHandler