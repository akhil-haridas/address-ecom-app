const express = require('express')
const admin_route = express()
const session = require('express-session')
const bodyParser = require('body-parser')
const config = require('../configuration/config')
const auth = require('../middlewares/adminauth')
const image = require('../middlewares/imageValidation')

// controllers
const userController = require('../controllers/userController')

const productController = require('../controllers/productController')

const couponController = require('../controllers/couponController')

const orderController = require('../controllers/orderController')

const adminController = require('../controllers/adminController')

const categoryController = require('../controllers/categoryController')

const bannerController = require('../controllers/bannerController')

// create admin session
const adminSession = session({
    secret: config.adminSessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});

admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: false }));
admin_route.use(express.static('public'));

admin_route.use(adminSession);

admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({ extended: true }))
admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin')

//Image
// const path = require('path')
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudinary = require('../configuration/cloudinary');

admin_route.use(express.static('public'))



// //product image
const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'products',

        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],

        transformation: [
            {
                width: 1100,
                height: 1467,
                crop: 'fill',
                quality: 'auto',
                fetch_format: 'auto'
            }
        ]
    }
});

const upload = multer({
    storage: productStorage
});

// //category image
const categoryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'categories',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    }
});

const upload2 = multer({
    storage: categoryStorage
});

// //banner image
const bannerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'banners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    }
});

const upload3 = multer({
    storage: bannerStorage
});


//Admin routes
admin_route.get('/login', auth.isLogout, adminController.getLogin)

admin_route.post('/login', auth.isLogout, adminController.adminPost)

admin_route.get('/home', auth.isLogin, adminController.getHome)

admin_route.get('/logout', auth.isLogin, adminController.getLogout)




//Product
admin_route.get('/products', auth.isLogin, productController.getProduct)

admin_route.get('/add_product', auth.isLogin, productController.getAdd)

admin_route.post('/add_product', auth.isLogin, upload.array('upload', 6), image.Validator, productController.addProduct)

admin_route.get('/about_product', auth.isLogin, productController.aboutProduct)

admin_route.post('/about_product', auth.isLogin, upload.array('upload', 6), image.Validator, productController.updateProduct)

admin_route.get('/remove_product', auth.isLogin, productController.removeProduct)

admin_route.get('/remove_image/:image', auth.isLogin, productController.removeImage)




// User
admin_route.get('/customers', auth.isLogin, userController.getCust)

admin_route.get('/customer', auth.isLogin, userController.getviewcust)

admin_route.get('/blockUser', auth.isLogin, userController.blockCust)




//Category
admin_route.get('/category', auth.isLogin, categoryController.getCat)

admin_route.get('/add_category', auth.isLogin, categoryController.getAddcat)

admin_route.post('/add_category', auth.isLogin, upload2.single('image'), categoryController.postAddcat)

admin_route.get('/remove_category', auth.isLogin, categoryController.removeCat)




//Order
admin_route.get('/orders', auth.isLogin, orderController.getOrders)

admin_route.get('/order_update', auth.isLogin, orderController.getOrderUpdate)

admin_route.post('/order_update', auth.isLogin, orderController.updateOrder)




//Banner
admin_route.get('/banners', auth.isLogin, bannerController.getBanner)

admin_route.get('/add_banner', auth.isLogin, bannerController.getAddBanner)

admin_route.post('/add_banner', auth.isLogin, upload3.single('banner'), bannerController.postBanner)

admin_route.get('/edit_banner', auth.isLogin, bannerController.getEditBanner)

admin_route.post('/edit_banner', auth.isLogin, bannerController.updateBanner)

admin_route.get('/remove_banner', auth.isLogin, bannerController.removeBanner)




//Copuons
admin_route.get('/coupons', auth.isLogin, couponController.getCoupons)

admin_route.get('/add_coupon', auth.isLogin, couponController.getaddCoupon)

admin_route.post('/add_coupon', auth.isLogin, couponController.addCoupon)

admin_route.get('/remove_coupon', auth.isLogin, couponController.removeCoupon)




//any other routes
admin_route.get('/sales_report', auth.isLogin, orderController.salesReport)

admin_route.post('/download_report', auth.isLogin, orderController.downloadReport)

admin_route.get('*', function(req, res) {
    res.redirect('/admin')
})



module.exports = admin_route