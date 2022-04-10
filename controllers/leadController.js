'use strict'
const leadModel = require('../models/lead');
const userModel = require('../models/user');
const leadstatusModel = require('../models/leadstatus');
const { response } = require('express');
//const { config } = require('dotenv');
//const Sequelize = require("sequelize");
const config = require('../config/database');
const { DataTypes, Sequelize, QueryTypes, Model } = require('sequelize');
//const lead = require('../models/lead');
//const leadstatus = require('../models/leadstatus');
//const junctionuserlead = require('../models/junctionuserlead');
const { raw } = require('body-parser');
const excelJS = require("exceljs");
const readXlsxFile = require("read-excel-file/node");




class leadController {

    async getleads(req, res) {

        if (req.params.id) {
            // let leaduserdata= await junctionuserlead.findAll({where:{
            //     "userid":req.params.id,
            // },attributes: { exclude: ['id','userid','createdAt','updatedAt'] }})
            // console.log(leaduserdata)
            config.query("SELECT * FROM leads WHERE id IN (SELECT leadid FROM junctionuserlead where userid=" + req.params.id + " AND createdAt >= CURRENT_DATE) order by companyName", { type: QueryTypes.SELECT })
                // console.log(datainsert)
                // leadModel.findAll({where:{
                // "userId":req.params.id,
                //}})
                .then((data) => {
                    response.status = "success";
                    response.message = "all leads";
                    response.data = data;
                    response.errors = [];
                    res.json(response);
                });

        } else {
            leadModel.findAll()
                .then((data) => {
                    response.status = "success";
                    response.message = "No Data";
                    response.data = data;
                    response.errors = [];
                    res.json(response);
                });

        }


    }
    ////////////////////////////////////////////////////////////////
    async allleads(req, res) {
        leadModel.findAll({
            order: [
                ['companyName', 'ASC'],
            ]
        })
            .then((data) => {
                response.status = "success";
                response.message = "all leads";
                response.data = data;
                response.errors = [];
                res.json(response);
            });
    }




    ///////////////////////////////////////////////////////////////
    async getleadsByuser(req, res) {
        if (req.params.id) {
            leadModel.findAll({
                where: {
                    "id": req.params.id,
                }
            })
                .then((data) => {
                    response.status = "success";
                    response.message = "all leads";
                    response.data = data;
                    response.errors = [];
                    res.json(response);
                });

        } else {
            leadModel.findAll()
                .then((data) => {
                    response.status = "success";
                    response.message = "all leads";
                    response.data = data;
                    response.errors = [];
                    res.json(response);
                });

        }


    }
    ///////////////////////////////////////////////////////////////
    async getleadstatus(req, res) {
        config.query('select * from Leadms.leadstatus', { type: QueryTypes.SELECT })

            .then((data) => {
                response.status = "success";
                response.message = "all leadstatus";
                response.data = data;
                response.errors = [];
                res.json(response);
            });

    }
    //////////////////////////////////////////////////////////////   
    async getleadbyID(req, res) {

        leadModel.findOne({
            where: {
                "id": req.params.id,
            }
        }).then((data) => {
            response.status = "success";
            response.messaage = "User data";
            response.data = data;
            response.errors = [];
            res.json(response)
        })
    }





    async getrandom(req, res) {
        //const {address_1,contactNo,contactperson} =req.query


        //let qry="SELECT address_1,contactNo,contactperson FROM leadms_rihan.leads ORDER BY RAND() LIMIT 1";
        leadModel.findAll({
            order: Sequelize.literal('rand()'), limit: 1,
            attributes: ['address_1', 'contactNo', 'contactperson']
        }).then((data) => {
            response.status = "success";
            response.messaage = "User data";
            response.data = data;
            response.errors = [];
            res.json(response)
        })
    }


    // async getdash(req,res){
    //     let data = await leadModel.findAll({
    //         attribute:[

    //             'companyName',
    //             'contactperson',
    //             'contactNo',
    //             //[Sequelize.fn('count',Sequelize.col('id')),'totalCount']
    //         ]
    //     });
    //     let response ={

