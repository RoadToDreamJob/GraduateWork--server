const {
    User,
    Doctor,
    Services,
    ClientRequest,
    ServicesRequest,
    ClientPet,
    Appointment
} = require("../models/models");
const ErrorHandler = require("../errors/errorHandler");
const SecondaryFunctions = require("../validations/validation");
const uuid = require("uuid")
const path = require("path");

class ClientController {

    //region Просмотр услуг.

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

    //endregion

    //region Просмотр врачей.

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

    //endregion

    //region Оформление заявки.

    /**
     * Создание заявки.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async createRequest(req, res, next) {
        try {
            const {
                clientId,
                requestDate = Date.now(),
                requestDescription,
                statusId = 1,
                clientPetId,
                serviceId,
            } = req.body

            if (!SecondaryFunctions.isNumber(clientId) || SecondaryFunctions.isEmpty(clientId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор клиента!"))

            if (requestDescription &&
                (!SecondaryFunctions.isString(requestDescription) || SecondaryFunctions.isEmpty(requestDescription)))
                return next(ErrorHandler.badRequest("Некорректно указано описание заявки!"))

            const user = await User.findOne({where: {id: clientId}})
            if (!user || user.userRole !== 'USER')
                return next(ErrorHandler.badRequest(`Клиента с идентификатором ${clientId} не найдено!`))

            const pet = await ClientPet.findOne({where: {id: clientPetId}})
            if (!pet)
                return next(ErrorHandler.badRequest(`Питомца с идентификатором ${clientPetId} не найдено!`))

            if (+pet.userId !== +clientId)
                return next(ErrorHandler.badRequest(`Питомец с идентификатором ${clientPetId} не Ваш!`))

            const request = await ClientRequest.create({
                userId: clientId,
                clientPetId,
                requestDate,
                requestDescription,
                statusId
            })
            let serviceRequest = []

            if (Array.isArray(serviceId) && serviceId.length > 1) {
                for (const service of serviceId) {
                    const services = await Services.findOne({where: {id: service}})
                    if (!services)
                        return next(ErrorHandler.badRequest(`Услуги с идентификатором ${service} не найдено!`))

                    serviceRequest.push({
                        clientRequestId: request.id,
                        serviceId: service
                    })
                }

                await ServicesRequest.bulkCreate(serviceRequest);
            } else if (Array.isArray(serviceId) && serviceId.length === 1) {
                for (const service of serviceId) {
                    const services = await Services.findOne({where: {id: service}})
                    if (!services)
                        return next(ErrorHandler.badRequest(`Услуги с идентификатором ${service} не найдено!`))

                    const serviceRequest = {
                        clientRequestId: request.id,
                        serviceId: serviceId
                    };

                    await ServicesRequest.create(serviceRequest);
                }
            } else if (serviceId && !Array.isArray(serviceId)) {
                const services = await Services.findOne({where: {id: serviceId}})
                if (!services)
                    return next(ErrorHandler.badRequest(`Услуги с идентификатором ${serviceId} не найдено!`))

                await ServicesRequest.create({
                    clientRequestId: request.id,
                    serviceId: serviceId
                });
            } else {
                return next(ErrorHandler.badRequest('Пожалуйста, выберите хотя-бы одну услугу!'))
            }

            const fullRequest = await ClientRequest.findOne({
                where: {id: request.id},
                include: [
                    {
                        model: ServicesRequest,
                        include: [
                            {
                                model: Services,
                            },
                        ],
                    },
                    {
                        model: ClientPet,
                        where: {id: clientPetId}
                    }
                ],
            })

            return res.json({fullRequest})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    //endregion

    //region Просмотр заявок.

    /**
     * Получение всех заявкок.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getAllRequests(req, res, next) {
        try {
            const {userId} = req.body;

            if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор клиента!"))


            const user = await User.findOne({where: {id: userId}})
            if (!user || user.userRole !== 'USER')
                return next(ErrorHandler.badRequest(`Клиента с идентификатором ${userId} не найдено!`))

            const requests = await ClientRequest.findAll({
                where: {userId},
                include: [
                    {
                        model: Services,
                        through: {
                            model: ServicesRequest,
                        },
                    },
                    {
                        model: ClientPet,
                    },
                ],
            });

            return res.json({requests});
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение одной заявки.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getOneRequest(req, res, next) {
        try {
            const {id} = req.params
            const {userId} = req.body;

            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор заявки!"))

            if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор клиента!"))

            const user = await User.findOne({where: {id: userId}})
            if (!user || user.userRole !== 'USER')
                return next(ErrorHandler.badRequest(`Клиента с идентификатором ${userId} не найдено!`))

            const request = await ClientRequest.findOne({
                where: {id, userId},
                include: [
                    {
                        model: Services,
                        through: {
                            model: ServicesRequest,
                        },
                    },
                    {
                        model: ClientPet,
                    },
                ],
            });

            if (!request)
                return next(ErrorHandler.badRequest("Данной заявки не найдено!"))

            return res.json({request})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

//endregion

    //region Питомцы.

    /**
     * Создание питомца.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async createPet(req, res, next) {
        try {
            const {
                petName,
                petBreed,
                petAge,
                petSex,
                petWeight,
                userId
            } = req.body

            if (!SecondaryFunctions.isString(petName) || SecondaryFunctions.isEmpty(petName))
                return next(ErrorHandler.badRequest("Некорректно указано имя питомца!"))

            if (!SecondaryFunctions.isString(petBreed) || SecondaryFunctions.isEmpty(petBreed))
                return next(ErrorHandler.badRequest("Некорректно указана порода питомца!"))

            if (!SecondaryFunctions.isNumber(petAge) || SecondaryFunctions.isEmpty(petAge.toString()) || petAge <= 0)
                return next(ErrorHandler.badRequest("Некорректно указан возраст питомца!"))

            if (!SecondaryFunctions.isString(petSex.toString()) || SecondaryFunctions.isEmpty(petSex.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан пол питомца!"))

            if (petSex !== 'М' && petSex !== 'Ж')
                return next(ErrorHandler.badRequest("Пожалуйста, введите корректный пол.\n" +
                    "1) М - мужской; \n" +
                    "2) Ж - женский!"))

            if (!SecondaryFunctions.isNumber(petWeight) || SecondaryFunctions.isEmpty(petWeight.toString()) || petWeight <= 0)
                return next(ErrorHandler.badRequest("Некорректно указан вес питомца!"))

            if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор хозяина питомца!"))

            const user = await User.findOne({where: {id: userId}})
            if (!user || user.userRole !== 'USER')
                return next(ErrorHandler.badRequest(`Клиент с идентификатором ${userId} не найден!`))

            const {petImage} = req.files
            if (!petImage)
                return next(ErrorHandler.badRequest("Пожалуйста, выберите изображение питомца!"))

            let fileName = uuid.v4() + ".jpg"
            await petImage.mv(path.resolve(__dirname, '..', 'static', fileName))
            const pet = await ClientPet.create({
                petName,
                petBreed,
                petImage: fileName,
                petAge,
                petSex,
                petWeight,
                userId
            })

            return res.json({pet})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение всех питомцев.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getAllPet(req, res, next) {
        try {
            const {userId} = req.body

            if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор хозяина питомца!"))

            const user = await User.findOne({where: {id: userId}})
            if (!user || user.userRole !== 'USER')
                return next(ErrorHandler.badRequest(`Клиент с идентификатором ${userId} не найден!`))

            const pets = await ClientPet.findAll({where: {userId: userId}})
            return res.json({pets})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение одного питомцца.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getOnePet(req, res, next) {
        const {id} = req.params
        const {userId} = req.body

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор питомца!"))

        if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор хозяина питомца!"))

        await ClientPet.findOne({where: {id}})
            .then((pet) => {
                if (!pet)
                    return next(ErrorHandler.badRequest(`Питомца с идентификатором ${id} не найдено!`))

                if (pet.userId !== userId)
                    return next(ErrorHandler.badRequest(`Питомец с идентификатором ${id} не Ваш!`))

                return res.json({pet})
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Обновление данных питомца.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async updatePet(req, res, next) {
        const {id} = req.params
        const {
            petName,
            petBreed,
            petAge,
            petSex,
            petWeight,
            userId
        } = req.body;

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор питомца!"))

        if (!SecondaryFunctions.isString(petName) || SecondaryFunctions.isEmpty(petName))
            return next(ErrorHandler.badRequest("Некорректно указано имя питомца!"))

        if (!SecondaryFunctions.isString(petBreed) || SecondaryFunctions.isEmpty(petBreed))
            return next(ErrorHandler.badRequest("Некорректно указана порода питомца!"))

        if (!SecondaryFunctions.isNumber(petAge) || SecondaryFunctions.isEmpty(petAge.toString()) || petAge <= 0)
            return next(ErrorHandler.badRequest("Некорректно указан возраст питомца!"))

        if (!SecondaryFunctions.isString(petSex.toString()) || SecondaryFunctions.isEmpty(petSex.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан пол питомца!"))

        if (petSex !== 'М' && petSex !== 'Ж')
            return next(ErrorHandler.badRequest("Пожалуйста, введите корректный пол.\n" +
                "1) М - мужской; \n" +
                "2) Ж - женский!"))

        if (!SecondaryFunctions.isNumber(petWeight) || SecondaryFunctions.isEmpty(petWeight.toString()) || petWeight <= 0)
            return next(ErrorHandler.badRequest("Некорректно указан вес питомца!"))

        if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор хозяина питомца!"))

        const user = await User.findOne({where: {id: userId}})
        if (!user || user.userRole !== 'USER')
            return next(ErrorHandler.badRequest(`Клиент с идентификатором ${userId} не найден!`))

        await ClientPet.findOne({where: {id}})
            .then(async (pet) => {
                if (!pet)
                    return next(ErrorHandler.badRequest(`Питомца с идентификатором ${id} не найдено!`))

                if (parseInt(pet.userId) !== parseInt(userId))
                    return next(ErrorHandler.badRequest(`Питомец с идентификатором ${id} не Ваш!`))

                const {petImage} = req.files;

                let fileName = pet.petImage;
                if (petImage && petImage.name) {
                    fileName = uuid.v4() + ".jpg"
                    await petImage.mv(path.resolve(__dirname, '..', 'static', fileName));
                }

                const isDifferent = (
                    pet.petName !== petName ||
                    pet.petBreed !== petBreed ||
                    pet.petAge !== petAge ||
                    pet.petSex !== petSex ||
                    pet.petWeight !== petWeight ||
                    pet.userId !== userId ||
                    pet.petImage !== fileName
                );

                if (isDifferent) {
                    await pet.update({
                        petName,
                        petBreed,
                        petImage: fileName,
                        petAge,
                        petSex,
                        petWeight,
                        userId
                    });
                }

                return res.json({pet});
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Удаление питомца.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async deleteOnePet(req, res, next) {
        const {id} = req.params
        const {userId} = req.body

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор питомца!"))

        if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор хозяина питомца!"))

        const user = await User.findOne({where: {id: userId}})
        if (!user || user.userRole !== 'USER')
            return next(ErrorHandler.badRequest(`Клиент с идентификатором ${userId} не найден!`))

        await ClientPet.findOne({where: {id}})
            .then(async (pet) => {
                if (!pet)
                    return next(ErrorHandler.badRequest(`Питомца с идентификатором ${id} не найдено!`))

                if (parseInt(pet.userId) !== parseInt(userId))
                    return next(ErrorHandler.badRequest(`Питомец с идентификатором ${id} не Ваш!`))

                await pet.destroy()
                return res.json({message: "Успешное удаление питомца!"})
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    //endregion

    //region Записи к врачу.

    /**
     * Получение всех записей к врачу.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getAllAppointments(req, res, next) {
        try {
            const {userId} = req.body

            if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор хозяина питомца!"))

            const user = await User.findOne({where: {id: userId}})
            if (!user || user.userRole !== 'USER')
                return next(ErrorHandler.badRequest(`Клиент с идентификатором ${userId} не найден!`))
            const fullAppointment = await Appointment.findAll({
                where: {userId},
                include: [
                    {
                        model: Doctor,
                        include: [
                            User
                        ]
                    },
                    {
                        model: ClientRequest,
                        include: [
                            {
                                model: Services,
                                through: {
                                    model: ServicesRequest
                                }
                            }
                        ]
                    }
                ]
            })
            return res.json({fullAppointment})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение определенной записи к врачу.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getOneAppointment(req, res, next) {
        try {
            const {id} = req.params
            const {userId} = req.body

            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор записи к врачу!"))

            if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор хозяина питомца!"))

            const user = await User.findOne({where: {id: userId}})
            if (!user || user.userRole !== 'USER')
                return next(ErrorHandler.badRequest(`Клиент с идентификатором ${userId} не найден!`))

            const appointment = await Appointment.findOne({where: {id}})
            if (!appointment)
                return next(ErrorHandler.badRequest(`Записи к врачу с идентификатором ${id} не найдено!`))

            if (+appointment.userId !== +userId)
                return next(ErrorHandler.badRequest("Данной записи у клиента нет!"))

            const currentAppointment = await Appointment.findOne({
                where: {id: appointment.id},
                include: [
                    {
                        model: Doctor,
                        include: [
                            User
                        ]
                    },
                    {
                        model: ClientRequest,
                        include: [
                            {
                                model: Services,
                                through: {
                                    model: ServicesRequest
                                }
                            }
                        ]
                    }
                ]
            })

            return res.json({currentAppointment})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Удаление записи к врачу.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async deleteOneAppointment(req, res, next) {
        try {
            const {id} = req.params
            const {userId} = req.body

            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор записи к врачу!"))

            if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор хозяина питомца!"))

            const user = await User.findOne({where: {id: userId}})
            if (!user || user.userRole !== 'USER')
                return next(ErrorHandler.badRequest(`Клиент с идентификатором ${userId} не найден!`))

            const appointment = await Appointment.findOne({where: {id}})
            if (!appointment)
                return next(ErrorHandler.badRequest(`Записи к врачу с идентификатором ${id} не найдено!`))

            if (+appointment.userId !== +userId)
                return next(ErrorHandler.badRequest("Данной записи у клиента нет!"))

            await appointment.destroy()
            return res.json({message: "Данная запись успешно удалена!"})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

//endregion.

}

module.exports = new ClientController()