const User = require('../models/usermodel')
const bcrypt = require('bcrypt')
const Wishlist = require('../models/wishlist')
const randomstring = require('randomstring')
const Cart = require('../models/cartmodel')

require('dotenv').config();
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const serviceId = process.env.TWILIO_SERVICE_ID





//Secure Password
const securePassword = async password => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//Get SignupPage
exports.getSignup = async(req, res, next) => {
    try {
        res.render('signup')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//get Sign in Page
exports.getSignin = async(req, res, next) => {
    try {
        res.render('signin')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//Signup User
exports.signupUser = async(req, res, next) => {
    try {
        let existMobile = await User.find({ mobile: req.body.mobile })
        let existMail = await User.find({ email: req.body.email })

        // checking user exist

        if (!existMobile.length && !existMail.length) {
            //assign user details to session
            req.session.userData = req.body

            //checkking user in session
            if (req.session.userData) {
                //checking user mobile is exist
                if (req.session.userData.mobile) {

                    let Number = req.session.userData.mobile
                    console.log(Number)
                    client.verify.v2
                        .services(serviceId)
                        .verifications.create({ to: '+91' + Number, channel: 'sms' })
                        .then(verification => {
                            console.log(verification.status)
                            res.redirect('/otpverify')
                        })
                        .catch(err => {
                            console.log(err)
                            otpErrormessage = 'make sure the phone number is correct'
                        })
                } else {
                    res.render('signup', { message: 'Number is not Valid' })
                }
            } else {
                res.render('signup', { message: 'Your Registration has been Failed.' })
            }
        } else {
            res.render('signup', { message: 'Account already Exists' })
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//get user number for sign with number
exports.getNumber = async(req, res, next) => {
    try {
        res.render('mobilenumber')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//sign in with otp
exports.signOTP = async(req, res, next) => {
    try {

        const referer = req.get('referer');
        if (referer && referer.endsWith('/mobile')) {
            //assign body data to session storage
            req.session.userData = req.body

            //assign user mobile number from session to Number variable
            let Number = req.session.userData.mobile

            const userData = await User.findOne({ mobile: req.body.mobile })

            if (userData) {
                const mobileMatch = (await Number) === userData.mobile

                if (userData.Active == 0) {
                    if (mobileMatch) {
                        {
                            function sendTextMessage() {
                                client.verify.v2
                                    .services(serviceId)
                                    .verifications.create({ to: '+91' + Number, channel: 'sms' })
                                    .then(verification => {
                                        console.log(verification.status)
                                    })
                            }
                            sendTextMessage()

                            res.render('otpcheck')
                        }
                    } else {
                        res.render('signup', { message: 'Please create a Account' })
                    }
                } else {
                    res.render('signup', { message: 'Your account has been Blocked' })
                }
            } else {
                res.render('signup', {
                    message: 'You are not registererd,Enter a valid number!'
                })
            }
        } else {
            res.status(403).send('Access denied');
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//get otp page
exports.getOTP = async(req, res, next) => {
    try {
        const referer = req.get('referer');
        if (referer && referer.endsWith('/mobile','/signup')) {
            res.render('otpcheck', { message: 'OTP Sent successfully' })
        } else {
            res.status(403).send('Access denied');
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//resend otp
exports.resendOtp = async(req, res, next) => {
    try {
        let Number = req.session.userData.mobile

        function sendTextMessage() {
            client.verify.v2
                .services(serviceId)
                .verifications.create({ to: '+91' + Number, channel: 'sms' })
                .then(verification => {
                    console.log(verification.status)
                })
        }
        sendTextMessage()

        res.redirect('/otpverify')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//getreset otp

exports.getreset = async(req, res, next) => {
    try {

        const referer = req.get('referer');
        if (referer && referer.endsWith('/forget')) {
            //assign body data to session storage
            req.session.userData = req.body

            //assign user mobile number from session to Number variable
            let Number = req.session.userData.mobile

            const userData = await User.findOne({ mobile: req.body.mobile })

            if (userData) {
                if (userData.Active == 0) {
                    const mobileMatch = (await Number) === userData.mobile

                    if (mobileMatch) {
                        {
                            function sendTextMessage() {
                                client.verify.v2
                                    .services(serviceId)
                                    .verifications.create({ to: '+91' + Number, channel: 'sms' })
                                    .then(verification => {
                                        console.log(verification.status)
                                    })
                            }
                            sendTextMessage()
                            res.render('getreset')
                        }
                    } else {
                        res.render('signup', { message: 'Please create a Account' })
                    }
                } else {
                    res.render('signup', { message: 'Your Account has been Blocked' })
                }
            } else {
                res.render('getnumber', {
                    message: 'You are not registererd,Enter a valid number!'
                })
            }
        } else {
            res.status(403).send('Access denied');
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//reset passWord

exports.resetpass = async(req, res, next) => {
    try {
        const password = req.body.password
        const token = req.session.randomstring
        const tokenData = await User.findOne({ token: token })
        if (tokenData) {
            const secure_password = await securePassword(password)
            const updatedData = await User.findOneAndUpdate({ token: token }, { $set: { password: secure_password, token: '' } })
            res.render('signin', { message: 'Password reset successfully' })
        } else {
            res.render('signup', { message: 'User not found' })
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//get reset page link

exports.getlink = async(req, res, next) => {
    try {
        //get user number from session
        const Number = req.session.userData.mobile
        const randomString = randomstring.generate()
        req.session.randomstring = randomString
        const updatedData = await User.updateOne({ mobile: Number }, { $set: { token: randomString } })
            //get otp from body
        const otp = `${req.body.otp1}${req.body.otp2}${req.body.otp3}${req.body.otp4}`

        //checking OTP is Valid
        client.verify.v2
            .services(serviceId)
            .verificationChecks.create({ to: '+91' + Number, code: otp })
            .then(verification_check => {
                console.log(verification_check.status)

                //if otp is valid
                if (verification_check.status === 'approved') {
                    res.render('reset')
                } else {
                    res.render('getreset', { message: 'You have entered Invalid OTP' })
                }
            })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//verify OTP
exports.verifyOTP = async(req, res, next) => {
    try {
        //get user number from session
        const Number = req.session.userData.mobile

        //get otp from body
        const otp = `${req.body.otp1}${req.body.otp2}${req.body.otp3}${req.body.otp4}`

        //checking OTP is Valid
        client.verify.v2
            .services(serviceId)
            .verificationChecks.create({ to: '+91' + Number, code: otp })
            .then(verification_check => {
                console.log(verification_check.status)

                //if otp is valid
                if (verification_check.status === 'approved') {
                    //checking user
                    if (req.session.userData.name) {
                        //IIFE for insert user database
                        ;
                        (async function insertUser() {
                            const password = await securePassword(
                                req.session.userData.password
                            )
                            const user = new User({
                                name: req.session.userData.name,
                                email: req.session.userData.email,
                                mobile: req.session.userData.mobile,
                                password: password,
                                verified: 1,
                                date: Date().slice(0, 24),
                                wallet: 0
                            })
                            const userData = await user.save()
                        })()

                        res.render('signin', {
                            message: 'Registration successful , sign in here'
                        })

                        //else case for sign in with otp
                    } else {
                        (async function findUser() {
                            const userData = User.findOne({
                                mobile: req.session.userData.mobile
                            })

                            req.session.user_id = userData._id
                            res.redirect('/')
                        })()
                    }
                } else {
                    res.render('otpcheck', { message: 'You have entered Invalid OTP' })
                }
            })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//Sign in user
exports.verifyLogin = async(req, res, next) => {
    try {

        const mobile = req.body.mobile
        const password = req.body.password
        const userData = await User.findOne({ mobile: mobile })
        if (userData) {
            if (userData.Active == 0) {
                const passMatch = await bcrypt.compare(password, userData.password)
                if (passMatch) {
                    req.session.user_id = userData._id

                    res.redirect('/')
                } else {
                    res.render('signin', { message: 'Password is incorrect' })
                }
            } else {
                res.render('signin', { message: 'Your account has been Blocked' })
            }
        } else {
            res.render('signin', { message: 'Email or password incorrect' })
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//get mobile number

exports.getMob = async(req, res, next) => {
    try {
        res.render('getnumber')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//user profile

exports.getProfile = async(req, res, next) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById({ _id: req.session.user_id })
            const cart = await Cart.findOne({ userId: userData._id })
            const wishlist = await Wishlist.findOne({ userId: userData._id })
            let wishlistcount = 0
            let cartcount = 0
            if (cart && wishlist) {
                cartcount = cart.products.length
                wishlistcount = wishlist.products.length
                res.render('profile', { userData, cartcount, wishlistcount })
            } else if (cart) {
                cartcount = cart.products.length
                res.render('profile', { userData, cartcount, wishlistcount })
            } else if (wishlist) {
                wishlistcount = wishlist.products.length
                res.render('profile', { userData, cartcount, wishlistcount })
            } else {
                res.render('profile', { userData, cartcount, wishlistcount })
            }
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

// user profile edit

exports.getEditProfile = async(req, res, next) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById({ _id: req.session.user_id })
            const cart = await Cart.findOne({ userId: userData._id })
            const wishlist = await Wishlist.findOne({ userId: userData._id })
            let wishlistcount = 0
            let cartcount = 0
            if (cart && wishlist) {
                cartcount = cart.products.length
                wishlistcount = wishlist.products.length
                res.render('editprofile', { userData, cartcount, wishlistcount })
            } else if (cart) {
                cartcount = cart.products.length
                res.render('editprofile', { userData, cartcount, wishlistcount })
            } else if (wishlist) {
                wishlistcount = wishlist.products.length
                res.render('editprofile', { userData, cartcount, wishlistcount })
            } else {
                res.render('editprofile', { userData, cartcount, wishlistcount })
            }
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

// update user profile changes
exports.getUpdateProfile = async(req, res, next) => {
    try {
        const name = req.body.name
        const surname = req.body.surname
        const email = req.body.email
        if (req.file != undefined) {
            const image = req.file.filename

            const updateUser = await User.findByIdAndUpdate({ _id: req.session.user_id }, {
                $set: {
                    name: name,
                    surname: surname,
                    email: email,
                    image: image
                }
            })
        } else {
            const updateUser = await User.findByIdAndUpdate({ _id: req.session.user_id }, {
                $set: {
                    name: name,
                    surname: surname,
                    email: email
                }
            })
        }


        // const addressData = {
        //     home: req.body.home,
        //     street: req.body.street,
        //     city: req.body.city,
        //     zip: req.body.zip,
        //     district: req.body.district,
        //     country: req.body.country,
        //     state: req.body.state
        // }

        // const pushAddress = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $push: { address: {...addressData } } })

        res.redirect('/profile')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }
}


// removing user address

exports.removeAddress = async(req, res, next) => {
    try {
        let addressId = req.params.addressId
        const updateData = await User.updateOne({ _id: req.session.user_id }, { $pull: { address: { _id: addressId } } })
        res.json({ success: true })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


// changing user password

exports.changePass = async(req, res, next) => {
    try {

        const userData = await User.findById({ _id: req.session.user_id })
        const password = req.body.oldpass
        const newPass = req.body.newpass
        const confirm = req.body.confirmpass
        if (password != '' && newPass != '' && confirm != '') {
            const passMatch = await bcrypt.compare(password, userData.password)
            if (passMatch) {
                if (newPass === confirm) {
                    const secure_password = await securePassword(newPass)
                    const updatedData = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $set: { password: secure_password } })
                    res.json({ success: true })
                } else {
                    res.json({ success: 'miss' })
                }
            } else {
                res.json({ success: false })
            }
        } else {
            res.json({ success: 'fill' })
        }


    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

//contact

exports.getContact = async(req, res, next) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById({ _id: req.session.user_id })
            const cart = await Cart.findOne({ userId: userData._id })
            const wishlist = await Wishlist.findOne({ userId: userData._id })
            let wishlistcount = 0
            let cartcount = 0
            if (cart && wishlist) {
                cartcount = cart.products.length
                wishlistcount = wishlist.products.length
                res.render('contact', { userData, cartcount, wishlistcount })
            } else if (cart) {
                cartcount = cart.products.length
                res.render('contact', { userData, cartcount, wishlistcount })
            } else if (wishlist) {
                wishlistcount = wishlist.products.length
                res.render('contact', { userData, cartcount, wishlistcount })
            } else {
                res.render('contact', { userData, cartcount, wishlistcount })
            }
        } else {
            res.render('contact')
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


//logout User
exports.logoutUser = async(req, res, next) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}



//Admin side User Controll

exports.getCust = async(req, res, next) => {
    try {
        var search = ''
        if (req.query.search) {
            search = req.query.search
        }
        const userData = await User.find({
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } },
                { mobile: { $regex: '.*' + search + '.*', $options: 'i' } },
                { date: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        })
        res.render('customers', { users: userData })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getviewcust = async(req, res, next) => {
    try {
        const id = req.query.id
        const userData = await User.findById({ _id: id })
        res.render('viewcustomer', { user: userData })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.blockCust = async(req, res, next) => {
    try {
        id = req.query.id
        const userData = await User.findById({ _id: id })
        if (userData.Active == 0) {
            const block = await User.findByIdAndUpdate({ _id: id }, { $set: { Active: 1 } })
            res.redirect('/admin/customers')
        } else {
            const unblock = await User.findByIdAndUpdate({ _id: id }, { $set: { Active: 0 } })
            res.redirect('/admin/customers')
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}