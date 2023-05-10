const ErrorHandler = require("../errors/errorHandler");
const SecondaryFunctions = require("../validations/validation");
const {ServicesCategories, Services, Post, User, Doctor} = require("../models/models");
const bcrypt = require("bcrypt");

/**
 * Контроллер для администратора.
 */
class AdminController {

    //region CRUD операции с категориями услуг.

    /**
     * Добавление категории.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async createCategory(req, res, next) {
        try {
            const {categoryName} = req.body

            if (!SecondaryFunctions.isString(categoryName) || SecondaryFunctions.isEmpty(categoryName))
                return next(ErrorHandler.badRequest("Некорректно указано название категории услуги!"))

            const candidate = await ServicesCategories.findOne({where: {categoryName}})
            if (candidate)
                return next(ErrorHandler.conflict("Данная категория уже имеется в системе!"))

            const category = await ServicesCategories.create({categoryName})
            return res.json({category})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение всех категорий.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getAllCategories(req, res, next) {
        try {
            const category = await ServicesCategories.findAll()
            return res.json({category})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение одной категории.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getOneCategory(req, res, next) {
        const {id} = req.params

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор категории!"))

        await ServicesCategories.findOne({where: {id}})
            .then((category) => {
                if (!category)
                    return next(ErrorHandler.badRequest(`Категория с идентификтаором ${id} не найдено!`))
                return res.json({category})
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Обновление категории.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async updateCategory(req, res, next) {
        const {id} = req.params
        const {categoryName} = req.body

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор категории!"))

        if (categoryName &&
            (!SecondaryFunctions.isString(categoryName) || SecondaryFunctions.isEmpty(categoryName)))
            return next(ErrorHandler.badRequest("Некорректно указано название категории!"))


        await ServicesCategories.findOne({where: {id}})
            .then(async (category) => {
                if (category) {
                    if (!SecondaryFunctions.isString(categoryName) || SecondaryFunctions.isEmpty(categoryName))
                        return next(ErrorHandler.badRequest("Некорректно указано название категории услуги!"))

                    if (categoryName === category.categoryName)
                        return res.json({category})

                    const candidate = await ServicesCategories.findOne({where: {categoryName}})
                    if (candidate)
                        return next(ErrorHandler.conflict("Данная категория уже имеется в системе!"))

                    const newCategoryName = await category.update({
                        categoryName: categoryName || category.categoryName
                    })
                    return res.json({newCategoryName})
                } else {
                    return next(ErrorHandler.badRequest(`Категория с идентификтаором ${id} не найдено!`))
                }
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Удаление категории.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async deleteOneCategory(req, res, next) {
        const {id} = req.params
        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор категории!"))

        await ServicesCategories.findOne({id})
            .then(async (category) => {
                if (category) {
                    await category.destroy()
                    return res.json({message: "Успешное удаление категории!"})
                } else {
                    return next(ErrorHandler.badRequest(`Категория с идентификтаором ${id} не найдена!`))
                }
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    //endregion

    //region CRUD операции с услугами.

    /**
     * Создание услуги.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async createService(req, res, next) {
        try {
            const {
                serviceName,
                servicesPrice,
                servicesDescription,
                servicesCategoryId
            } = req.body

            if (!SecondaryFunctions.isString(serviceName) || SecondaryFunctions.isEmpty(serviceName))
                return next(ErrorHandler.badRequest("Некорректно указано название услуги!"))

            if (!SecondaryFunctions.isNumber(servicesPrice) || SecondaryFunctions.isEmpty(servicesPrice.toString()))
                return next(ErrorHandler.badRequest("Некорректно указана цена услуги!"))

            if (servicesDescription &&
                (!SecondaryFunctions.isString(servicesDescription) || SecondaryFunctions.isEmpty(servicesDescription)))
                return next(ErrorHandler.badRequest("Некорректно указано описание услуги!"))

            if (!SecondaryFunctions.isNumber(servicesCategoryId) || SecondaryFunctions.isEmpty(servicesCategoryId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор категории услуги!"))

            await ServicesCategories.findOne({where: {id: servicesCategoryId}})
                .then((category) => {
                    if (!category) {
                        return next(ErrorHandler.badRequest(`Категория с идентификтаором ${servicesCategoryId} не найдена!`))
                    }
                })

            const candidate = await Services.findOne({where: {serviceName}})
            if (candidate)
                return next(ErrorHandler.conflict("Данная услуга уже существует в нашей системе!"))

            const service = await Services.create({
                serviceName,
                servicesPrice,
                servicesDescription,
                servicesCategoryId
            })

            return res.json({service})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение всех услуг.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getAllServices(req, res, next) {
        try {
            const services = await Services.findAll()
            return res.json({services})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение одной услуги.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getOneService(req, res, next) {
        const {id} = req.params

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString(id)))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор услуги!"))

        await Services.findOne({where: {id}})
            .then((service) => {
                if (!service)
                    return next(ErrorHandler.badRequest(`Услуга с идентификатором ${id} не найдена!`))

                return res.json({service})
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Обновление услуги.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async updateService(req, res, next) {
        const {id} = req.params
        const {
            serviceName,
            servicesPrice,
            servicesDescription,
            servicesCategoryId
        } = req.body

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString(id)))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор услуги!"))

        if (serviceName &&
            (!SecondaryFunctions.isString(serviceName) || SecondaryFunctions.isEmpty(serviceName)))
            return next(ErrorHandler.badRequest("Некорректно указано название услуги!"))

        if (servicesPrice &&
            (!SecondaryFunctions.isNumber(servicesPrice) || SecondaryFunctions.isEmpty(servicesPrice.toString())))
            return next(ErrorHandler.badRequest("Некорректно указана цена услуги!"))

        if (servicesDescription &&
            (!SecondaryFunctions.isString(servicesDescription) || SecondaryFunctions.isEmpty(servicesDescription)))
            return next(ErrorHandler.badRequest("Некорректно указано описание услуги!"))

        if (servicesCategoryId &&
            (!SecondaryFunctions.isNumber(servicesCategoryId) || SecondaryFunctions.isEmpty(servicesCategoryId.toString())))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор категории услуги!"))

        await Services.findOne({where: {id}})
            .then(async (service) => {
                if (!service) {
                    return next(ErrorHandler.badRequest(`Услуга с идентификатором ${id} не найдена!`))
                }

                if (serviceName === service.serviceName &&
                    servicesPrice === service.servicesPrice &&
                    servicesDescription === service.servicesDescription &&
                    servicesCategoryId === service.servicesCategoryId) {
                    return res.json({service})
                }

                if (serviceName !== service.serviceName) {
                    const candidate = await Services.findOne({where: {serviceName}})
                    if (candidate) {
                        return next(ErrorHandler.conflict("Данная услуга уже существует в системе!"))
                    }
                }

                await ServicesCategories.findOne({where: {id: servicesCategoryId}})
                    .then((category) => {
                        if (!category)
                            return next(ErrorHandler.badRequest(`Категории с идентификатором ${servicesCategoryId} не найдено!`))
                    })

                const newService = await service.update({
                    serviceName: serviceName || service.serviceName,
                    servicesPrice: servicesPrice || service.servicesPrice,
                    servicesDescription: servicesDescription || service.servicesDescription,
                    servicesCategoryId: servicesCategoryId || service.servicesCategoryId
                })

                return res.json({newService})
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Удаление услуги.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async deleteOneService(req, res, next) {
        const {id} = req.params
        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString(id)))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор услуги!"))

        await Services.findOne({where: {id}})
            .then(async (service) => {
                if (service) {
                    await service.destroy()
                    return res.json({message: "Успешное удаление услуги!"})
                } else {
                    return next(ErrorHandler.badRequest(`Услуги с идентификатором ${id} не найдено!`))
                }
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    //endregion

    //region CRUD операции с ветеринарами.

    /**
     * Добавление ветеринара.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async createDoctor(req, res, next) {
        try {
            const {
                userFio,
                userPhone,
                userEmail,
                userPassword,
                userRole = 'DOCTOR',
                experienceValue,
                postId
            } = req.body

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

            const emailCandidate = await User.findOne({where: {userEmail}})
            if (emailCandidate)
                return next(ErrorHandler.conflict("Пользователь с такой почтой уже есть в системе!"))

            const postCandidate = await Post.findOne({where: {id: postId}})
            if (!postCandidate)
                return next(ErrorHandler.badRequest(`Должности с идентификатором ${postId} не найдено!`))

            const hashPassword = await bcrypt.hash(userPassword, 5)
            const user = await User.create({
                userFio,
                userPhone,
                userEmail,
                userPassword: hashPassword,
                userRole,
            })

            if (!SecondaryFunctions.isNumber(experienceValue) || SecondaryFunctions.isEmpty(experienceValue.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан опыт врача!"))

            if (!SecondaryFunctions.isNumber(postId) || SecondaryFunctions.isEmpty(postId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор должности ветеринара!"))


            await Doctor.create({
                experienceValue,
                postId,
                userId: user.id
            })

            const newDoctor = await User.findOne({
                where: {id: user.id},
                include: [
                    {
                        model: Doctor,
                        where: {userId: user.id}
                    }
                ]
            })

            return res.json({newDoctor})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение всех ветеринаров.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getAllDoctors(req, res, next) {
        try {
            const doctors = await User.findAll({
                where: {userRole: 'DOCTOR'},
                include: [
                    {
                        model: Doctor
                    }
                ]
            })
            return res.json({doctors})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение одного ветеринара.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getOneDoctor(req, res, next) {
        const {id} = req.params

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор ветеринара!"))

        await User.findOne({where: {id}})
            .then(async (user) => {
                if (!user)
                    return next(ErrorHandler.badRequest(`Ветеринара с идентификатором ${id} не найдено!`))
                if (user.userRole !== 'DOCTOR')
                    return next(ErrorHandler.badRequest(`Ветеринара с идентификатором ${id} не найдено!`))

                const doctor = await User.findOne({
                    where: {id},
                    include: {
                        model: Doctor,
                        where: {userId: id}
                    }
                })
                return res.json({doctor})
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Обновление ветеринара.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async updateDoctor(req, res, next) {
        const {id} = req.params;
        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор ветеринара!"))

        const {
            userFio,
            userPhone,
            userEmail,
            userPassword,
            userRole = 'DOCTOR',
            experienceValue,
            postId,
        } = req.body

        if (userFio &&
            (!SecondaryFunctions.isString(userFio) || SecondaryFunctions.isEmpty(userFio)))
            return next(ErrorHandler.badRequest("Некорректно указано ФИО пользователя!"))

        if (userFio && userFio.split(' ').length < 2)
            return next(ErrorHandler.badRequest("Пожалуйста, обязательно укажите фамилию и имя!"))

        if (userPhone &&
            (!SecondaryFunctions.isString(userPhone) ||
                SecondaryFunctions.isEmpty(userPhone) ||
                !SecondaryFunctions.validateNumber(userPhone)))
            return next(ErrorHandler.badRequest("Некорректно указан мобильный телефон!"))

        if (userEmail &&
            (!SecondaryFunctions.isString(userEmail) ||
                SecondaryFunctions.isEmpty(userEmail) ||
                !SecondaryFunctions.validateEmail(userEmail)))
            return next(ErrorHandler.badRequest("Некорректно указана почта!"))

        if (userPassword &&
            (!SecondaryFunctions.isString(userPassword) ||
                SecondaryFunctions.isEmpty(userPassword)))
            return next(ErrorHandler.badRequest("Некорректно указан пароль!"))

        if (userPassword &&
            (!SecondaryFunctions.validatePassword(userPassword)))
            return next(ErrorHandler.badRequest("Пароль должен содержать минимум 6 символов!"))

        if (experienceValue &&
            (!SecondaryFunctions.isNumber(experienceValue) || SecondaryFunctions.isEmpty(experienceValue.toString())))
            return next(ErrorHandler.badRequest("Некорректно указан опыт врача!"))

        if (postId &&
            (!SecondaryFunctions.isNumber(postId) || SecondaryFunctions.isEmpty(postId.toString())))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор должности ветеринара!"))

        await User.findOne({where: {id}})
            .then(async (user) => {
                if (!user || (user && user.userRole !== 'DOCTOR'))
                    return next(ErrorHandler.badRequest(`Ветеринара с идентификатором ${id} не найдено!`))

                if (userFio === user.userFio &&
                    userPhone === user.userPhone &&
                    userEmail === user.userEmail &&
                    (await bcrypt.compareSync(userPassword, user.userPassword)) &&
                    user.doctor &&
                    (experienceValue === user.doctor.experienceValue &&
                        postId === user.doctor.postId)) {
                    return res.json({user})
                }

                if (userEmail !== user.userEmail) {
                    const candidate = await User.findOne({where: {userEmail}})
                    if (candidate)
                        return next(ErrorHandler.conflict("Пользователь с такой почтой уже существует в системе!"))
                }

                if (userPhone !== user.userPhone) {
                    const candidate = await User.findOne({where: {userPhone}})
                    if (candidate)
                        return next(ErrorHandler.conflict("Пользователь с таким телефоном уже существует в системе!"))
                }

                await Post.findOne({where: {id: postId}})
                    .then((post) => {
                        if (!post)
                            return next(ErrorHandler.badRequest(`Должности с идентификатором ${postId} не найдено!`))
                    })

                await user.update({
                    userFio: userFio || user.userFio,
                    userPhone: userPhone || user.userPhone,
                    userEmail: userEmail || user.userEmail,
                    userRole: userRole,
                    userPassword: userPassword ? await bcrypt.hash(userPassword, 5) : user.userPassword,
                })

                await Doctor.update({
                    experienceValue: experienceValue || user.doctor.experienceValue,
                    postId: postId || user.doctor.postId
                }, {
                    where: {userId: user.id}
                })

                const doctor = await User.findOne({
                    where: {id},
                    include: {
                        model: Doctor,
                        where: {userId: id}
                    }
                })
                return res.json({doctor})
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Удаление ветеринара.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async deleteOneDoctor(req, res, next) {
        const {id} = req.params
        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString(id)))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор услуги!"))

        await User.findOne({where: {id}})
            .then(async (user) => {
                if (user && user.userRole === 'DOCTOR') {
                    await Doctor.findOne({where: {userId: user.id}})
                        .then(async (doctor) => {
                            await doctor.destroy()
                        })
                    await user.destroy()

                    return res.json({message: "Успешное удаление ветеринара!"})
                } else {
                    return next(ErrorHandler.badRequest(`Ветеринара с идентификатором ${id} не найдено!`))
                }
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    //endregion

    //region CRUD с должностями ветеринаров.

    /**
     * Добавление категории.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async createPost(req, res, next) {
        try {
            const {postName} = req.body

            if (!SecondaryFunctions.isString(postName) || SecondaryFunctions.isEmpty(postName))
                return next(ErrorHandler.badRequest("Некорректно указано название должности ветеринара!"))

            const candidate = await Post.findOne({where: {postName}})
            if (candidate)
                return next(ErrorHandler.conflict("Данная должность уже имеется в системе!"))

            const post = await Post.create({postName})
            return res.json({post})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение всех должностей.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getAllPost(req, res, next) {
        try {
            const post = await Post.findAll()
            return res.json({post})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение одной должности.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getOnePost(req, res, next) {
        const {id} = req.params

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор должности!"))

        await Post.findOne({where: {id}})
            .then((post) => {
                if (!post)
                    return next(ErrorHandler.badRequest(`Должности с идентификтаором ${id} не найдено!`))
                return res.json({post})
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Обновление должности.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async updatePost(req, res, next) {
        const {id} = req.params
        const {postName} = req.body

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор категории!"))

        if (postName &&
            (!SecondaryFunctions.isString(postName) || SecondaryFunctions.isEmpty(postName)))
            return next(ErrorHandler.badRequest("Некорректно указано название должности!"))


        await Post.findOne({where: {id}})
            .then(async (post) => {
                if (post) {

                    if (postName === post.postName)
                        return res.json({post})

                    const candidate = await Post.findOne({where: {postName}})
                    if (candidate)
                        return next(ErrorHandler.conflict("Данная должность уже имеется в системе!"))

                    const newPost = await post.update({
                        postName: postName || post.postName
                    })
                    return res.json({newPost})
                } else {
                    return next(ErrorHandler.badRequest(`Должности с идентификтаором ${id} не найдено!`))
                }
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Удаление должности.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async deleteOnePost(req, res, next) {
        const {id} = req.params
        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор категории!"))

        await Post.findOne({id})
            .then(async (post) => {
                if (post) {
                    await post.destroy()
                    return res.json({message: "Успешное удаление должности!"})
                } else {
                    return next(ErrorHandler.badRequest(`Должность с идентификтаором ${id} не найдена!`))
                }
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    //endregion

}

module.exports = new AdminController()