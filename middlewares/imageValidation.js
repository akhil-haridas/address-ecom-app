const Validator = async(req, res, next) => {
    const maxSize = 1000000; // 1 MB

    if (req.files || req.files.length) {
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];

            if (!file.mimetype.startsWith('image/')) {
                return res.status(400).send('File is not an image');
            }

            const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

            if (!allowedFileTypes.includes(file.mimetype)) {
                return res.status(400).send('Only image files are allowed');
            }

            if (file.size > maxSize) {
                return res.status(400).send(`File size exceeds the limit of ${maxSize / 1000000} MB`);
            }

        }

        next();
    };
}



module.exports = { Validator }