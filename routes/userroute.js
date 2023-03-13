//require express
const express = require('express');
const user_route = express();
const session = require('express-session');
const bodyParser = require("body-parser");
const config = require("../configuration/config")

// create user session
const userSession = session({
    secret: config.userSessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});

user_route.use(userSession);

//controllers

const userController = require('../controllers/userController')

const productController = require('../controllers/productController')

const cartController = require('../controllers/cartController')

const wishlistController = require('../controllers/wishlistController')

const orderController = require('../controllers/orderController')

const categoryController = require('../controllers/categoryController')

const couponController = require('../controllers/couponController')


//middleware
const auth = require('../middlewares/userauth')


user_route.set('view engine', 'ejs');
user_route.set('views', './views/user');
const { userSessionSecret } = require('../configuration/config');
const { isLogin } = require('../middlewares/adminauth');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }))


const multer = require("multer");
const path = require('path');

user_route.use(express.static('public'));

//user image
const storage4 = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/userimg'))
    },
    filename: function(req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }
});
const upload4 = multer({ storage: storage4 });



//routes for user controller
user_route.get('/signup', auth.isLogout, userController.getSignup);

user_route.post('/signup', auth.isLogout, userController.signupUser);

user_route.get('/signin', auth.isLogout, userController.getSignin);

user_route.post('/signin', auth.isLogout, userController.verifyLogin);

user_route.get('/mobile', auth.isLogout, userController.getNumber)

user_route.get('/otpverify', auth.isLogout, userController.getOTP)

user_route.get('/resendotp', userController.resendOtp)

user_route.post('/', userController.verifyOTP)

user_route.post('/otpverify', userController.signOTP)

user_route.get('/forget', auth.isLogout, userController.getMob)

user_route.post('/getotp', userController.getreset)

user_route.post('/reset', userController.getlink)

user_route.post('/resetpass', userController.resetpass)

user_route.post('/change_password', auth.isLogin, userController.changePass)

user_route.get('/profile', auth.isLogin, userController.getProfile)

user_route.get('/edit_profile', auth.isLogin, userController.getEditProfile)

user_route.post('/edit_profile', auth.isLogin, upload4.single('userimg'), userController.getUpdateProfile)

user_route.get('/logout', auth.isLogin, userController.logoutUser)

user_route.get('/remove_address/:addressId', auth.isLogin, userController.removeAddress)

user_route.get('/contact', userController.getContact)




//Product controller
user_route.get('/', productController.getHome)

user_route.get('/product', productController.getProductc)

user_route.post('/product', productController.addReview)

user_route.get('/shop', productController.getShop)




//category
user_route.get('/select_category/:number', categoryController.selectedCategory)

user_route.post('/filter_products', categoryController.filterProducts)


//cart controller
user_route.get('/add_cart/:productId', auth.isLogin, cartController.addCart)

user_route.get('/cart', auth.isLogin, cartController.getCart)

user_route.get('/removecart/:productId', auth.isLogin, cartController.removeCart)

user_route.get('/cart/:productId', auth.isLogin, cartController.increment)

user_route.post('/cart/:productId', auth.isLogin, cartController.decrement)

user_route.get('/checkout', auth.isLogin, cartController.getCheckout)




// Wishlist controller
user_route.get('/add_wishlist/:productId', auth.isLogin, wishlistController.addWishlist)

user_route.get('/wishlist', auth.isLogin, wishlistController.getWishlist)

user_route.get('/remove_wishlist/:productId', auth.isLogin, wishlistController.removeWishlist)




//Order controller
user_route.post('/checkout', auth.isLogin, orderController.getPlaceorder)

user_route.get('/orders', auth.isLogin, orderController.getOrder)

user_route.get('/confirm', auth.isLogin, orderController.getConfirm)

user_route.get('/order_details', auth.isLogin, orderController.getOrderDetails)

user_route.get('/edit_address', auth.isLogin, orderController.editAddress)

user_route.post('/edit_address', auth.isLogin, orderController.updateAddress)

user_route.get('/cancel_order/:orderId', auth.isLogin, orderController.cancelOrder)

user_route.post('/verify-payment', auth.isLogin, orderController.verifyPayment)

user_route.get('/return_order/:orderId', auth.isLogin, orderController.returnOrder)


//Coupon
user_route.get('/coupon_discount/:coupon', auth.isLogin, couponController.getDiscount)

user_route.get('/cancel_coupon/:coupon', auth.isLogin, couponController.cancelCoupon)

module.exports = user_route