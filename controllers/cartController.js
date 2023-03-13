const Cart = require('../models/cartmodel')
const Wishlist = require('../models/wishlist')
const User = require('../models/usermodel')
const Products = require('../models/products')
const Coupon = require('../models/coupon')

exports.addCart = async(req, res, next) => {
    try {
        const { user_id } = req.session;
        if (!user_id) return res.json({ success: 'logout' });

        const { productId: id } = req.params;
        const [userData, productData, cartData] = await Promise.all([
            User.findById(user_id),
            Products.findById(id),
            Cart.find({ userId: user_id }),
        ]);

        if (productData.stock <= 0) return res.json({ success: 'stockout' });

        const existData = await Cart.findOne({
            userId: user_id,
            products: { $elemMatch: { productId: id } },
        });

        const productData1 = {
            productId: productData._id,
            quantity: 1,
            price: productData.offerPrice,
        };

        const deletewishData = await Wishlist.updateOne({ userId: userData }, { $pull: { products: id } });

        if (existData === null) {
            const updateCartData = await Cart.updateOne({ userId: userData }, { $push: { products: {...productData1 } } });
            const updateData = await Cart.findOne({ userId: user_id });
            const count = updateData.products.length;
            return res.json({ success: 'added', count });
        }

        return res.json({ success: 'already' });
    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
};

exports.getCart = async(req, res, next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const cartData = await Cart.findOne({ userId: req.session.user_id })
        const cart = await Cart.findOne({ userId: userData._id })
        const wishlist = await Wishlist.findOne({ userId: userData._id })
        let wishlistcount = 0
        let data1 = 0
        let cartcount = 0
        let productData = 0
        if (cart && wishlist) {
            data1 = cartData.products
            const productId = data1.map(values => values.productId)
            productData = await Products.find({ _id: { $in: productId } })
            cartcount = cart.products.length || 0
            wishlistcount = wishlist.products.length || 0
            res.render('cart', {
                userData,
                productData,
                data1,
                cartcount,
                wishlistcount
            })
        } else if (wishlist) {
            wishlistcount = wishlist.products.length || 0
            res.render('cart', {
                userData,
                productData,
                data1,
                cartcount,
                wishlistcount
            })
        } else if (cart) {
            data1 = cartData.products
            const productId = data1.map(values => values.productId)
            productData = await Products.find({ _id: { $in: productId } })
            cartcount = cart.products.length || 0
            res.render('cart', {
                userData,
                productData,
                data1,
                cartcount,
                wishlistcount
            })
        } else {
            res.render('cart', {
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


exports.removeCart = async(req, res, next) => {
    try {
        const deleteData = await Cart.updateOne({ userId: req.session.user_id }, {
            $pull: { products: { productId: req.params.productId } }
        })
        const updateData = await Cart.findOne({ userId: req.session.user_id })
        const count = updateData.products.length
        res.json({ success: true, count })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.increment = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { user_id } = req.session;

    const cartData = await Cart.findOne({ userId: user_id, 'products.productId': productId });
    const productData = await Products.findById(productId);

    const product = cartData.products.find(p => p.productId == productId);
    const productQty = product.quantity;

    if (productQty >= productData.stock) {
      return res.json({ success: false });
    }

    const updateData = await Cart.findOneAndUpdate(
      { userId: user_id, 'products.productId': productId },
      {
        $inc: {
          'products.$.quantity': 1,
          'products.$.price': +productData.offerPrice
        }
      }
    );

    const updatedPrice = product.price + productData.offerPrice;
    const sum = cartData.products.reduce((total, { price }) => total + price, 0);
    const maxQty = parseFloat(productData.stock);

    res.json({ success: true, updatedPrice, sum, maxQty });
  } catch (error) {
    console.log(error.message);
    next(error.message);
  }
};



exports.decrement = async(req, res, next) => {
    try {
        let id = req.params.productId
        let cartData = await Cart.findOne({
            userId: req.session.user_id,
            'products.productId': id
        })
        let quantity = cartData.products.find(p => p.productId == id).quantity

        if (quantity > 1) {
            const productData = await Products.findById({ _id: id })

            let updateData = await Cart.findOneAndUpdate({ userId: req.session.user_id, 'products.productId': id }, {
                $inc: {
                    'products.$.quantity': -1,
                    'products.$.price': -productData.offerPrice
                }
            })

            cartData = await Cart.findOne({
                userId: req.session.user_id,
                'products.productId': id
            })

            let updatedPrice = cartData.products.find(p => p.productId == id).price
            let products = cartData.products
            let prices = products.map(products => products.price)
            let sum = prices.reduce((sum, num) => sum + num)

            res.json({ updatedPrice, sum })
        } else {
            res.redirect('/cart')
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}



exports.getCheckout = async(req, res, next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const cartData = await Cart.findOne({ userId: userData._id })
        const wishlist = await Wishlist.findOne({ userId: userData._id })
        let wishlistcount = 0
        let data1 = 0
        let cartcount = 0
        let productData = 0

        if (cartData.products.length !== 0) {
            if (cartData && wishlist) {
                data1 = cartData.products
                const productId = data1.map(values => values.productId)
                productData = await Products.find({ _id: { $in: productId } })

                cartcount = cartData.products.length
                wishlistcount = wishlist.products.length

                let products = cartData.products
                let prices = products.map(products => products.price)
                let sum = prices.reduce((sum, num) => sum + num)

                const userAddress = await User.findById({ _id: req.session.user_id })
                const add = userAddress.address
                const address = Object.values(add)


                const user = await User.findOne({ _id: req.session.user_id });

                // Get an array of coupon names that the user has already applied
                const usedCouponNames = user.couponsApplied.map(coupon => coupon.coupon);

                // Find all coupons that are not in the usedCouponNames array
                const coupons = await Coupon.find({ coupon: { $nin: usedCouponNames } })


                let bestCoupon = null;
                let discountedPrice = sum;

                for (const coupon of coupons.sort((a, b) => b.maxDiscount - a.maxDiscount)) {

                    if (discountedPrice >= coupon.minAmount) {
                        const discountAmount = discountedPrice * (coupon.discountPercentage / 100);

                        if (!bestCoupon || discountAmount < bestCoupon.maxDiscount) {
                            if (discountAmount > coupon.maxDiscount) {

                                bestCoupon = {
                                    name: coupon.coupon,
                                    maxDiscount: coupon.maxDiscount,
                                    percentage: coupon.discountPercentage
                                };

                                discountedPrice -= coupon.maxDiscount;
                            } else {
                                bestCoupon = {
                                    name: coupon.coupon,
                                    maxDiscount: discountAmount,
                                    percentage: coupon.discountPercentage
                                };

                                discountedPrice -= discountAmount;
                            }
                        }
                    }
                }




                res.render('checkout', {
                    userData,
                    productData,
                    data1,
                    cartcount,
                    wishlistcount,
                    sum,
                    address,
                    bestCoupon
                })
            } else if (cartData) {
                data1 = cartData.products
                const productId = data1.map(values => values.productId)
                productData = await Products.find({ _id: { $in: productId } })
                const userAddress = await User.findById({ _id: req.session.user_id })
                const add = userAddress.address
                const address = Object.values(add)
                cartcount = cartData.products.length
                let products = cartData.products
                let prices = products.map(products => products.price)
                let sum = prices.reduce((sum, num) => sum + num)


                const user = await User.findOne({ _id: req.session.user_id });

                // Get an array of coupon names that the user has already applied
                const usedCouponNames = user.couponsApplied.map(coupon => coupon.coupon);

                // Find all coupons that are not in the usedCouponNames array
                const coupons = await Coupon.find({ coupon: { $nin: usedCouponNames } })

                let bestCoupon = null;

                for (const coupon of coupons.sort((a, b) => b.maxDiscount - a.maxDiscount)) {

                    if (sum >= coupon.minAmount) {

                        const discountAmount = sum * (coupon.discountPercentage / 100);
                        if (!bestCoupon || discountAmount > bestCoupon.maxDiscount) {

                            bestCoupon = {
                                name: coupon.coupon,
                                maxDiscount: discountAmount,
                                percentage: coupon.discountPercentage
                            };

                        }
                    }
                }


                res.render('checkout', {
                    userData,
                    cartcount,
                    productData,
                    data1,
                    wishlistcount,
                    sum,
                    address,
                    bestCoupon
                })
            } else {
                res.render('checkout', {
                    userData,
                    cartcount,
                    productData,
                    data1,
                    wishlistcount,
                    sum,
                    address: 0
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