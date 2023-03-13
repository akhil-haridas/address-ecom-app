const User = require('../models/usermodel')
const Products = require('../models/products')
const Category = require('../models/product_category')
const Banner = require('../models/bannermodel')
const Cart = require('../models/cartmodel')
const Wishlist = require('../models/wishlist')
const Order = require('../models/ordermodel')

const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const $ = require('jquery');
const sharp = require('sharp');
const rimraf = require('rimraf');




//get Homepage
exports.getHome = async(req, res, next) => {
    try {
        if (req.session.user_id) {


            var search = ''
            if (req.query.search) {
                search = req.query.search
            }

            const productData = await Products.find({
                    $or: [
                        { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                    ]
                })
                .sort({ Date: -1 })
                .limit(8)

            const banner = await Banner.find({})
            const category = await Category.find({}).limit(5)
            const userData = await User.findById({ _id: req.session.user_id })
            const cart = await Cart.findOne({ userId: userData._id })
            const wishlistData = await Wishlist.findOne({ userId: userData._id })

            const productCount = await Category.aggregate([
                { $lookup: { from: "products", localField: "_id", foreignField: "category", as: "products" } },
                { $project: { _id: 1, name: 1, product_count: { $size: "$products" } } }
            ])

            let wishlistcount = 0
            let cartcount = 0
            let wishlist = [0]
            var cartData = [0]

            if (cart && wishlistData) {
                cartcount = cart.products.length
                wishlistcount = wishlistData.products.length
                wishlist = wishlistData.products
                cartData = cart.products
                cartData = cartData.map(item => item.productId.toString());

                res.render('home', {
                    userData,
                    productData,
                    banner,
                    category,
                    cartcount,
                    wishlistcount,
                    wishlist,
                    productCount,
                    cartData
                })
            } else if (wishlistData) {
                wishlist = wishlistData.products
                wishlistcount = wishlistData.products.length
                res.render('home', {
                    userData,
                    productData,
                    banner,
                    category,
                    cartcount,
                    wishlistcount,
                    wishlist,
                    productCount,
                    cartData
                })
            } else if (cart) {
                cartcount = cart.products.length
                cartData = cart.products
                cartData = cartData.map(item => item.productId.toString());

                res.render('home', {
                    userData,
                    productData,
                    banner,
                    category,
                    cartcount,
                    wishlistcount,
                    wishlist,
                    productCount,
                    cartData
                })
            } else {

                res.render('home', {
                    userData,
                    productData,
                    banner,
                    category,
                    cartcount,
                    wishlistcount,
                    wishlist,
                    productCount,
                    cartData
                })
            }
        } else {
            var search = ''
            if (req.query.search) {
                search = req.query.search
            }

            const productData = await Products.find({
                    $or: [
                        { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                    ]
                })
                .sort({ Date: -1 })
                .limit(8)
            const banner = await Banner.find({})
            const category = await Category.find({}).limit(5)
            let wishlist = [0]
            let cartData = [0]
            const productCount = await Category.aggregate([
                { $lookup: { from: "products", localField: "_id", foreignField: "category", as: "products" } },
                { $project: { _id: 1, name: 1, product_count: { $size: "$products" } } }
            ])

            res.render('home', { productData, banner, category, wishlist, productCount, cartData })
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getProductc = async(req, res, next) => {
    try {

        const id = req.query.id
        var search = ''
        if (req.query.search) {
            search = req.query.search
        }

        const productData = await Products.findById({ _id: id })
        const category = await Products.findOne({
            _id: id,
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                { color: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        }, { category: 1, _id: 0 })
        const relate = await Products.find({ category: category.category }).limit(4)
        const wishlist = await Wishlist.findOne({ userId: req.session.user_id })

        let wishlistcount = 0
        let cartcount = 0
        let wishlistc = [0]
        if (req.session.user_id) {
            const userData = await User.findById({ _id: req.session.user_id })
                // userData = await User.findById({ _id: req.session.user_id })
            const cart = await Cart.findOne({ userId: userData._id })

            if (cart && wishlist) {
                cartcount = cart.products.length
                wishlistcount = wishlist.products.length
                wishlistc = wishlist.products

                res.render('product', {
                    productData,
                    relate,
                    userData,
                    cartcount,
                    wishlistcount,
                    wishlistc
                })
            } else if (cart) {
                cartcount = cart.products.length
                res.render('product', {
                    productData,
                    relate,
                    userData,
                    cartcount,
                    wishlistcount,
                    wishlistc
                })
            } else if (wishlist) {
                wishlistcount = wishlist.products.length
                wishlistc = wishlist.products
                res.render('product', {
                    productData,
                    relate,
                    userData,
                    cartcount,
                    wishlistcount,
                    wishlistc
                })
            } else {
                wishlistc = wishlist.products
                res.render('product', {
                    productData,
                    relate,
                    userData,
                    cartcount,
                    wishlistcount,
                    wishlistc
                })
            }
        } else {
            res.render('product', {
                productData,
                relate,
                userData: undefined,
                cartcount,
                wishlistcount,
                wishlistc
            })
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


exports.getShop = async(req, res, next) => {
    try {
        if (req.session.user_id) {

            const category = await Category.find({})
            const userData = await User.findById({ _id: req.session.user_id })
            const cart = await Cart.findOne({ userId: userData._id })
            const wishlist = await Wishlist.findOne({ userId: userData._id })
            let wishlistcount = 0
            let cartcount = 0
            let wishlistc = [0]
            if (cart && wishlist) {
                cartcount = cart.products.length
                wishlistcount = wishlist.products.length
                wishlistc = wishlist.products
                res.render('shop', {
                    userData,

                    category,
                    cartcount,
                    wishlistcount,

                    wishlistc
                })
            } else if (cart) {
                cartcount = cart.products.length
                res.render('shop', {
                    userData,

                    category,
                    cartcount,
                    wishlistcount,

                    wishlistc
                })
            } else if (wishlist) {
                wishlistcount = wishlist.products.length
                wishlistc = wishlist.products
                res.render('shop', {
                    userData,

                    category,
                    cartcount,
                    wishlistcount,

                    wishlistc
                })
            } else {
                res.render('shop', {
                    userData,

                    category,
                    cartcount,
                    wishlistcount,

                    wishlistc
                })
            }
        } else {

            var page = 1
            if (req.query.page) {
                page = req.query.page
            }

            const limit = 4

            const productData = await Products.find({}).limit(limit * 1).skip((page - 1) * limit).exec()

            const count = await Products.find({}).countDocuments()
            const category = await Category.find({})
            let wishlistc = [0]
            res.render('shop', {

                category,

                wishlistc
            })
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


exports.addReview = async(req, res, next) => {
    try {
        if (req.session.user_id) {
            console.log("reviee")
            const review = req.body.review
            const productId = req.body.reviewid
            const userData = await User.findById({ _id: req.session.user_id })
            const rating = req.body.rate

            const existData = await Order.find({
                userId: req.session.user_id,
                products: {
                    $elemMatch: {
                        productId: productId
                    }
                },
                orderStatus: "Delivered"
            });


            if (existData.length > 0) {
                const reviewData = await Products.findByIdAndUpdate({ _id: productId }, { $push: { reviews: { username: userData.name, rating: rating, comment: review } } })

                const productData = await Products.findById({ _id: productId })
                let reviewss = productData.reviews
                let ratingg = reviewss.map(reviews => reviews.rating)
                let sum = ratingg.reduce((sum, num) => sum + Number(num), 0)
                let average = Number((sum / ratingg.length).toFixed(1))
                if (average > 5) {
                    average = 5
                }
                const addRating = await Products.findByIdAndUpdate({ _id: productId }, { $set: { rating: average } })


                res.json({ success: true })
            } else {
                res.json({ success: false })
            }


        } else {
            res.json({ success: 'signin' })
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}




//Adminside Product Controller

exports.getAdd = async(req, res, next) => {
    try {
        const Categories = await Category.find({ __v: 0 })
        res.render('addnewproduct', { categories: Categories })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


exports.getProduct = async(req, res, next) => {
    try {
        var search = ''
        if (req.query.search) {
            search = req.query.search
        }
        const category_name = await Category.find({}, { _id: 1 })
        const values = category_name.map(category => category._id)

        const productData = await Products.find({
            category: { $in: values },
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                { brand: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        }).populate('category')

        const categories = await Category.find({ __v: 0 })

        res.render('products', { products: productData, category: categories })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}





exports.addProduct = async(req, res, next) => {
    try {
        const name = req.body.name
        const brand = req.body.brand
        const grossprice = req.body.grossprice
        const offerprice = req.body.offerprice
        const categories = req.body.category
        const stock = req.body.stock
        const description = req.body.description
        const size = req.body.measure
        const color = req.body.color


        let imageId = [];

        const cropWidth = 1100;
        const cropHeight = 1467;

        for (let i = 0; i < req.files.length; i++) {
            const imagePath = path.join(__dirname, '../public/products_img', req.files[i].filename);
            const croppedImagePath = path.join(__dirname, '../public/products_img', 'address_' + req.files[i].filename);

            // Load the image using sharp
            const image = sharp(imagePath);

            // Convert the image to JPEG format with higher quality
            await image
                .jpeg({ quality: 90 })
                .resize(cropWidth, cropHeight, { fit: 'cover' })
                .toFile(croppedImagePath);

            // Add the cropped image to the imageId array
            imageId.push('address_' + req.files[i].filename);

            try {
                // Change the file permissions to allow deletion
                fs.chmodSync(imagePath, 0o777);

                // Delete the original WebP file
                fs.unlinkSync(imagePath);
            } catch (err) {
                console.log(err);
            }
        }

        const unique = await Products.findOne({ name: { $regex: name, $options: 'i' } })

        if (!unique) {
            const product = new Products({
                name: name,
                brand: brand,
                grossPrice: grossprice,
                offerPrice: offerprice,
                category: categories,
                stock: stock,
                description: description,
                image: imageId,
                size: size,
                color: color
            })

            const productData = await product.save()

            res.redirect('/admin/products')

        } else {
            console.log("already exist ")
            res.redirect('/admin/products')
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


exports.aboutProduct = async(req, res, next) => {
    try {
        const id = req.query.id
        const productData = await Products.findById({ _id: id }).populate('category')
        const Categories = await Category.find({ __v: 0 })
        res.render('aboutproduct', { product: productData, categories: Categories })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.updateProduct = async(req, res, next) => {
    try {
        const product = await Products.findById({
            _id: req.body.productId
        });
        let imageIds = product.image || [];
        const newImageIds = req.files.map((file) => file.filename);

        // Check the number of existing images
        const existingImagesCount = imageIds.length;

        // Maximum number of images allowed
        const maxImages = 6;

        // Append or remove the new image IDs based on the number of existing images
        if (existingImagesCount < maxImages) {
            imageIds = [...imageIds, ...newImageIds];
        } else {
            // Remove the oldest image and append the new image IDs
            imageIds = [...imageIds.slice(1), ...newImageIds];
        }

        const categoryData = await Category.findById({ _id: req.body.category })
            // Update the product data in the database with the updated image array
        const productData = await Products.findByIdAndUpdate({ _id: req.body.productId }, {
            $set: {
                name: req.body.name,
                brand: req.body.brand,
                grossPrice: req.body.grossprice,
                offerPrice: req.body.offerprice,
                stock: req.body.stock,
                description: req.body.description,
                category: categoryData._id,
                size: req.body.size,
                image: imageIds,
            },
        });

        res.redirect("/admin/products");
    } catch (error) {
        console.log(error.message)
        next(error.message);;;
    }
};



exports.removeProduct = async(req, res, next) => {
    try {
        const id = req.query.id
        const deleteData = await Products.deleteOne({ _id: id })
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}


exports.removeImage = async(req, res, next) => {
    try {
        const path = require('path');
        const image = req.params.image;
        const imagePath = path.join(__dirname, '..', 'public', 'products_img', image);
        fs.unlink(imagePath, (err) => {
            if (err) throw err;
            console.log(`${image} deleted!`);
        });

        const Product = await Products.findOne({ image: { $elemMatch: { $eq: image } } })
        const pullImage = await Products.updateOne({ _id: Product._id }, { $pull: { image: image } })

        res.json({ status: true, Product: Product._id })

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}