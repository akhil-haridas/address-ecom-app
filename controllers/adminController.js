const User = require('../models/usermodel')
const Orders = require('../models/ordermodel')
require('dotenv').config();

exports.getLogin = async (req, res, next) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.adminPost = async (req, res, next) => {
    try {
        // Extract email and password from request body
        const email = req.body.email;
        const password = req.body.password;


        const adminMail = process.env.ADMIN_MAIL
        const adminPass = process.env.ADMIN_PASS

        if (email === adminMail) {
            // Check if password is correct
            if (password === adminPass) {
                // Set admin ID in session
                req.session.admin = adminMail;
                // Redirect to admin home page
                res.redirect('/admin/home');
            } else {
                // Render login page with invalid password message
                res.render('login', { message: 'Invalid Password' });
            }
        } else {
            // Render login page with invalid username and password message
            res.render('login', { message: 'Username and Password Invalid' });
        }
    } catch (error) {
        // Handle errors
        console.log(error.message);
        next(error.message);
    }
};


exports.getHome = async (req, res, next) => {
    try {
        const categoryWise = await Orders.aggregate([{
            $match: { orderStatus: "Delivered" } // filter only the delivered orders
        },
        { $unwind: "$products" }, // unwind the products array
        {
            $lookup: { // join with the products collection to get the category of each product
                from: "products",
                localField: "products.productId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" }, // unwind the product array
        {
            $group: { // group by category and sum the total sale amount
                _id: "$product.category",
                totalSale: { $sum: "$product.offerPrice" }
            }
        },
        { $sort: { "_id": 1 } } // sort by category name in ascending order
        ]);

        const totalOrders = await Orders.countDocuments();
        const paymentMethodWise = await Orders.aggregate([{
            $match: {
                orderStatus: "Delivered"
            }
        },
        {
            $group: {
                _id: "$paymentMethod",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                paymentMethod: "$_id",
                percentage: {
                    $multiply: [
                        { $divide: ["$count", totalOrders] },
                        100
                    ]
                }
            }
        },
        {
            $sort: {
                paymentMethod: 1
            }
        }
        ]);

        // Loop through the paymentMethodWise array and round off the percentage value
        // Loop through the paymentMethodWise array and round off percentage value
        let sum = 0;

        for (let i = 0; i < paymentMethodWise.length; i++) {
            paymentMethodWise[i].percentage = Math.floor(paymentMethodWise[i].percentage || 0);
            sum += paymentMethodWise[i].percentage;
        }

        // Prevent crash when there are no orders
        if (paymentMethodWise.length > 0) {
            paymentMethodWise[paymentMethodWise.length - 1].percentage += (100 - sum);
        }


        const weeklySales = await Orders.aggregate([{
            $match: {
                createdAt: {
                    $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) // filter orders delivered in the last 7 days
                },
                orderStatus: "Delivered" // add this stage to filter only delivered orders
            }
        },
        {
            $group: {
                _id: {
                    $dayOfWeek: "$createdAt" // group orders by the day of the week
                },
                totalAmount: {
                    $sum: {
                        $add: ["$total", "$walletAmount"] // calculate the total amount of each day, including wallet amount
                    }
                }
            }
        },
        {
            $sort: {
                _id: 1 // sort the results by the day of the week (1 is Sunday, 7 is Saturday)
            }
        }
        ]);


        let barChart = [0, 0, 0, 0, 0, 0, 0];

        weeklySales.forEach((item, index) => {
            barChart[index] = item.totalAmount || 0;
        });
        let donutChart = [0, 0, 0];

        paymentMethodWise.forEach((item, index) => {
            donutChart[index] = item?.percentage || 0;
        });
        let pieChart = [0, 0, 0, 0, 0];

        categoryWise.forEach((category, index) => {
            pieChart[index] = category.totalSale || 0;
        });
        const ordercount = await Orders.find({}).count()
        const custData = await User.find({}).count()
        const totalData = await Orders.aggregate([{
            $match: {
                orderStatus: "Delivered"
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$total"
                }
            }
        }
        ]);

        const orderData = await Orders.find({}).sort({ Date: -1 }).limit(10)

        res.render('dashboard', {
            order: ordercount,
            customer: custData,
            sale: totalData.length ? totalData : [{ total: 0 }],
            recent: orderData,
            barChart,
            donutChart,
            pieChart
        })
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}

exports.getLogout = async (req, res, next) => {
    try {
        req.session.destroy()
        res.redirect('/admin/login')
    } catch (error) {
        console.log(error.message)
        next(error.message);;
    }

}