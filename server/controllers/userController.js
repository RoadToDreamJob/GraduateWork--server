const SecondaryFunctions = require("../validations/validation");
const ErrorHandler = require("../errors/errorHandler");
const {User} = require("../models/models");
const bcrypt = require("bcrypt");

/**
 * Контроллеры пользователя.
 */
class UserController {

    //region Авторизация регистрация пользователей

    /**
     * Регистрация пользователя.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async registration(req, res, next) {
        try {
            const {
                userFio,
                userPhone,
                userEmail,
                userPassword,
                userRole
            } = req.body

            //region Валидация параметров

            if (!SecondaryFunctions.isString(userFio) || SecondaryFunctions.isEmpty(userFio))
                return next(ErrorHandler.badRequest("Некорректно указано ФИО пользователя!"))

            if (userFio.split(' ').length < 2)
                return next(ErrorHandler.badRequest("Пожалуйста, обязательно укажите фамилию и имя!"))

            if (!SecondaryFunctions.isString(userPhone) ||
                SecondaryFunctions.isEmpty(userPhone) ||
                !SecondaryFunctions.validateNumber(userPhone))
                return next(ErrorHandler.badRequest("Некорректно указан мобильный телефон!"))

            if (!SecondaryFunctions.isString(userEmail) ||
                SecondaryFunctions.isEmpty(userEmail) ||
                !SecondaryFunctions.validateEmail(userEmail))
                return next(ErrorHandler.badRequest("Некорректно указана почта!"))

            if (!SecondaryFunctions.isString(userPassword) ||
                SecondaryFunctions.isEmpty(userPassword))
                return next(ErrorHandler.badRequest("Некорректно указан пароль!"))

            if (!SecondaryFunctions.validatePassword(userPassword))
                return next(ErrorHandler.badRequest("Пароль должен содержать минимум 6 символов!"))

            const phoneCandidate = await User.findOne({where: {userPhone}})
            if (phoneCandidate)
                return next(ErrorHandler.conflict("Пользователь с таким мобильным номером уже есть в системе!"))

            const emailCandidate = await User.findOne({where: {userEmail }})
            if (emailCandidate)
                return next(ErrorHandler.conflict("Пользователь с такой почтой уже есть в системе!"))

            //endregion

            const hashPassword = await bcrypt.hash(userPassword, 5)
            const user = await User.create({
                userFio,
                userPhone,
                userEmail,
                userPassword: hashPassword,
                userRole
            })

            const token = SecondaryFunctions.generateJwt({
                id: user.id,
                fio: user.userFio,
                phone: user.userPhone,
                email: user.userEmail,
                role: user.userRole
            })

            return res.json({token})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Авторизация клиента.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async login(req, res, next) {
        try {
            const {userEmail, userPassword} = req.body

            //region Валидация параметров

            if (!SecondaryFunctions.isString(userEmail) ||
                SecondaryFunctions.isEmpty(userEmail) ||
                !SecondaryFunctions.validateEmail(userEmail))
                return next(ErrorHandler.badRequest("Некорректно указана почта!"))

            if (!SecondaryFunctions.isString(userPassword) ||
                SecondaryFunctions.isEmpty(userPassword))
                return next(ErrorHandler.badRequest("Некорректно указан пароль!"))

            if (!SecondaryFunctions.validatePassword(userPassword))
                return next(ErrorHandler.badRequest("Пароль должен содержать минимум 6 символов!"))

            const user = await User.findOne({where: {userEmail}})
            if (!user)
                return next(ErrorHandler.conflict("Пользователя с такой почтой не найдено в системе!"))
            const checkHashPassword = await bcrypt.compareSync(userPassword, user.userPassword)
            if (!checkHashPassword)
                return next(ErrorHandler.conflict("Указан неверный пароль!"))

            //endregion

            const token = SecondaryFunctions.generateJwt({
                id: user.id,
                fio: user.userFio || null,
                phone: user.userPhone || null,
                email: user.userEmail,
                role: user.userRole
            })

            return res.json({token})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Проверка авторизации пользователя..
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async check(req, res, next) {
        const token = SecondaryFunctions.generateJwt(
            req.user.id,
            req.user.name,
            req.user.email,
            req.user.role)
        return res.json({token})
    }

    //endregion

}

module.exports = new UserController()