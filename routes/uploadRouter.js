const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({
    destination: (req,files,cb) => {
        cb(null, 'public/images');
    },
    filename: (req,files,cb) => {
        cb(null, files.originalname)
    }
})

const imageFileFilter = (req,files,cb) => {
    if (!files.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can only upload image files!'), false)
    }
    else {
        cb(null, true)
    }
}

const upload = multer({storage: storage, fileFilter: imageFileFilter})

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json())

uploadRouter.route('/')
.options(cors.corsWithOptions, (req,res) => {
    res.sendStatus(200)
})
    .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /imageUpload');
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.array('imageFile',1), (req,res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(req.files);
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /imageUpload');
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
        res.statusCode = 403;
        res.end('DELETE operation not supported on /imageUpload');
    })


module.exports = uploadRouter;