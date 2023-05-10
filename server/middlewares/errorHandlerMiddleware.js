const ErrorHandler = require('../errors/errorHandler')

/**
 * Middleware на проверку ошибки в запросе.
 * @param error - Сама ошибка.
 * @param req - Запрос.
 * @param res - Ответ.
 * @param next - Передача управления следующему в цепочке Middleware.
 */
module.exports = function (error, req, res, next) {

    if (error instanceof ErrorHandler) {
        return res.status(error.status).json({message: error.message})
    }
    return res.status(500).json({message: "Непредвиденная ошибка. Статус: 500."})

}