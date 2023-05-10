const {
    ClientRequest,
    ServicesRequest,
    Services,
    Status,
    ClientPet,
    User,
    Doctor,
    Appointment
} = require("../models/models");
const SecondaryFunctions = require("../validations/validation");
const ErrorHandler = require("../errors/errorHandler");

class ManagerController {

    //region Просмотр заявок.

    /**
     * Получение всех заявок.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getAllRequest(req, res, next) {
        try {
            const fullRequest = await ClientRequest.findAll({
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
                        model: ClientPet
                    }
                ],
            })
            return res.json({fullRequest})
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
        const {id} = req.params
        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор зяавки!"))

        await ClientRequest.findOne({
            where: {id},
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
                    model: ClientPet
                }
            ],
        }).then((request) => {
            if (!request)
                return next(ErrorHandler.badRequest(`Заявки с номер ${id} не найдено!`))

            return res.json({request})
        }).catch((err) => {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        })
    }

    //endregion

    //region Изменение заявки.

    /**
     * Изменение статуса заявки.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async updateRequest(req, res, next) {
        const {id} = req.params
        const {statusId} = req.body

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор зяавки!"))

        if (!SecondaryFunctions.isNumber(statusId) || SecondaryFunctions.isEmpty(statusId.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор статуса заявки!"))

        await ClientRequest.findOne({
            where: {id},
            include: [
                {
                    model: ServicesRequest,
                    include: [
                        {
                            model: Services,
                        },
                    ],
                },
            ],
        }).then(async (request) => {
            if (!request)
                return next(ErrorHandler.badRequest(`Заявки с номер ${id} не найдено!`))

            const candidate = await Status.findOne({where: {id: statusId}})
            if (!candidate)
                return next(ErrorHandler.badRequest(`Статус с идентификатором ${statusId} не найден!`))

            if (statusId === request.statusId)
                return res.json({request})

            await request.update({
                statusId: statusId
            })
            return res.json({request})
        }).catch((err) => {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        })
    }

    //endregion

    //region Запись на прием к врачу.

    /**
     * Создание приема.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async createAppointment(req, res, next) {
        try {
            const {
                dateVisit,
                timeVisit,
                doctorId,
                userId,
                clientRequestId
            } = req.body

            if (!SecondaryFunctions.isDate(dateVisit) || SecondaryFunctions.isEmpty(dateVisit.toString()))
                return next(ErrorHandler.badRequest("Некорректно указанная дата. Формат даты следующий: YYYY-MM-DD!"))

            if (!SecondaryFunctions.isTime(timeVisit) || SecondaryFunctions.isEmpty(timeVisit.toString()))
                return next(ErrorHandler.badRequest("Некорректно указанное время. Формат времени следующий: HH:MM!"))

            if (!SecondaryFunctions.isNumber(doctorId) || SecondaryFunctions.isEmpty(doctorId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор врача!"))

            if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор клиента!"))

            if (!SecondaryFunctions.isNumber(clientRequestId) || SecondaryFunctions.isEmpty(clientRequestId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор зяавки!"))

            const userCandidate = await User.findOne({where: {id: userId}})
            if (!userCandidate)
                return next(ErrorHandler.badRequest(`Клиента с идентификатором ${userId} не найдено!`))

            const requestCandidate = await ClientRequest.findOne({where: {id: clientRequestId}})
            if (!requestCandidate)
                return next(ErrorHandler.badRequest(`Заявки с номером ${clientRequestId} не найдено!`))

            if (parseInt(requestCandidate.userId) !== parseInt(userCandidate.id))
                return next(ErrorHandler.badRequest(`Заявка с номером ${clientRequestId} не относится к пользователю c идентификатором ${userId}`))

            const doctorCandidate = await User.findOne({where: {id: doctorId}})
            if (!doctorCandidate && doctorCandidate.userRole !== 'DOCTOR')
                return next(ErrorHandler.badRequest(`Ветеринара с идентификатором ${doctorId} не найдено!`))

            const doctor = await Doctor.findOne({where: {userId: doctorCandidate.id}})

            const appointment = await Appointment.create({
                dateVisit,
                timeVisit,
                doctorId: doctor.id,
                userId,
                clientRequestId
            })

            const newAppointment = await Appointment.findOne({
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


            return res.json({newAppointment})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    //endregion

}

module.exports = new ManagerController()