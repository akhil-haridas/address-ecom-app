const Coupon = require('../models/coupon')
const User = require('../models/usermodel')
const Cart = require('../models/cartmodel')

exports.getDiscount = async(req, res, next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const body = req.params.coupon
        const coupon = body.toUpperCase()
        const existCoupon = await Coupon.findOne({ coupon: coupon })
        if (existCoupon) {
            const count = await User.countDocuments({ _id: req.session.user_id, couponsApplied: { $elemMatch: { coupon: coupon } } });
            if (count <= 0) {
                const cartData = await Cart.findOne({ userId: req.session.user_id })

                let products = cartData.products
                let prices = products.map(products => products.price)
                let sum = prices.reduce((sum, num) => sum + num)
                sum = parseFloat(sum)

                if (existCoupon.minAmount <= sum) {
                    const percentage = existCoupon.discountPercentage;
                    const amount = sum;

                    var discountAmount = Math.round((percentage / 100) * amount)

                    if (discountAmount <= existCoupon.maxDiscount) {

                        const discountedPrice = Math.round(amount - discountAmount);
                        const updateTotal = Cart.findOneAndUpdate({ userId: req.session.user_id }, { $set: { total: discountedPrice } })
                        const couponData = {
                            appliedOn: Date().slice(0, 24),
                            coupon: existCoupon.coupon
                        }
                        const applyCoupon = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $push: { couponsApplied: {...couponData } } })
                        req.session.coupon = [discountAmount, existCoupon.coupon]
                        res.json({
                            success: 'success',
                            discountedPrice,
                            discountAmount
                        })

                    } else {
                        const discountedPrice = Math.round(amount - existCoupon.maxDiscount);
                        const updateTotal = Cart.findOneAndUpdate({ userId: req.session.user_id }, { $set: { total: discountedPrice } })
                        const couponData = {
                            appliedOn: Date().slice(0, 24),
                            coupon: existCoupon.coupon
                        }
                        const applyCoupon = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $push: { couponsApplied: {...couponData } } })
                        discountAmount = existCoupon.maxDiscount
                        req.session.coupon = [discountAmount, existCoupon.coupon]
                        res.json({
                            success: 'success',
                            discountedPrice,
                            discountAmount
                        })

                    }
                } else {
                    console.log("here")
                }

            } else {
                res.json({ success: 'already used' })
            }

        } else {
            res.json({ success: 'coupon not exist' })
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


exports.cancelCoupon = async(req, res, next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const body = req.params.coupon
        const coupon = body.toUpperCase()

        // remove the coupon from the user's couponsApplied array
        const removedCoupon = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $pull: { couponsApplied: { coupon: coupon } } })

        // get the updated cart data after removing the coupon
        const cartData = await Cart.findOne({ userId: req.session.user_id })

        let products = cartData.products
        let prices = products.map(products => products.price)
        let sum = prices.reduce((sum, num) => sum + num)
        sum = parseFloat(sum)

        // update the cart total
        const updatedCart = await Cart.findOneAndUpdate({ userId: req.session.user_id }, { total: sum })

        res.json({
            success: 'success',
            sum
        })
    } catch (error) {
        console.log(error.message)
        next(error.message)
    }
}


//adminSide Coupon Management

exports.getCoupons = async(req, res, next) => {
    try {
        var search = ''
        if (req.query.search) {
            search = req.query.search
        }
        const couponData = await Coupon.find({
            $or: [{ coupon: { $regex: '.*' + search + '.*', $options: 'i' } }]
        })
        res.render('coupons', { coupon: couponData })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getaddCoupon = async(req, res, next) => {
    try {
        res.render('addcoupen')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.addCoupon = async(req, res, next) => {
    try {
        const name = req.body.name
        const percentage = req.body.discount
        const minAmount = req.body.min
        const maxDis = req.body.max

        const unique = await Coupon.findOne({ coupon: { $regex: name, $options: 'i' } })

        if (!unique) {
            const coupon = new Coupon({
                coupon: name,
                discountPercentage: percentage,
                maxDiscount: maxDis,
                minAmount: minAmount
            })

            const coupenData = await coupon.save()

            res.redirect('/admin/coupons')
        } else {
            console.log("already exist")
            res.redirect('/admin/coupons')
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.removeCoupon = async(req, res, next) => {
    try {
        const id = req.query.id
        const deleteData = await Coupon.deleteOne({ _id: id })
        res.redirect('/admin/coupons')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}