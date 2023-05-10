const Router = require('express')
const router = new Router()

const DoctorController = require('../controllers/doctorController')
const doctorMiddleware = require('../middlewares/user/checkRoleMiddleware')
const authMiddleware = require('../middlewares/user/authMiddleware')

//region Получение всех своих записей.

router.get('/appointment', DoctorController.getOwnAppointment)

//endregion

//region CRUD операции с медицинской картой питомца.

router.post('/medicine', authMiddleware, doctorMiddleware('DOCTOR'), DoctorController.createMedicineCard)
router.get('/medicine', authMiddleware, doctorMiddleware('DOCTOR'), DoctorController.getAllMedicineCard)
router.get('/medicine/current', authMiddleware, doctorMiddleware('DOCTOR'), DoctorController.getAllMedicineCardCurrentPet)
router.get('/medicine/:id', authMiddleware, doctorMiddleware('DOCTOR'), DoctorController.getOneMedicineCard)
router.put('/medicine/:id', authMiddleware, doctorMiddleware('DOCTOR'), DoctorController.updateMedicineCard)
router.delete('/medicine/:id', authMiddleware, doctorMiddleware('DOCTOR'), DoctorController.deleteOneMedicineCard)

//endregion

module.exports = router