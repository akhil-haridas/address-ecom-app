const Category = require('../models/product_category')
const Products = require('../models/products')


//Category in adminside

exports.filterProducts = async(req, res, next) => {
    try {
        var search = ''
        if (req.body.search) {
            search = req.body.search
        }

        var page = 1
        if (req.body.page) {
            page = req.body.page
        }

        const limit = 9

        const sort = req.body.sort
        const selectedCategories = req.body.categories;

        if (search != '') {

            // Filter the products based on the selected categories
            if (selectedCategories.length > 0) {

                var filteredProducts;
                var totalPages;
                var currentPage = page
                if (sort == 'new') {
                    filteredProducts = await Products.find({
                            $or: [
                                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                            ],
                            category: { $in: selectedCategories }
                        }).sort({ createdAt: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({ category: { $in: selectedCategories } }).countDocuments()
                    totalPages = Math.ceil(count / limit)
                } else
                if (sort == 'low') {
                    filteredProducts = await Products.find({
                            $or: [
                                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                            ],
                            category: { $in: selectedCategories }
                        }).sort({ offerPrice: 1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({ category: { $in: selectedCategories } }).countDocuments()
                    totalPages = Math.ceil(count / limit)
                } else if (sort == 'high') {
                    filteredProducts = await Products.find({
                            $or: [
                                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                            ],
                            category: { $in: selectedCategories }
                        }).sort({ offerPrice: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({ category: { $in: selectedCategories } }).countDocuments()
                    totalPages = Math.ceil(count / limit)
                } else if (sort == 'rate') {
                    filteredProducts = await Products.find({
                            $or: [
                                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                            ],
                            category: { $in: selectedCategories }
                        }).sort({ rating: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({ category: { $in: selectedCategories } }).countDocuments()
                    totalPages = Math.ceil(count / limit)
                } else {
                    filteredProducts = await Products.find({
                            $or: [
                                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                            ],
                            category: { $in: selectedCategories }
                        }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({ category: { $in: selectedCategories } }).countDocuments()

                    totalPages = Math.ceil(count / limit)
                }

                res.json({
                    filteredProducts: filteredProducts,
                    totalPages: totalPages,
                    currentPage: currentPage
                });
            } else {

                var filteredProducts;
                var totalPages;
                var currentPage = page
                if (sort == 'new') {
                    filteredProducts = await Products.find({
                            $or: [
                                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                            ],
                        }).sort({ createdAt: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();
                    const count = await Products.find({}).countDocuments()

                    totalPages = Math.ceil(count / limit)
                } else if (sort == 'low') {
                    filteredProducts = await Products.find({
                            $or: [
                                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                            ],
                        }).sort({ offerPrice: 1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({}).countDocuments()

                    totalPages = Math.ceil(count / limit)
                } else if (sort == 'high') {
                    filteredProducts = await Products.find({
                            $or: [
                                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                            ],
                        }).sort({ offerPrice: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({}).countDocuments()

                    totalPages = Math.ceil(count / limit)
                } else if (sort == 'rate') {
                    filteredProducts = await Products.find({
                            $or: [
                                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                            ],
                        }).sort({ rating: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({}).countDocuments()

                    totalPages = Math.ceil(count / limit)
                } else {
                    filteredProducts = await Products.find({
                            $or: [
                                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { size: { $regex: '.*' + search + '.*', $options: 'i' } },
                                { color: { $regex: '.*' + search + '.*', $options: 'i' } }
                            ],
                        }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({}).countDocuments()

                    totalPages = Math.ceil(count / limit)
                }

                res.json({
                    filteredProducts: filteredProducts,
                    totalPages: totalPages,
                    currentPage: currentPage
                });
            }
        } else {
            // Filter the products based on the selected categories
            if (selectedCategories.length > 0) {
                var filteredProducts;
                var totalPages;
                var currentPage = page
                if (sort == 'new') {
                    filteredProducts = await Products.find({ category: { $in: selectedCategories } }).sort({ createdAt: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({ category: { $in: selectedCategories } }).countDocuments()

                    totalPages = Math.ceil(count / limit)
                } else if (sort == 'low') {
                    filteredProducts = await Products.find({ category: { $in: selectedCategories } }).sort({ offerPrice: 1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({ category: { $in: selectedCategories } }).countDocuments()

                    totalPages = Math.ceil(count / limit)
                } else if (sort == 'high') {
                    filteredProducts = await Products.find({ category: { $in: selectedCategories } }).sort({ offerPrice: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({ category: { $in: selectedCategories } }).countDocuments()

                    totalPages = Math.ceil(count / limit)
                } else if (sort == 'rate') {
                    filteredProducts = await Products.find({ category: { $in: selectedCategories } }).sort({ rating: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({ category: { $in: selectedCategories } }).countDocuments()

                    totalPages = Math.ceil(count / limit)
                } else {
                    filteredProducts = await Products.find({ category: { $in: selectedCategories } }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();

                    const count = await Products.find({ category: { $in: selectedCategories } }).countDocuments()

                    totalPages = Math.ceil(count / limit)
                }

                res.json({
                    filteredProducts: filteredProducts,
                    totalPages: totalPages,
                    currentPage: currentPage
                });
            } else {
                var filteredProducts;
                var totalPages;
                var currentPage = page;

                if (sort == 'new') {
                    filteredProducts = await Products.find({}).sort({ createdAt: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();
                    const count = await Products.find({}).countDocuments()
                    totalPages = Math.ceil(count / limit)
                } else if (sort == 'low') {
                    filteredProducts = await Products.find({}).sort({ offerPrice: 1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();
                    const count = await Products.find({}).countDocuments()

                    totalPages = Math.ceil(count / limit)
                } else if (sort == 'high') {
                    filteredProducts = await Products.find({}).sort({ offerPrice: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();
                    const count = await Products.find({}).countDocuments()

                    totalPages = Math.ceil(count / limit)
                } else if (sort == 'rate') {
                    filteredProducts = await Products.find({}).sort({ rating: -1 }).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();
                    const count = await Products.find({}).countDocuments()

                    totalPages = Math.ceil(count / limit)
                } else {
                    filteredProducts = await Products.find({}).limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();
                    const count = await Products.find({}).countDocuments()

                    totalPages = Math.ceil(count / limit)
                }

                res.json({
                    filteredProducts: filteredProducts,
                    totalPages: totalPages,
                    currentPage: currentPage
                });
            }
        }


    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getCat = async(req, res, next) => {
    try {
        var search = ''
        if (req.query.search) {
            search = req.query.search
        }
        const categoryData = await Category.find({
            __v: 0,
            $or: [
                { category: { $regex: '.*' + search + '.*', $options: 'i' } },
                { description: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        })
        res.render('category', { category: categoryData })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getAddcat = async(req, res, next) => {
    try {
        res.render('addcategory')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.postAddcat = async(req, res, next) => {
    try {
        const name = req.body.name
        const description = req.body.description
        const image = req.file.filename

        const unique = await Category.findOne({ category: { $regex: name, $options: 'i' } })
        console.log(unique, "hihihi")
        if (!unique) {
            const category = new Category({
                category: name,
                description: description,
                image: image
            })

            const categoryData = await category.save()
            res.redirect('/admin/category')
        } else {
            console.log('already exist')
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.removeCat = async(req, res, next) => {
    try {

        const id = req.query.id
        const deleteData = await Category.deleteOne({ _id: id })
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }
    F

}


exports.selectedCategory = async(req, res, next) => {
    try {
        const number = req.params.number
        res.json({ number: number })
    } catch (error) {
        console.log(error.message)
        next(error.message)
    }
}