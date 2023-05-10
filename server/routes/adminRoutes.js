const Router = require('express')
const router = new Router()

const AdminController = require('../controllers/adminController')
const adminMiddleware = require('../middlewares/user/checkRoleMiddleware')
const authMiddleware = require('../middlewares/user/authMiddleware')

//region Роутеры для работы с категориями услуг.

router.post('/category', authMiddleware, adminMiddleware('ADMIN'), AdminController.createCategory)
router.get('/category', authMiddleware, adminMiddleware('ADMIN'), AdminController.getAllCategories)
router.get('/category/:id', adminMiddleware('ADMIN'), AdminController.getOneCategory)
router.put('/category/:id', adminMiddleware('ADMIN'), AdminController.updateCategory)
router.delete('/category/:id', adminMiddleware('ADMIN'), AdminController.deleteOneCategory)

//endregion

//region Роутеры для работы с услугами.

router.post('/service', authMiddleware, adminMiddleware('ADMIN'), AdminController.createService)
router.get('/service', authMiddleware, adminMiddleware('ADMIN'), AdminController.getAllServices)
router.get('/service/:id', authMiddleware, adminMiddleware('ADMIN'), AdminController.getOneService)
router.put('/service/:id', authMiddleware, adminMiddleware('ADMIN'), AdminController.updateService)
router.delete('/service/:id', authMiddleware, adminMiddleware('ADMIN'), AdminController.deleteOneService)

//endregion

//region Роутеры для работы с ветеринарами.

router.post('/doctor', authMiddleware, adminMiddleware('ADMIN'), AdminController.createDoctor)
router.get('/doctor', authMiddleware, adminMiddleware('ADMIN'), AdminController.getAllDoctors)
router.get('/doctor/:id', authMiddleware, adminMiddleware('ADMIN'), AdminController.getOneDoctor)
router.put('/doctor/:id', authMiddleware, adminMiddleware('ADMIN'), AdminController.updateDoctor)
router.delete('/doctor/:id', authMiddleware, adminMiddleware('ADMIN'), AdminController.deleteOneDoctor)

//endregion

//region Роутеры для работы с должностями.

router.post('/post', authMiddleware, adminMiddleware('ADMIN'), AdminController.createPost)
router.get('/post', authMiddleware, adminMiddleware('ADMIN'), AdminController.getAllPost)
router.get('/post/:id', adminMiddleware('ADMIN'), AdminController.getOnePost)
router.put('/post/:id', adminMiddleware('ADMIN'), AdminController.updatePost)
router.delete('/post/:id', adminMiddleware('ADMIN'), AdminController.deleteOnePost)

//endregion

module.exports = router