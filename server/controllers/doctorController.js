const ErrorHandler = require("../errors/errorHandler");
const SecondaryFunctions = require("../validations/validation");
const {Appointment, User, Doctor, ClientPet, MedicineCard, Services, ServicesCategories} = require("../models/models");
const {Sequelize} = require("sequelize");

class DoctorController {

    //region Просмотр записей к себе.

    /**
     * Создание приема.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getOwnAppointment(req, res, next) {
        try {
            const {doctorId} = req.body

            if (!SecondaryFunctions.isNumber(doctorId) || SecondaryFunctions.isEmpty(doctorId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор врача!"))

            const appointments = await Appointment.findAll({
                include: [
                    {
                        model: Doctor,
                        where: {id: doctorId},
                        include: [{model: User}],
                    },
                    {
                        model: User
                    }
                ],
            });
            if (!appointments)
                return next(ErrorHandler("У данного врача нет активных записей!"))

            return res.json({appointments})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    //endregion

    //region CRUD операции с медицинскими картами питомца.

    /**
     * Создание записи о приеме.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async createMedicineCard(req, res, next) {
        try {
            const {
                medicineInfo,
                medicineDescription,
                dateVisit,
                clientPetId
            } = req.body

            if (!SecondaryFunctions.isString(medicineInfo) || SecondaryFunctions.isEmpty(medicineInfo))
                return next(ErrorHandler.badRequest("Некорректно указана причина приема!"))

            if (!SecondaryFunctions.isString(medicineDescription) || SecondaryFunctions.isEmpty(medicineDescription))
                return next(ErrorHandler.badRequest("Некорректно указано описание приема!"))

            if (!SecondaryFunctions.isDate(dateVisit) || SecondaryFunctions.isEmpty(dateVisit.toString()))
                return next(ErrorHandler.badRequest("Некорректно указана дата приема. Корректный формат даты: YYYY-MM-DD!"))

            if (!SecondaryFunctions.isNumber(clientPetId) || SecondaryFunctions.isEmpty(clientPetId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор питомца!"))

            await ClientPet.findOne({where: {id: clientPetId}})
                .then((pet) => {
                    if (!pet)
                        return next(ErrorHandler.badRequest(`Питомца с идентификатором ${clientPetId} не найдено!`))
                })

            const med_card = await MedicineCard.create({
                medicineInfo,
                medicineDescription,
                dateVisit,
                clientPetId
            })

            return res.json({med_card})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение всех медициских карт.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getAllMedicineCard(req, res, next) {
        try {
            const med_card = await MedicineCard.findAll()
            return res.json({med_card})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение всех медициских карт определенного питомца.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getAllMedicineCardCurrentPet(req, res, next) {
        try {
            const {clientPetId} = req.body
            if (!SecondaryFunctions.isNumber(clientPetId) || SecondaryFunctions.isEmpty(clientPetId.toString()))
                return next(ErrorHandler.badRequest("Некорректно указан идентификатор питомца!"))

            await ClientPet.findOne({where: {id: clientPetId}})
                .then((pet) => {
                    if (!pet)
                        return next(ErrorHandler.badRequest(`Питомца с идентификатором ${clientPetId} не найдено!`))
                })

            const med_card = await MedicineCard.findAll({where: {clientPetId: clientPetId}})
            return res.json({med_card})
        } catch (err) {
            return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
        }
    }

    /**
     * Получение определенной медицинский карты.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async getOneMedicineCard(req, res, next) {
        const {id} = req.params

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString()))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор медициской карты!"))

        await MedicineCard.findOne({where: {id}})
            .then((card) => {
                if (!card)
                    return next(ErrorHandler.badRequest(`Медициской карты с номером ${id} не существует!`))

                return res.json({card})
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Обновление записи в медициской карте.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async updateMedicineCard(req, res, next) {
        const {id} = req.params
        const {
            medicineInfo,
            medicineDescription,
            dateVisit,
            clientPetId
        } = req.body

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString(id)))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор медицискной карты!"))

        if (medicineInfo &&
            (!SecondaryFunctions.isString(medicineInfo) || SecondaryFunctions.isEmpty(medicineInfo)))
            return next(ErrorHandler.badRequest("Некорректно указана причина приема!"))

        if (medicineDescription &&
            (!SecondaryFunctions.isString(medicineDescription) || SecondaryFunctions.isEmpty(medicineDescription)))
            return next(ErrorHandler.badRequest("Некорректно указано описание приема!"))

        if (dateVisit &&
            (!SecondaryFunctions.isDate(dateVisit) || SecondaryFunctions.isEmpty(dateVisit.toString())))
            return next(ErrorHandler.badRequest("Некорректно указана дата приема. Корректный формат даты: YYYY-MM-DD!"))

        if (clientPetId &&
            (!SecondaryFunctions.isNumber(clientPetId) || SecondaryFunctions.isEmpty(clientPetId.toString())))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор питомца!"))

        await MedicineCard.findOne({where: {id}})
            .then(async (card) => {
                if (!card) {
                    return next(ErrorHandler.badRequest(`Медицинская карта с идентификатором ${id} не найдена!`))
                }

                if (medicineInfo === card.medicineInfo &&
                    medicineDescription === card.medicineDescription &&
                    dateVisit === card.dateVisit &&
                    clientPetId === card.clientPetId) {
                    return res.json({card})
                }

                await ClientPet.findOne({where: {id: clientPetId}})
                    .then((pet) => {
                        if (!pet)
                            return next(ErrorHandler.badRequest(`Питомца с идентификатором ${clientPetId} не найдено!`))
                    })

                const updateCard = await card.update({
                    medicineInfo: medicineInfo || card.medicineInfo,
                    medicineDescription: medicineDescription || card.medicineDescription,
                    dateVisit: dateVisit || card.dateVisit,
                    clientPetId: clientPetId || card.clientPetId
                })

                return res.json({updateCard})
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    /**
     * Удаление записи в медицинской карте.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - Передача управления следующему в цепочке Middleware.
     * @returns {Promise<void>} - Объект.
     */
    async deleteOneMedicineCard(req, res, next) {
        const {id} = req.params

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id.toString(id)))
            return next(ErrorHandler.badRequest("Некорректно указан идентификатор медицискной карты!"))

        await MedicineCard.findOne({where: {id}})
            .then(async (card) => {
                if (!card) {
                    return next(ErrorHandler.badRequest(`Медицинская карта с идентификатором ${id} не найдена!`))
                }

                await card.destroy()
                return res.json({message: "Запись в медицинской карте успешно удалена!"})
            })
            .catch((err) => {
                return next(ErrorHandler.internal(`Possible errors encountered while executing the function: ${err.message}`))
            })
    }

    //endregion

}

module.exports = new DoctorController()