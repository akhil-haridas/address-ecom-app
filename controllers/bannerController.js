const Banner = require('../models/bannermodel')


exports.getBanner = async(req, res, next) => {
    try {
        var search = ''
        if (req.query.search) {
            search = req.query.search
        }
        const bannerData = await Banner.find({
            $or: [
                { title: { $regex: '.*' + search + '.*', $options: 'i' } },
                { description: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        })
        res.render('banners', { banner: bannerData })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getAddBanner = async(req, res, next) => {
    try {
        res.render('addbanner')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.postBanner = async(req, res, next) => {
    try {
        const title = req.body.title
        const description = req.body.description
        const image = req.file.filename
        const unique = await Banner.findOne({
            title: {
                $regex: title,
                $options: 'i'
            }
        })
        if (!unique) {
            const banner = new Banner({
                title: title,
                description: description,
                image: image
            })

            const BannerData = await banner.save()

            res.redirect('/admin/banners')
        } else {
            console.log("already exist")
            res.redirect('/admin/banners')
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getEditBanner = async(req, res, next) => {
    try {
        const id = req.query.id
        const updateBanner = await Banner.findById({ _id: id })
        res.render('editbanner', { banner: updateBanner })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.updateBanner = async(req, res, next) => {
    try {
        const bannerData = await Banner.findByIdAndUpdate({ _id: req.body.banner }, {
            $set: {
                title: req.body.title,
                description: req.body.description,
                image: req.body.banner
            }
        })
        res.redirect('/admin/banners')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.removeBanner = async(req, res, next) => {
    try {
        const id = req.query.id
        const removeData = await Banner.deleteOne({ _id: id })
        res.redirect('/admin/banners')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}