    //         data:data
    //     }
    //     console.log("result",response);
    //     res.status(200).json(response);
    // }


    getcount = async (req, res) => {
        let data = await config.query('select companyName from Leadms.leads where id=1', { type: QueryTypes.SELECT });
        let response = {
            data
        }
        res.status(200).json(response);
    }

    ////////////////////////////////////////////////////////////////////////////////////////  

    getallcount1 = async (req, res) => {
        let data
        if (req.params.userId) {
            data = await config.query("SELECT (SELECT count(*) FROM leads WHERE isAnswer=1 AND userId=" + req.params.userId + " AND createdAt >= CURRENT_DATE ) as isAnswer , (SELECT count(*) FROM leads WHERE isNoAnswer=1 AND userId=" + req.params.userId + " AND createdAt >= CURRENT_DATE ) as isNoAnswer,(SELECT count(*) FROM leads WHERE isInvalid=1 AND userId=" + req.params.userId + " AND createdAt >= CURRENT_DATE ) as isInvalid FROM `leads`limit 1", { type: QueryTypes.SELECT });


        } else {
            data = await config.query("SELECT (SELECT count(*) FROM leads WHERE isAnswer=1 AND createdAt >= CURRENT_DATE ) as isAnswer , (SELECT count(*) FROM leads WHERE isNoAnswer=1 AND createdAt >= CURRENT_DATE ) as isNoAnswer,(SELECT count(*) FROM leads WHERE isInvalid=1 AND createdAt >= CURRENT_DATE ) as isInvalid FROM `leads`limit 1", { type: QueryTypes.SELECT });


        }



        response.status = "success";
        response.messaage = "counting";
        response.data = data;
        response.errors = [];
        res.json(response)
    }

    ///////////////////////////////////////////////////////////////////////////////////"id":req.params.id,
    getsearchbyID = async (req, res) => {
        if (req.params.id === "0") {
            leadModel.findAll()
                .then((data) => {
                    response.status = "success";
                    response.message = "all leads";
                    response.data = data;
                    response.errors = [];
                    res.json(response);
                });

        } else if (req.params.id === "1") {
            let data = await config.query('select * from Leadms.leads where isAnswer=1 ', { type: QueryTypes.SELECT });
            let response = {
                data
            }
            res.status(200).json(response);

        } else if (req.params.id === "2") {
            let data = await config.query('select * from Leadms.leads where isNoAnswer=1', { type: QueryTypes.SELECT });
            let response = {
                data
            }
            res.status(200).json(response);

        } else if (req.params.id === "3") {
            let data = await config.query('select * from Leadms.leads where isInvalid=1', { type: QueryTypes.SELECT });
            let response = {
                data
            }
            res.status(200).json(response);
        }

    }

    ////////////////////////////////////////////////////////////////////////////////////// 

    getgraph = async (req, res) => {

        var today = new Date().toISOString().substring(0, 10) + " ";
        //	var time=["12:00:00", "15:00:00", "18:00:00", "21:00:00","23:59:59","03:00:00","06:00:00","09:00:00" ]
        var time = ["12:00:00", "15:00:00", "18:00:00", "21:00:00", "23:59:59", "03:00:00", "06:00:00", "09:00:00"]
        var series = []
        for (let i = 0; i < time.length; i++) {
            if ((i + 1) < time.length) {
                var start = Date.parse('1970-01-01T' + time[i]);
                var end = Date.parse('1970-01-01T' + time[i + 1]);
                var query = ""
                if (start < end) {
                    query = "SELECT COUNT(*) as leads FROM Leadms.leads WHERE createdAt >= '" + today + time[i] + "' AND createdAt <= '" + today + time[i + 1] + "'";
                } else {
                    query = "SELECT COUNT(*) as leads FROM Leadms.leads WHERE createdAt >= '" + today + time[i + 1] + "' AND createdAt <= '" + today + time[i] + "'";
                }
                if (req.params.userId) {
                    query = query + " AND userId=" + req.params.userId

                }

                let data = await config.query(query, { type: QueryTypes.SELECT });
                series.push(data[0]["leads"])
            }
        }
        var timesToDisplay = ["12pm", "3pm", "6pm", "9pm", "12am", "3am", "6am", "9am"]
        let dataresponse = {
            series, "labels": timesToDisplay
        }
        response.status = "success";
        response.messaage = "graph";
        response.data = dataresponse;
        response.errors = [];
        res.json(response)
    }





