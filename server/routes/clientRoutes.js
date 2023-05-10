const Router = require('express')
const router = new Router()

const ClientController = require('../controllers/clientController')

//region Роутеры для работы с услугами.

router.get('/service',  ClientController.getAllServices)
router.get('/service/:id',  ClientController.getOneService)

//endregion

//region Роутеры для работы с услугами.

router.get('/doctor',  ClientController.getAllDoctors)
router.get('/doctor/:id',  ClientController.getOneDoctor)

//endregion

//region для работы с питомцами животных.

router.post('/pet', ClientController.createPet)
router.get('/pet', ClientController.getAllPet)
router.get('/pet/:id', ClientController.getOnePet)
router.put('/pet/:id', ClientController.updatePet)
router.delete('/pet/:id', ClientController.deleteOnePet)

//endregion

//region Роутеры для работы с заявками.

router.post('/request', ClientController.createRequest)
router.get('/request', ClientController.getAllRequests)
router.get('/request/:id', ClientController.getOneRequest)

//endregion

//region Роутеры для работы с записями к врачу.

router.get('/appointment', ClientController.getAllAppointments)
router.get('/appointment/:id', ClientController.getOneAppointment)
router.delete('/appointment/:id', ClientController.deleteOneAppointment)

//endregion

module.exports = router