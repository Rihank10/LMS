'use strict'
const { body, check } = require('express-validator');
var bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const userModel = require('../models/user');

const jwt = require('jsonwebtoken');
const secret = require('../config/auth.config');
const { response } = require('express');
const sequelize = require('../config/database');
const config = require('../config/database');
const { DataTypes, Sequelize, QueryTypes, Model } = require('sequelize');
const { raw } = require('body-parser')





class userController {

    register(req, res, results) {
        const errors = validationResult(req);
        let response = {};
        if (!errors.isEmpty()) {
            response.status = 'failure';
            response.message = 'Errors';
            response["errors"] = errors.errors;
            res.json(response);
        }
        let email = req.body.email;
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);
        userModel.findOne({
            where: {
                email: email
            }
        }).then(user => {
            if (user == null) {
                userModel.create({
                    "fullName": req.body.fullName,
                    "email": req.body.email,
                    "password": hash,
                    "is_active": req.body.is_active,
                    "usertype": req.body.usertype
                }).then(
                    (user) => {
                        console.log(user);
                        response.errors = [];
                        response.status = "success";
                        response.message = "User registered successfully";
                        res.json(response);
                    }
                )
            }
            else {
                response.errors = [];
                response.status = "failure";
                response.message = "user already exist";
                res.json(response);
            }
        })
    }



    login(req, res) {
        const email = req.body.email;
        const password = req.body.password;
        let response = {};
        userModel.findOne({
            where: {
                email: email
            }
        }).then(async user => {
            if (user != null) {
                await bcrypt.compare(req.body.password, user.password, function (err, results) {

                    if (results) {
                        //token
                        response.status = "Success";
                        response.message = "logged in";
                        response.errors = [];
                        const token = jwt.sign({
                            user: user
                        },
                            secret.secret,
                            { expiresIn: '24h' });
                        response.token = token;
                        res.json(response);
                    }
                    else {
                        response.status = "failure";
                        response.message = "invalid credentials";
                        response.errors = [];
                        response.token = [];
                        res.json(response)
                    }
                });
            }
            else {
                response.status = "failure";
                response.message = "user not exists";
                response.errors = [];
                response.token = [];
                res.json(response);

            }
        })
    }


    ///////////////////////////////////////////////////////

    adduser = async (req, res) => {
        // var salt = bcrypt.genSaltSync(10);
        // var hash = bcrypt.hashSync(req.body.password, salt);

        let body = JSON.parse(req.body.json)
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(body.password, salt);
        let imagepath = ""
        let imagename = ""
        if (req.file) {
            imagepath = req.headers.host + "/images/" + req.file.originalname
            imagename = req.file.originalname
        }

        let data = await config.query(" SELECT * FROM users WHERE email='" + body.email + "' ", { type: QueryTypes.SELECT });

        console.log(data)
        if (data && data.length > 0) {
            if (req.params.id) {



                let data = userModel.update({
                    "fullName": body.fullName,
                    "email": body.email,
                    "password": hash,
                    "is_active": body.is_active,
                    "usertype": body.usertype,
                    "updatedAt": sequelize.fn('NOW'),
                    "userimagepath": imagepath,
                    "userimage": imagename

                },
                    {
                        where: {
                            "id": req.params.id
                        }
                    }).then(
                        () => {
                            response.status = "success";
                            response.message = "details";
                            response.errors = [];
                            res.json(response);

                        }
                    )

            } else {
                response.status = "failed";
                response.message = "already exist";
                response.errors = [];
                res.json(response);

            }


        } else {


            userModel.create({

                "fullName": body.fullName,
                "email": body.email,
                "password": hash,
                "is_active": 1,
                "usertype": 2,
                "updatedAt": null,
                "userimagepath": imagepath,
                "userimage": imagename


            }).then(
                () => {
                    response.status = "success";
                    response.message = "details";
                    response.errors = [];
                    res.json(response);

                }
            )

        }




    }


    updateuser = async (req, res) => {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);
        let data = userModel.update({
            "fullName": req.body.fullName,
            "email": req.body.email,
            "password": hash,
            "is_active": req.body.is_active,
            "usertype": req.body.usertype,
            "updatedAt": sequelize.fn('NOW')

        },
            {
                where: {
                    "id": req.params.id
                }
            }).then(
                () => {
                    response.status = "success";
                    response.message = "details";
                    response.errors = [];
                    res.json(response);

                }
            )
    }



    getuserbyID = async (req, res) => {

        userModel.findOne({
            where: {
                "id": req.params.id,
            },
            attributes: { exclude: ['password'] }

        }).then((data) => {
            if (data) {
                response.status = "success";

            } else {
                response.status = "not found";

            }

            response.messaage = "User data";
            response.data = data;
            response.errors = [];
            res.json(response)
        })
    }


    getalluser = async (req, res) => {
        userModel.findAll({ attributes: { exclude: ['password'] } })
            .then((data) => {
                response.status = "success";
                response.message = "all leads";
                response.data = data;
                response.errors = [];
                res.json(response);
            });

    }



    deleteuser = async (req, res) => {
        let data = await userModel.update({
            "is_active": 0,
            "updatedAt": sequelize.fn('NOW')
        },
            {
                where: {
                    "id": req.params.id
                }
            }).then((data) => {
                response.status = "success";
                response.message = "deleted";
                response.data = data;
                response.errors = [];
                res.json(response);
            });
    }





    // deleteuser= async (req, res)=>{
    //     userModel.destroy({
    //         where:{
    //             "id":req.params.id,
    //         }

    //     }).then((data) => {
    //         response.status="success";
    //         response.messaage="deleted succesfully";
    //         response.data= data;
    //         response.errors=[];
    //         res.json(response)
    //     })
    // }
    ////////////////////////////////////////////////////




    ///////////////////////////////////////////////////////
    async getUserById(req, res) {
        const token = req.headers.authorization;
        var decodedToken = await jwt.verify(token, secret.secret);
        const userId = decodedToken.user.id;
        if (req.body.userId && req.body.userId !== userId) {
            response.status = "failure";
            response.message = "invalid user";
            response.errors = [];
            res.json(response);
        } else {
            console.log(userId);
        }
        userModel.findOne({
            where: {
                "id": req.params.userId,
            }
        }).then((data) => {
            response.status = "success";
            response.message = "User's details";
            response.data = data;
            response.errors = [];
            res.json(response);
        });
    }
}

module.exports = new userController;