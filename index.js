//requiring database
const mongoose = require('mongoose')
require('dotenv').config();
mongoose.set('strictQuery', false)

mongoose
  .connect(process.env.MONGOOSE_LINK)
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });

const path = require('path')
const express = require('express')


//creating port
const port = process.env.PORT || 8000
const router = express()
const session = require('express-session')



router.use(function(req, res, next) {
    res.set('Cache-control', 'no-store')
    next()
})



//for user routes...
const userRoute = require('./routes/userroute')
router.use('/', userRoute)



//for admin route
const admin_route = require('./routes/adminroute')
router.use('/admin', admin_route)
router.use(express.static(path.join(__dirname, 'public')))




//404 error
router.set('view engine', 'ejs')
router.set('views', './views')

router.use((req, res, next) => {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
});

// Handle errors
router.use((error, req, res, next) => {
    if (error.status === 404) {
        res.status(404).render('404', { errorMessage: error });
    } else {
        res.status(500).render('500', { errorMessage: error });
    }
});

//Server Running
router.listen(port, () => {
    console.log(`router is running on port ${port}`)
})
