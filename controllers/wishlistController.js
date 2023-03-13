const Cart = require('../models/cartmodel')
const Wishlist = require('../models/wishlist')
const User = require('../models/usermodel')
const Products = require('../models/products')


exports.addWishlist = async(req, res, next) => {
    try {

        if (req.session.user_id) {
            const id = req.params.productId

            const userData = await User.findById({ _id: req.session.user_id })
            const productData = await Products.findById({ _id: id })
            const wishlistData = await Wishlist.findOne({ userId: userData.id })

            if (wishlistData) {
                let existData = await Wishlist.findOne({
                    userId: req.session.user_id,
                    products: { $elemMatch: { $in: id } }
                })
                if (existData === null) {
                    const updateWishlistData = await Wishlist.updateOne({ userId: userData._id }, { $push: { products: id } })
                    const updateData = await Wishlist.findOne({ userId: userData.id })
                    const count = updateData.products.length
                    res.json({ success: true, count })

                } else {
                    res.json({ success: 'already' })
                }

            } else {
                const newwishlist = new Wishlist({
                    userId: userData._id,
                    products: id
                })
                const wishlistData = await newwishlist.save()
                const updateData = await Wishlist.findOne({ userId: userData.id })
                const count = updateData.products.length
                res.json({ success: true, count })
            }
        } else {
            res.json({ success: false })
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getWishlist = async(req, res, next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const wishlistData = await Wishlist.findOne({ userId: req.session.user_id })
        const wishlist = await Wishlist.findOne({ userId: userData._id })
        const cart = await Cart.findOne({ userId: userData._id })

        let data1 = 0
        let wishlistcount = 0
        let productData = 0
        let cartcount = 0
        if (wishlist && cart) {
            data1 = wishlistData.products
            productData = await Products.find({ _id: { $in: data1 } })
            wishlistcount = wishlist.products.length
            cartcount = cart.products.length
            res.render('wishlist', {
                userData,
                productData,
                data1,
                cartcount,
                wishlistcount
            })
        } else if (wishlist) {
            data1 = wishlistData.products
            productData = await Products.find({ _id: { $in: data1 } })
            wishlistcount = wishlist.products.length
            res.render('wishlist', {
                userData,
                productData,
                data1,
                cartcount,
                wishlistcount
            })
        } else if (cart) {
            cartcount = cart.products.length
            res.render('wishlist', {
                userData,
                productData,
                data1,
                cartcount,
                wishlistcount
            })
        } else {
            res.render('wishlist', {
                userData,
                productData,
                data1,
                cartcount,
                wishlistcount
            })
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.removeWishlist = async(req, res, next) => {
    try {

        const id = req.params.productId
        const deleteData = await Wishlist.updateOne({ userId: req.session.user_id }, {
            $pull: { products: id }
        })
        const updateData = await Wishlist.findOne({ userId: req.session.user_id })
        const count = updateData.products.length
        res.json({ success: true, count })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}