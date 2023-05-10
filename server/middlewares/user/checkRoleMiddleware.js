const jwt = require('jsonwebtoken')
const ErrorHandler = require("../../errors/errorHandler");


/**
 * Middleware на проверку соответствия роли тому или иному пользователю.
 * @param role - Роль пользователя.
 */
module.exports = function(role) {
    return function (req, res, next) {
        if (req.method === "OPTIONS")
            next()

        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token)
                return next(ErrorHandler.unauthorized('Данный пользователь не авторизован!'))

            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            if (decoded.role !== role) {
                return next(ErrorHandler.forbidden('У Вас нет прав использовать эту функцию!'))
            }

            req.user = decoded;
            next()
        } catch {
            return next(ErrorHandler.unauthorized('Данный пользователь не авторизован!'))
        }
    };
}