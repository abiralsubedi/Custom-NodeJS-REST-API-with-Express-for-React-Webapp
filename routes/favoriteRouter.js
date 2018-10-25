const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorites');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .get(authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .populate('user')
        .populate('dishes')
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json')
            res.json(favorite)
        }, (err) => next(err))

        .catch((err) => next(err));
    })

    .post(authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .then((favorite) => {
            if (favorite) {
                for (var i =0; i<req.body.length; i++) {
                    if (favorite.dishes.indexOf(req.body[i]._id) === -1) {
                        favorite.dishes.push(req.body[i]._id)
                    }
                }
                favorite.save()
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json')
                    res.json(resp)
                }, (err) => next(err))
            }
            else {
                Favorites.create({user: req.user._id, dishes: req.body})
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                }, (err) => next(err))
            }
        })
        
    })

    .put(authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites')
    })

    .delete(authenticate.verifyUser, (req,res,next)=> {
        Favorites.findOneAndRemove({user: req.user._id})
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json')
            res.json(favorite)
        }, (err) => next(err))

        .catch((err) => next(err))
    })

favoriteRouter.route('/:dishId')
    .get(authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites/dishId')
    })

    .post(authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .then((favorite) => {
            if (favorite === null) {
                Favorites.create({user: req.user._id, dishes: req.params.dishId})
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                }, (err)=> next(err))

                .catch((err)=> next(err))
            }
            else {
                if (favorite.dishes.indexOf(req.params.dishId) === -1) {
                    favorite.dishes.push(req.params.dishId)
                    favorite.save()
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json')
                        res.json(favorite)
                    }, (err)=> next(err))

                    .catch((err)=> next(err))
                }
                else {
                    res.statusCode = 403;
                    res.end('This is already your favorite dish')
                }
            }
        })

        
    })

    .put(authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/dishId')
    })

    .delete(authenticate.verifyUser, (req,res,next)=> {
        Favorites.findOne({user: req.user._id})
        .then((favorite) => {
            if (favorite) {
                var index = favorite.dishes.indexOf(req.params.dishId)
                if (index > -1) {
                    favorite.dishes.splice(index,1)
                    favorite.save()
                    .then((resp) => {
                        res.statusCode =200;
                        res.setHeader('Content-Type', 'application/json')
                        res.json(resp)
                    }, (err) => next(err))
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found')
                    err.status = 404;
                    return next(err);
                }
            }
            else {
                err = new Error('Favorite List does not exist')
                err.status = 404;
                return next(err)
            }
        })
    })

module.exports = favoriteRouter;