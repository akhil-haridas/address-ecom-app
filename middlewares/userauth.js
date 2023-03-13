const User = require('../models/usermodel');

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById({ _id: req.session.user_id })
            if (userData.Active == 0) {
                next()
            } else {
                res.render('signin',{message:'You have been blocked'})
            }
         
        } else {
            res.redirect('/signin')
            
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/')
        } else {
          next()  
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}