    // getgraph= async(req,res)=>{
    // 	var today = new Date().toISOString().substring(0, 10) + " ";
    // 	var lables=["12:00:00", "15:00:00", "18:00:00", "21:00:00","23:59:59","03:00:00","06:00:00","09:00:00" ]
    //     var series=[]
    // 	for(let i=0;i<lables.length;i++){
    // 		if((i +1 ) < lables.length){
    // 			var start = Date.parse('1970-01-01T' + lables[i]);
    // 			var end = Date.parse('1970-01-01T' + lables[i + 1]);
    // 			var query = ""
    // 			if(start < end){
    // 			  query = "SELECT COUNT(*) as leads FROM Leadms.leads WHERE createdAt >= '"+ today+ lables[i] +"' AND createdAt <= '"+ today + lables[i+1]  +"'";
    // 			}else{
    // 			  query = "SELECT COUNT(*) as leads FROM Leadms.leads WHERE createdAt >= '"+ today + lables[i+1] +"' AND createdAt <= '"+ today + lables[i]  +"'";
    // 			}
    // 			let data= await config.query(query,{ type: QueryTypes.SELECT});
    // 			series.push(data[0]["series"])
    // 		}
    // 	}
    // var timesToDisplay = ["12pm","3pm","6pm","9pm","12am","3am","6am","9am"]
    //     let response={
    //          series,"lables": timesToDisplay
    //      }    
    //     res.status(200).json(response);
    // }

    // getgraph= async(req,res)=>{
    // 	var today = new Date().toISOString().substring(0, 10) + " ";
    // 	var time=["12:00:00", "15:00:00", "18:00:00", "21:00:00","23:59:59","03:00:00","06:00:00","09:00:00" ]
    //     var leads=[]
    // 	for(let i=0;i<time.length;i++){
    // 		if((i +1 ) < time.length){
    // 			var start = Date.parse('1970-01-01T' + time[i]);
    // 			var end = Date.parse('1970-01-01T' + time[i + 1]);
    // 			var query = ""
    // 			if(start < end){
    // 			  query = "SELECT COUNT(*) as leads FROM Leadms.leads WHERE createdAt >= '"+ today+ time[i] +"' AND createdAt <= '"+ today + time[i+1]  +"'";
    // 			}else{
    // 			  query = "SELECT COUNT(*) as leads FROM Leadms.leads WHERE createdAt >= '"+ today + time[i+1] +"' AND createdAt <= '"+ today + time[i]  +"'";
    // 			}
    // 			let data= await config.query(query,{ type: QueryTypes.SELECT});
    // 			leads.push(data[0]["leads"])
    // 		}
    // 	}
    // var timesToDisplay = ["12pm","3pm","6pm","9pm","12am","3am","6am","9am"]
    //     let response={
    //          leads,"time": timesToDisplay
    //      }    
    //     res.status(200).json(response);
    // }


