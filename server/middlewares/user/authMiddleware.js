const ErrorHandler = require("../../errors/errorHandler");
const jwt = require("jsonwebtoken");

/**
 * Middleware на проверку авторизирован ли пользователь или нет.
 * @param req - запрос.
 * @param res - ответ.
 * @param next - Передача управления следующему в цепочке Middleware.
 */
module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1]

        if (!token)
            return next(ErrorHandler.unauthorized('Данный пользователь не авторизован!'))

        req.user = jwt.verify(token, process.env.SECRET_KEY)
        next()
    } catch (e) {
        return next(ErrorHandler.unauthorized('Данный пользователь не авторизован!'))
    }
}