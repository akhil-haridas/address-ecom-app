const Order = require('../models/ordermodel')
const User = require('../models/usermodel')
const Cart = require('../models/cartmodel')
const Wishlist = require('../models/wishlist')
const Products = require('../models/products')
require('dotenv').config();

const crypto = require('crypto');
const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});



//for sales report
const ejs = require('ejs')
const pdf = require('html-pdf')
const path = require('path')
const fs = require('fs')
const moment = require('moment-timezone');
const { resolve } = require('path')

exports.getPlaceorder = async(req, res, next) => {
    try {

        const checked = req.body.wallet
        var total;
        var userWallet;
        var oldWallet = 0
        if (req.session.coupon) {
            var applied = {
                couponName: req.session.coupon[1],
                discountedPrice: req.session.coupon[0]
            }
        } else {
            var applied = {
                couponName: '',
                discountedPrice: 0
            }
        }

        if (req.session.coupon) {
            req.session.coupon.splice(0, 2);
        }


        if (checked == '1') {
            const user = await User.findById({ _id: req.session.user_id })
            userWallet = parseInt(user.wallet)
            total = parseInt(req.body.total)

            if (total <= userWallet) {
                const paymentMethod = req.body.paymentMethod

                var newWallet = userWallet - total
                const setWallet = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $set: { wallet: newWallet } })
                total = 0
                oldWallet = parseInt(req.body.total)
                var address = {
                    name: req.body.name,
                    mobile: req.body.mobile,
                    home: req.body.home,
                    street: req.body.street,
                    city: req.body.city,
                    zip: req.body.zip,
                    district: req.body.district,
                    state: req.body.state,
                    country: req.body.country
                }


                const cartData = await Cart.findOne({ userId: req.session.user_id })

                const products = cartData.products.map(product => ({ // map the cart products to the order product format
                    productId: product.productId,
                    quantity: product.quantity,
                    price: product.price
                }));


                const order = new Order({
                    date: Date().slice(0, 16),
                    time: Date().slice(16, 24),
                    userId: req.session.user_id,
                    products: products,
                    total: total,
                    address: address,
                    paymentMethod: 'Wallet',
                    paymentStatus: 'Pending',
                    orderStatus: 'Placed',
                    walletAmount: oldWallet,
                    couponPrice: applied
                })

                const orderData = await order.save()
                const sessionOrder = await Order.findOne({
                    userId: req.session.user_id
                }).sort({ createdAt: -1 })

                req.session.order = sessionOrder._id

                const addressExist = await User.find({

                    address: {
                        $elemMatch: {
                            name: req.body.name,
                            mobile: req.body.mobile,
                            city: req.body.city,
                            state: req.body.state,
                            home: req.body.home,
                            zip: req.body.zip,
                            district: req.body.district,
                            country: req.body.country,
                            street: req.body.street
                        }
                    }
                })

                if (addressExist.length === 0) {

                    const pushAddress = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $push: { address: {...address } } })
                    res.json({ codsuccess: true })

                } else {

                    res.json({ codsuccess: true })
                }


            } else {
                total = total - userWallet
                var newWallet = 0

                oldWallet = userWallet

                total = parseInt(total)
                const paymentMethod = req.body.paymentMethod

                if (paymentMethod.includes("CashOnDelivery")) {

                    const setWallet = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $set: { wallet: newWallet } })

                    var address = {
                        name: req.body.name,
                        mobile: req.body.mobile,
                        home: req.body.home,
                        street: req.body.street,
                        city: req.body.city,
                        zip: req.body.zip,
                        district: req.body.district,
                        state: req.body.state,
                        country: req.body.country
                    }


                    const cartData = await Cart.findOne({ userId: req.session.user_id })

                    const products = cartData.products.map(product => ({ // map the cart products to the order product format
                        productId: product.productId,
                        quantity: product.quantity,
                        price: product.price
                    }));


                    const order = new Order({
                        date: Date().slice(0, 16),
                        time: Date().slice(16, 24),
                        userId: req.session.user_id,
                        products: products,
                        total: total,
                        address: address,
                        paymentMethod: 'Cash on Delivery',
                        paymentStatus: 'Pending',
                        orderStatus: 'Placed',
                        walletAmount: oldWallet,
                        couponPrice: applied
                    })

                    const orderData = await order.save()

                    const sessionOrder = await Order.findOne({
                        userId: req.session.user_id
                    }).sort({ createdAt: -1 })

                    req.session.order = sessionOrder._id

                    const addressExist = await User.find({

                        address: {
                            $elemMatch: {
                                name: req.body.name,
                                mobile: req.body.mobile,
                                city: req.body.city,
                                state: req.body.state,
                                home: req.body.home,
                                zip: req.body.zip,
                                district: req.body.district,
                                country: req.body.country,
                                street: req.body.street
                            }
                        }
                    })

                    if (addressExist.length === 0) {

                        const pushAddress = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $push: { address: {...address } } })
                        res.json({ codsuccess: true })

                    } else {

                        res.json({ codsuccess: true })
                    }
                } else {

                    if (paymentMethod.includes("Onlinepayment")) {
                        const setWallet = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $set: { wallet: newWallet } })
                        total = parseInt(total)

                        var address = {
                            name: req.body.name,
                            mobile: req.body.mobile,
                            home: req.body.home,
                            street: req.body.street,
                            city: req.body.city,
                            zip: req.body.zip,
                            district: req.body.district,
                            state: req.body.state,
                            country: req.body.country
                        }

                        const cartData = await Cart.findOne({ userId: req.session.user_id })

                        const products = cartData.products.map(product => ({ // map the cart products to the order product format
                            productId: product.productId,
                            quantity: product.quantity,
                            price: product.price
                        }));

                        const order = new Order({
                            date: Date().slice(0, 16),
                            time: Date().slice(16, 24),
                            userId: req.session.user_id,
                            products: products,
                            total: total,
                            address: address,
                            paymentMethod: 'Onine Payment',
                            paymentStatus: 'Completed',
                            orderStatus: 'Placed',
                            walletAmount: oldWallet,
                            couponPrice: applied
                        })

                        const orderData = await order.save()
                        const sessionOrder = await Order.findOne({
                            userId: req.session.user_id
                        }).sort({ createdAt: -1 })

                        req.session.order = sessionOrder._id

                        const addressExist = await User.find({

                            address: {
                                $elemMatch: {
                                    name: req.body.name,
                                    mobile: req.body.mobile,
                                    city: req.body.city,
                                    state: req.body.state,
                                    home: req.body.home,
                                    zip: req.body.zip,
                                    district: req.body.district,
                                    country: req.body.country,
                                    street: req.body.street
                                }
                            }
                        })

                        if (addressExist.length === 0) {

                            const pushAddress = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $push: { address: {...address } } })


                        } else {

                            console.log("address exist in online payment")
                        }

                        const orderReciept = await Order.findOne({ userId: req.session.user_id }).sort({ createdAt: -1 }).limit(1)

                        if (total != 0) {

                            var options = {
                                amount: orderReciept.total * 100, // amount in the smallest currency unit
                                currency: "INR",
                                receipt: "" + orderReciept._id
                            };
                            instance.orders.create(options, function(err, order) {
                                const orders = order
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(order);
                                    res.json({ order: order })
                                }
                            });
                        } else {
                            res.json({ codsuccess: true })
                        }
                    } else {
                        res.json({ codsuccess: 'paymentselect' })
                    }


                }
            }
        } else {
            total = parseInt(req.body.total)
            const paymentMethod = req.body.paymentMethod


            if (paymentMethod.includes("CashOnDelivery")) {
                var address = {
                    name: req.body.name,
                    mobile: req.body.mobile,
                    home: req.body.home,
                    street: req.body.street,
                    city: req.body.city,
                    zip: req.body.zip,
                    district: req.body.district,
                    state: req.body.state,
                    country: req.body.country
                }


                const cartData = await Cart.findOne({ userId: req.session.user_id })

                const products = cartData.products.map(product => ({ // map the cart products to the order product format
                    productId: product.productId,
                    quantity: product.quantity,
                    price: product.price
                }));


                const order = new Order({
                    date: Date().slice(0, 16),
                    time: Date().slice(16, 24),
                    userId: req.session.user_id,
                    products: products,
                    total: total,
                    address: address,
                    paymentMethod: 'Cash on Delivery',
                    paymentStatus: 'Pending',
                    orderStatus: 'Placed',
                    walletAmount: oldWallet,
                    couponPrice: applied
                })

                const orderData = await order.save()
                const sessionOrder = await Order.findOne({
                    userId: req.session.user_id
                }).sort({ createdAt: -1 })

                req.session.order = sessionOrder._id

                const addressExist = await User.find({

                    address: {
                        $elemMatch: {
                            name: req.body.name,
                            mobile: req.body.mobile,
                            city: req.body.city,
                            state: req.body.state,
                            home: req.body.home,
                            zip: req.body.zip,
                            district: req.body.district,
                            country: req.body.country,
                            street: req.body.street
                        }
                    }
                })

                if (addressExist.length === 0) {

                    const pushAddress = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $push: { address: {...address } } })
                    res.json({ codsuccess: true })

                } else {

                    res.json({ codsuccess: true })
                }
            } else {
                var address = {
                    name: req.body.name,
                    mobile: req.body.mobile,
                    home: req.body.home,
                    street: req.body.street,
                    city: req.body.city,
                    zip: req.body.zip,
                    district: req.body.district,
                    state: req.body.state,
                    country: req.body.country
                }

                const cartData = await Cart.findOne({ userId: req.session.user_id })

                const products = cartData.products.map(product => ({ // map the cart products to the order product format
                    productId: product.productId,
                    quantity: product.quantity,
                    price: product.price
                }));

                const order = new Order({
                    date: Date().slice(0, 16),
                    time: Date().slice(16, 24),
                    userId: req.session.user_id,
                    products: products,
                    total: total,
                    address: address,
                    paymentMethod: 'Onine Payment',
                    paymentStatus: 'Completed',
                    orderStatus: 'Placed',
                    walletAmount: oldWallet,
                    couponPrice: applied

                })

                const orderData = await order.save()

                const sessionOrder = await Order.findOne({
                    userId: req.session.user_id
                }).sort({ createdAt: -1 })

                req.session.order = sessionOrder._id

                delete req.session.coupon;

                const addressExist = await User.find({

                    address: {
                        $elemMatch: {
                            name: req.body.name,
                            mobile: req.body.mobile,
                            city: req.body.city,
                            state: req.body.state,
                            home: req.body.home,
                            zip: req.body.zip,
                            district: req.body.district,
                            country: req.body.country,
                            street: req.body.street
                        }
                    }
                })

                if (addressExist.length === 0) {

                    const pushAddress = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $push: { address: {...address } } })


                } else {

                    console.log("address exist in online payment")
                }

                const orderReciept = await Order.findOne({ userId: req.session.user_id }).sort({ createdAt: -1 }).limit(1)

                if (total != 0) {

                    var options = {
                        amount: orderReciept.total * 100, // amount in the smallest currency unit
                        currency: "INR",
                        receipt: "" + orderReciept._id
                    };
                    instance.orders.create(options, function(err, order) {
                        const orders = order
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(order);
                            res.json({ order: order })
                        }
                    });
                } else {
                    res.json({ codsuccess: true })
                }

            }
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getConfirm = async(req, res, next) => {
    try {

        if (req.session.order) {
            delete req.session.order
            const wishlistData = await Wishlist.findOne({ userId: req.session.user_id })
            const userData = await User.findById({ _id: req.session.user_id })
            const cartData = await Cart.findOne({ userId: req.session.user_id })

            let wishlistcount = 0
            let cartcount = 0

            if (wishlistData && cartData) {

                wishlistcount = wishlistData.products.length

                const orderData = await Order.findOne({
                    userId: req.session.user_id
                }).sort({ createdAt: -1 }).populate('products.productId')

                for (const products of orderData.products) {

                    const product = await Products.findOne({ _id: products.productId });
                    const newStock = product.stock - products.quantity;
                    await Products.updateOne({ _id: products.productId }, { $set: { stock: newStock } });
                }

                const add = orderData.address
                const address = Object.values(add)

                let products = cartData.products
                let prices = products.map(products => products.price)
                let sum = prices.reduce((sum, num) => sum + num)

                res.render('confirm', {
                    userData,
                    orderData,
                    cartData,
                    cartcount,
                    wishlistcount,
                    address,
                    sum
                })

                const deleteCartData = await Cart.updateMany({ userId: req.session.user_id }, { $unset: { products: ' ' } }, { multi: true })
            } else if (cartData) {

                const orderData = await Order.findOne({
                    userId: req.session.user_id
                }).sort({ createdAt: -1 }).populate('products.productId')

                for (const products of orderData.products) {

                    const product = await Products.findOne({ _id: products.productId });
                    const newStock = product.stock - products.quantity;
                    await Products.updateOne({ _id: products.productId }, { $set: { stock: newStock } });
                }

                const add = orderData.address
                const address = Object.values(add)

                let products = cartData.products
                let prices = products.map(products => products.price)
                let sum = prices.reduce((sum, num) => sum + num)

                res.render('confirm', {
                    userData,
                    orderData,
                    cartData,
                    cartcount,
                    wishlistcount,
                    address,
                    sum
                })

                const deleteCartData = await Cart.updateMany({ userId: req.session.user_id }, { $unset: { products: ' ' } }, { multi: true })
            } else {
                res.render('confirm', {
                    userData,
                    orderData,
                    cartData,
                    cartcount,
                    wishlistcount,
                    address,
                    sum
                })
            }
        } else {
            res.redirect('/')
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getOrder = async(req, res, next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const wishlist = await Wishlist.findOne({ userId: userData._id })
        const cart = await Cart.findOne({ userId: userData._id })

        let data = 0
        let wishlistcount = 0
        let productData = 0
        let cartcount = 0
        if (wishlist && cart) {
            wishlistcount = wishlist.products.length
            cartcount = cart.products.length

            const orderData = await Order.find({
                userId: req.session.user_id
            }).sort({ createdAt: -1 })

            res.render('orders', {
                userData,
                productData,
                orderData,
                cartcount,
                wishlistcount
            })
        } else if (wishlist) {
            wishlistcount = wishlist.products.length
            const orderData = await Order.find({
                userId: req.session.user_id
            }).sort({ createdAt: -1 })
            res.render('orders', {
                userData,
                productData,
                orderData,
                cartcount,
                wishlistcount
            })
        } else if (cart) {
            const orderData = await Order.find({
                userId: req.session.user_id
            }).sort({ createdAt: -1 })
            cartcount = cart.products.length
            res.render('orders', {
                userData,
                productData,
                orderData,
                cartcount,
                wishlistcount
            })
        } else {

            res.render('orders', {
                userData,
                productData,
                orderData: 0,
                cartcount,
                wishlistcount
            })
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getOrderDetails = async(req, res, next) => {
    try {
        const id = req.query.id
        const userData = await User.findById({ _id: req.session.user_id })
        const wishlist = await Wishlist.findOne({ userId: userData._id })
        const cart = await Cart.findOne({ userId: userData._id })
        const orderData = await Order.findById({ _id: id }).populate('products.productId')

        let products = orderData.products
        let prices = products.map(products => products.price)
        let sum = prices.reduce((sum, num) => sum + num)

        const add = orderData.address
        const address = Object.values(add)


        let wishlistcount = 0
        let productData = 0
        let cartcount = 0
        if (wishlist && cart) {
            wishlistcount = wishlist.products.length
            cartcount = cart.products.length

            res.render('orderdetails', {
                userData,
                orderData,
                productData,
                cartcount,
                wishlistcount,
                sum,
                address
            })
        } else if (wishlist) {
            wishlistcount = wishlist.products.length
            res.render('orderdetails', {
                userData,
                orderData,
                productData,
                cartcount,
                wishlistcount,
                sum,
                address
            })
        } else if (cart) {
            cartcount = cart.products.length
            res.render('orderdetails', {
                userData,
                orderData,
                productData,
                cartcount,
                wishlistcount,
                sum,
                address
            })
        } else {
            res.render('orderdetails', {
                userData,
                orderData,
                productData,
                cartcount,
                wishlistcount,
                sum,
                address
            })
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.editAddress = async(req, res, next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const cart = await Cart.findOne({ userId: userData._id })
        const wishlist = await Wishlist.findOne({ userId: userData._id })

        let wishlistcount = 0
        let cartcount = 0
        const id = req.query.id
        const addressData = await User.findOne({ _id: req.session.user_id, address: { $elemMatch: { _id: id } } }, { "address.$": 1 })

        if (cart && wishlist) {
            cartcount = cart.products.length
            wishlistcount = wishlist.products.length

            res.render('editaddress', { userData, cartcount, wishlistcount, addressData })
        } else
        if (cart) {
            cartcount = cart.products.length
            res.render('editaddress', { userData, cartcount, wishlistcount, addressData })
        } else if (wishlist) {
            wishlistcount = wishlist.products.length
            res.render('editaddress', { userData, cartcount, wishlistcount, addressData })
        } else {
            res.render('editaddress', { userData, cartcount, wishlistcount, addressData })
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


exports.updateAddress = async(req, res, next) => {
    try {
        const name = req.body.name;
        const mobile = req.body.mobile;
        const home = req.body.home;
        const street = req.body.street;
        const city = req.body.city;
        const district = req.body.district;
        const state = req.body.state;
        const country = req.body.country;
        const zip = req.body.zip;

        const addressId = req.query.id;

        const updateData = await User.findOneAndUpdate({ _id: req.session.user_id, address: { $elemMatch: { _id: addressId } } }, { $set: { "address.$.name": name, "address.$.mobile": mobile, "address.$.street": street, "address.$.home": home, "address.$.city": city, "address.$.district": district, "address.$.state": state, "address.$.zip": zip } })

        res.redirect('/checkout')

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


exports.cancelOrder = async(req, res, next) => {
    try {
        const id = req.params.orderId
        const userId = req.session.user_id
        const userData = await User.findById({ _id: userId })
        const orderData = await Order.findById(id)

        // Loop through order items and update product stock
        for (const products of orderData.products) {
            const product = await Products.findById(products.productId)
            product.stock += products.quantity
            await product.save()
        }

        // Update order status
        orderData.orderStatus = "Cancelled"
        await orderData.save()
        if (orderData.walletAmount) {
            if (orderData.paymentStatus == 'Completed') {
                const walletBalance = parseInt(userData.wallet)
                var refundAmount = walletBalance + orderData.total + orderData.walletAmount
                refundAmount = parseInt(refundAmount)
                const addWallet = await User.findByIdAndUpdate({ _id: userId }, { $set: { wallet: refundAmount } })
            } else {
                const walletBalance = parseInt(userData.wallet)
                var refundAmount = walletBalance + orderData.walletAmount
                refundAmount = parseInt(refundAmount)
                const addWallet = await User.findByIdAndUpdate({ _id: userId }, { $set: { wallet: refundAmount } })
            }

        } else {
            if (orderData.paymentStatus == 'Completed') {
                const walletBalance = parseInt(userData.wallet)
                var refundAmount = walletBalance + orderData.total
                refundAmount = parseInt(refundAmount)
                const addWallet = await User.findByIdAndUpdate({ _id: userId }, { $set: { wallet: refundAmount } })
            }
        }

        res.json({ success: true })

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


exports.verifyPayment = async(req, res, next) => {
    try {

        const payment = req.body.payment;
        const order = req.body.order;

        const hmac_sha256 = (data, secret) => {
            return crypto.createHmac('sha256', secret)
                .update(data)
                .digest('hex');
        }

        const secret = 'YoGupLx11G5iJTEWk9vo3UV5'

        generated_signature = hmac_sha256(payment.razorpay_order_id + "|" + payment.razorpay_payment_id, secret);

        if (generated_signature == payment.razorpay_signature) {
            console.log('payment is successful ')
            const updateOrder = await Order.findByIdAndUpdate({ _id: order.receipt }, { $set: { paymentStatus: "Completed" } })
            res.json({ message: "Your payment is successfull" })
        } else {
            res.json({ message: "Payment failed" })
        }


    } catch (error) {

        console.log(error.message)
        next(error.message);;
    }
}


exports.getOrders = async(req, res, next) => {
    try {
        const orderData = await Order.find({}).populate('userId')

        res.render('orders', { orders: orderData })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getOrderUpdate = async(req, res, next) => {
    try {
        const id = req.query.id
        const updateOrder = await Order.findById({ _id: id }).populate('products.productId')
        const add = updateOrder.address
        const address = Object.values(add)
        const userData = await User.findById({ _id: updateOrder.userId._id })

        res.render('updateorder', { order: updateOrder, userData, address })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.updateOrder = async(req, res, next) => {
    try {
        if (req.body.order != 'Delivered') {
            const orderData = await Order.findByIdAndUpdate({ _id: req.body.orderid }, { $set: { orderStatus: req.body.order } })
        } else {
            const orderData = await Order.findByIdAndUpdate({ _id: req.body.orderid }, { $set: { deliveredAt: new Date(), paymentStatus: 'Completed', orderStatus: req.body.order } }, { new: true })
        }

        res.redirect('/admin/orders')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.returnOrder = async(req, res, next) => {
    try {
        const userId = req.session.user_id
        const orderId = req.params.orderId
        const order = await Order.findById({ _id: orderId })
        const userData = await User.findById({ _id: userId })
        const orderDate = order.deliveredAt
        const today = new Date()
        const differenceInDays = Math.ceil((today - orderDate) / (1000 * 60 * 60 * 24))

        if (differenceInDays <= 7) {
            const orderData = await Order.findByIdAndUpdate({ _id: orderId }, {
                $set: {
                    paymentStatus: "Refunded",
                    orderStatus: "Returned"
                }
            })

            let refundAmount = userData.wallet + order.total
            if (order.walletAmount) {
                refundAmount += order.walletAmount
            }

            const addWallet = await User.findByIdAndUpdate({ _id: userId }, { $set: { wallet: refundAmount } })

            for (const products of order.products) {
                const product = await Products.findById(products.productId)
                product.stock += products.quantity
                await product.save()
            }

            res.json({ success: true })
        } else {
            res.json({ success: false })
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);
    }
}


//Generate and Download Sales Report

exports.salesReport = async(req, res, next) => {
    try {

        const orderData = await Order.aggregate([
            // Filter orders by date range
            {
                $match: {
                    orderStatus: "Delivered"
                }
            },
            // Unwind the products array
            {
                $unwind: "$products"
            },

            // Join with the products collection
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },

            // Unwind the product array
            {
                $unwind: "$product"
            },

            // Group by product_id and calculate total quantity and amount
            {
                $group: {
                    _id: "$product._id",
                    name: { $first: "$product.name" },
                    rating: {
                        $first: "$product.rating"
                    },
                    offerPrice: { $first: "$product.offerPrice" },
                    sales: {
                        $push: {
                            order_id: "$_id",
                            quantity: "$products.quantity",
                            amount: { $multiply: ["$products.quantity", "$product.offerPrice"] }
                        }
                    },
                    total_quantity: { $sum: "$products.quantity" },
                    total_amount: { $sum: { $multiply: ["$products.quantity", "$product.offerPrice"] } }
                }
            }

        ]);
        var today = Date().slice(0, 24)


        const orders = await Order.aggregate([{
                $match: { orderStatus: "Delivered" }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    userName: { $first: "$user.name" },
                    products: { $push: "$product.name" },
                    orderTotal: { $sum: "$total" },
                    date: { $first: '$date' },
                    pqty: { $push: '$products.quantity' },
                }
            }
        ])

        const totalSale = await Order.aggregate([{
                $match: { orderStatus: "Delivered" }
            },
            {
                $group: {
                    _id: null,
                    totalSaleAmount: { $sum: "$total" }
                }
            }
        ])

        const deliveredCount = await Order.find({ orderStatus: "Delivered" }).count()

        const cancelledCount = await Order.find({ orderStatus: "Cancelled" }).count()

        const returnedCount = await Order.find({ orderStatus: "Returned" }).count()

        res.render('salesreport', { order: orderData, today, orders: orders, totalSale, deliveredCount, cancelledCount, returnedCount })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


exports.downloadReport = async(req, res, next) => {
    try {
        // Convert from and to dates to the correct timezone
        const timezone = 'Asia/Kolkata';
        const from = moment.tz(req.body.start, timezone).toDate();
        const to = moment.tz(req.body.end, timezone).toDate();

        var fromDate = req.body.start.split('-');
        var toDate = req.body.end.split('-');
        var today = Date().slice(0, 24)
        const orderData = await Order.aggregate([
            // Filter orders by date range
            {
                $match: {
                    createdAt: {
                        $gte: from,
                        $lte: to
                    },
                    orderStatus: "Delivered"

                }
            },
            // Unwind the products array
            {
                $unwind: "$products"
            },

            // Join with the products collection
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },

            // Unwind the product array
            {
                $unwind: "$product"
            },

            // Group by product_id and calculate total quantity and amount
            {
                $group: {
                    _id: "$product._id",
                    name: { $first: "$product.name" },
                    rating: {
                        $first: "$product.rating"
                    },
                    offerPrice: { $first: "$product.offerPrice" },
                    sales: {
                        $push: {
                            order_id: "$_id",
                            quantity: "$products.quantity",
                            amount: { $multiply: ["$products.quantity", "$product.offerPrice"] }
                        }
                    },
                    total_quantity: { $sum: "$products.quantity" },
                    total_amount: { $sum: { $multiply: ["$products.quantity", "$product.offerPrice"] } }
                }
            }

        ]);

        const orders = await Order.aggregate([{
                $match: { orderStatus: "Delivered" }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    userName: { $first: "$user.name" },
                    products: { $push: "$product.name" },
                    orderTotal: { $sum: "$total" },
                    date: { $first: '$date' },
                    pqty: { $push: '$products.quantity' },
                }
            }
        ])

        const totalSale = await Order.aggregate([{
                $match: { orderStatus: "Delivered" }
            },
            {
                $group: {
                    _id: null,
                    totalSaleAmount: { $sum: "$total" }
                }
            }
        ])

        const deliveredCount = await Order.find({ orderStatus: "Delivered" }).count()

        const cancelledCount = await Order.find({ orderStatus: "Cancelled" }).count()

        const returnedCount = await Order.find({ orderStatus: "Returned" }).count()

        const data = {
            order: orderData,
            fromDate,
            toDate,
            today,
            orders,
            totalSale
        }
        const filePathName = path.resolve(__dirname, '../views/admin/download.ejs');
        const htmlString = fs.readFileSync(filePathName).toString();
        const options = {
            format: 'Letter'
        }
        const ejsData = ejs.render(htmlString, data)
        const pdfPromise = new Promise((resolve, reject) => {
            pdf.create(ejsData, options).toStream((err, stream) => {
                if (err) reject(err)
                else resolve(stream)
            })
        })

        const stream = await pdfPromise

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=SalesReport.pdf"
        })
        stream.pipe(res)
            // pdf.create(ejsData, options).toStream('../salesReport.pdf', (err, response) => {
            //     if (err) console.log(err)

        //     const filePath = path.resolve(__dirname, '../SalesReport.pdf')

        //     fs.readFile(filePath, (err, file) => {
        //         if (err) {
        //             console.log(err)
        //             return res.status(500).send('Can not download file')
        //         }
        //         res.setHeader('Content-Type', 'application/pdf')
        //         res.setHeader('Content-Disposition', 'attachment;filename="SalesReport.pdf"')



        //         res.send(file)
        //     })
        // })

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}