    downloadsheet = async (req, res) => {
        const workbook = new excelJS.Workbook();  // Create a new workbook
        const worksheet = workbook.addWorksheet("My leads"); // New Worksheet
        const path = "./files";  // Path to download excel
        // Column for data in excel. key must match data key
        worksheet.columns = [
            { header: "id.", key: "id", width: 10 },
            { header: "companyName", key: "companyName", width: 10 },
            { header: "address_1", key: "address_1", width: 10 },
            { header: "address_2", key: "address_2", width: 10 },
            { header: "address_3", key: "address_3", width: 10 },
            { header: "address_4", key: "address_4", width: 10 },
            { header: "address_5", key: "address_5", width: 10 },
            { header: "postcode", key: "postcode", width: 10 },
            { header: "contactperson", key: "contactperson", width: 10 },
            { header: "email", key: "email", width: 10 },
            { header: "contactNo", key: "contactNo", width: 10 },
            { header: "type", key: "type", width: 10 },
            { header: "supplier", key: "supplier", width: 10 },
            { header: "meter_number", key: "meter_number", width: 10 },
            { header: "usage", key: "usage", width: 10 },
            { header: "createdAt", key: "createdAt", width: 10 },
            { header: "updatedAt", key: "updatedAt", width: 10 },
            { header: "isAnswer", key: "isAnswerr", width: 10 },
            { header: "isNoAnswer", key: "isNoAnswer", width: 10 },
            { header: "isInvalid", key: "isInvalid", width: 10 },
            { header: "comment", key: "comment", width: 10 },
            { header: "profileImage", key: "profileImage", width: 10 },
            { header: "LeadStatus", key: "LeadStatus", width: 10 },
            { header: "imagepath", key: "imagepath", width: 10 },
            { header: "userId", key: "userId", width: 10 },

        ];
        // Looping through User data
        let counter = 1;
        let where = {}
        if (req.params.userId) {
            where = {
                where: {
                    "userId": req.params.userId,
                }
            }

        }
        //console.log(where,req)
        let leads = await leadModel.findAll(where)

        leads.forEach((leadModel) => {
            leadModel.id = counter;
            worksheet.addRow(leadModel); // Add data in worksheet
            counter++;
        });
        // Making first line in excel bold
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });
        try {
            const data = await workbook.xlsx.writeFile(`${path}/leads.xlsx`)
                .then(() => {
                    res.send({
                        status: "success",
                        message: "file successfully downloaded",
                        path: `${path}/leads.xlsx`,
                    });
                });
        } catch (err) {
            res.send({
                status: "error",
                message: "Something went wrong",
            });
        }
    };












    // getallcount2= async(req,res)=>{
    //     let data = await config.query('SELECT')
    //         //result:Sequelize.literal("NOW() - (INTERVAL '15840 MINUTE')"),
    //         where:{
    //             isNoAnswer:'1'
    //         }

    //     });
    //     let response={
    //         data:data

    //     }

    //     res.status(200).json(response);
    // }

    // getallcount3= async(req,res)=>{
    //     let data = await leadModel.findAndCountAll({
    //         //result:Sequelize.literal("NOW() - (INTERVAL '15840 MINUTE')"),
    //         where:{
    //             isInvalid:'1'
    //         }

    //     });
    //     let response={
    //         data:data

    //     }

    //     res.status(200).json(response);
    // }


    updateisAnswer = async (req, res) => {

        let data = await leadModel.update({
            "isAnswer": 1,
            "isNoAnswer": 0,
            "isInvalid": 0
        },
            {
                where: {
                    "id": req.params.id
                }
            })
            .then((data) => {
                response.status = "success";
                response.message = "all leads";
                response.data = data;
                response.errors = [];
                res.json(response);
            });
    }

    updateisNoAnswer = async (req, res) => {

        let data = await leadModel.update({
            "isNoAnswer": 1,
            "isInvalid": 0,
            "isAnswer": 0
        },
            {
                where: {
                    "id": req.params.id
                }
            }).then((data) => {
                response.status = "success";
                response.message = "all leads";
                response.data = data;
                response.errors = [];
                res.json(response);
            });
    }

    updateisInvalid = async (req, res) => {

        let data = await leadModel.update({
            "isInvalid": 1,
            "isAnswer": 0,
            "isNoAnswer": 0

        },
            {
                where: {
                    "id": req.params.id
                }
            }).then((data) => {
                response.status = "success";
                response.message = "all leads";
                response.data = data;
                response.errors = [];
                res.json(response);
            });
    }
    //////////////////////////////////////////////////

    updateleads = async (req, res) => {

        let data = await leadModel.update({
            "comment": req.body.comment,
            "isNoAnswer": 1,
            "updatedAt": req.body.updatedAt

        },
            {
                where: {
                    "id": req.params.id
                }
            }).then((data) => {
                response.status = "success";
                response.message = "all leads";
                response.data = data;
                response.errors = [];
                res.json(response);
            });
    }

    /////////////////////////////////////////////////////////////////////

    updateleadstatus = async (req, res) => {

        let data = await leadModel.update({
            "LeadStatus": req.params.statusid
        },
            {
                where: {
                    "id": req.params.id
                }
            }).then((data) => {
                response.status = "success";
                response.message = "all leads";
                response.data = data;
                response.errors = [];
                res.json(response);
            });
    }


    ////////////////////////////////////////////////////////


    postallrecordleads = async (req, res) => {
        let body = JSON.parse(req.body.json)
        let user = await userModel.findOne({
            where: {
                "id": body.userId,
            }
        })
        if (user) {
            let uploadpath;
            //console.log(req)

            console.log(body)
            let imagepath = ""
            let imagename = ""
            if (req.file) {
                imagepath = req.headers.host + "/images/" + req.file.originalname
                imagename = req.file.originalname
            }
            if (req.params.id) {///////if user id
                let data = leadModel.update({
                    "companyName": body.companyName,
                    "address_1": body.address_1,
                    "address_2": body.address_2,
                    "address_3": body.address_3,
                    "address_4": body.address_4,
                    "address_5": body.address_5,
                    "postCode": body.postCode,
                    "contactperson": body.contactperson,
                    "email": body.email,
                    "contactNo": body.contactNo,
                    "type": body.type,
                    "supplier": body.supplier,
                    "meter_number": body.meter_number,
                    "usage": body.usage,
                    "comment": body.comment,
                    "profileImage": imagename,
                    "imagepath": imagepath,
                    "isAnswer": body.isAnswer,
                    "isNoAnswer": body.isNoAnswer,
                    "isInvalid": body.isInvalid,
                    "userId": body.userId
                },
                    {
                        where: {
                            "id": req.params.id
                        }
                    }).then(
                        () => {
                            response.status = "success";
                            response.message = "details";
                            // response.data = data;
                            response.errors = [];
                            res.json(response);

                        }
                    )

            } else {
                leadModel.create({
                    "companyName": body.companyName,
                    "address_1": body.address_1,
                    "address_2": body.address_2,
                    "address_3": body.address_3,
                    "address_4": body.address_4,
                    "address_5": body.address_5,
                    "postCode": body.postCode,
                    "contactperson": body.contactperson,
                    "email": body.email,
                    "contactNo": body.contactNo,
                    "type": body.type,
                    "supplier": body.supplier,
                    "meter_number": body.meter_number,
                    "usage": body.usage,
                    "comment": body.comment,
                    "profileImage": imagename,
                    "imagepath": imagepath,
                    "isAnswer": body.isAnswer,
                    "isNoAnswer": body.isNoAnswer,
                    "isInvalid": body.isInvalid,
                    "userId": body.userId

                }).then(
                    async (data) => {
                        //INSERT INTO `junctionuserleads` (`id`,`leadid`,`userid`,`createdAt`,`updatedAt`) VALUES (DEFAULT,?,?,?,?);
                        let datainsert = await config.query("INSERT INTO junctionuserlead (`leadid`,`userid`,`createdAt`,`updatedAt`) VALUES (" + data.id + "," + body.userId + ",now(),now())", { type: QueryTypes.INSERT });
                        response.status = "success";
                        response.message = "details";
                        // response.data = data;
                        response.errors = [];
                        res.json(response);

                    }
                )


            }


        } else {
            response.status = "user not found";
            response.message = "details";
            response.errors = [];
            res.json(response);

        }


    }

    ///////////////////////////////////////////////////////////////////////////////

    getprofilebyID = (req, res) => {

        leadModel.findOne({
            where: {
                "id": req.params.id,
            }
        }).then((data) => {
            response.status = "success";
            response.messaage = "User data";
            response.data = data;
            response.errors = [];
            // response["data"]["profileImage"]= req.headers.host + "/images/"+response["data"]["profileImage"]
            res.json(response)
        })
    }

    ////////////////////////////////////////////////////////////////////////////
    deleteleads = async (req, res) => {
        let data = await config.query(" SELECT * FROM junctionuserlead WHERE userid='" + req.params.userId + "' ", { type: QueryTypes.SELECT });
        if (data) {
            leadModel.destroy({
                where: {
                    "id": req.params.id,

                }

            }).then((data) => {
                response.status = "success";
                response.messaage = "deleted succesfully";
                response.data = data;
                response.errors = [];
                res.json(response)
            })
        }
    }


    ///////////////////////////////////////////////////////
    postexcelleads = async (req, res) => {
        let path =
            "files/" + req.file.filename;

        readXlsxFile(path).then((rows) => {

            rows.shift();
            let leads = [];
            rows.forEach((row) => {
                let lead = {
                    "companyName": row[0]==null?"":row[0],
                    "address_1": row[1]==null?"":row[1],
                    "address_2": row[2]==null?"":row[2],
                    "address_3": row[3]==null?"":row[3],
                    "address_4": row[4]==null?"":row[4],
                    "address_5": row[5]==null?"":row[5],
                    "postCode": row[6]==null?"":row[6],
                    "contactperson":row[7]==null?"":row[7] ,
                    "email": row[8]==null?"":row[8],
                    "contactNo": row[9]==null?"":row[9],
                    "type": row[10]==null?"":row[10],
                    "supplier": row[11]==null?"":row[11],
                    "meter_number": row[12]==null?"":row[12],
                    "usage": row[13]==null?"":row[13],
                    "createdAt":row[14]==null?sequelize.fn('NOW'):row[14],
                    "updatedAt":row[15]==null?"":row[15],
                    "comment": "",
                    "profileImage": "",
                    "imagepath": "",
                    "isAnswer": 0,
                    "isNoAnswer": 0,
                    "isInvalid": 0,
                    "userId": row[18]==null?"":row[18]
                };
                leads.push(lead);

                
            });


            //let datainsert = await config.query("INSERT INTO junctionuserlead (`leadid`,`userid`,`createdAt`,`updatedAt`) VALUES (" + data.id + "," + body.userId + ",now(),now())", { type: QueryTypes.INSERT });
            leadModel.bulkCreate(leads,{returning: true})

            
            
            .then(
                (data) => {

                    let values=[];

                    data.forEach(lead => {
                        
                        values.push("(" + lead.id + "," + lead.userId + ",now(),now())")

                    });

                    config.query("INSERT INTO junctionuserlead (`leadid`,`userid`,`createdAt`,`updatedAt`) VALUES " + values.toString(), { type: QueryTypes.INSERT })
                    .then(
                        () => {
                            response.status = "success";
                            response.message = "details";
                            response.errors = [];
                            res.json(response);
            
                        }
                    )

                }
            )
            
            
        })


    }

    //////////////////////////////////////////////////////////////////////////////

    async postleads(req, res) {
        console.log(req.body)
        leadModel.create({
            "companyName": req.body.companyName,
            "address_1": req.body.address_1,
            "address_2": req.body.address_2,
            "address_3": req.body.address_3,
            "address_4": req.body.address_4,
            "address_5": req.body.address_5,
            "postCode": req.body.postCode,
            "contactperson": req.body.contactperson,
            "email": req.body.email,
            "contactNo": req.body.contactNo,
            "type": req.body.type,
            "supplier": req.body.supplier,
            "meter_number": req.body.meter_number,
            "usage": req.body.usage,
            "comment": req.body.comment
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
//////////////////////////////////////////////////////////////////////////////////




module.exports = new leadController;