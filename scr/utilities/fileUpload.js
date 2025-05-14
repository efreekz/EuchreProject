const aws = require("aws-sdk")
const path = require('path');
const fs = require('fs');
const sendResponse = require("./responseHandler");

module.exports = {


    uploadFile: function (req, res) {

        let { key, content } = req.body

        key = key.split(" ").join("-")

        if (!key || !content) {
            res.status(400).json({
                status: 400,
                data: "please provide valid data"
            })
        } else {
            //? AWS Configs 
            const config = {
                signatureVersion: 'v4',
                // Credential:{
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY,
                // },
                region: process.env.S3_REGION,
                // s3ForcePathStyle: true,
            }

            var s3 = new aws.S3(config);
            const BUCKET = process.env.SE_BUKETNAME;
            try {
                const contentType = content;
                const expireSeconds = 60 * 200;

                const bucketParams = {
                    Bucket: BUCKET,
                    Key: key,
                    ContentType: contentType,
                    Expires: expireSeconds,
                };

                bucketParams.ACL = 'public-read';

                const url = s3.getSignedUrl('putObject', bucketParams);

                // console.log("config : ", config)
                // console.log("confbucketParamsig : ", bucketParams)
                console.log(url);

                if (url) {
                    sendResponse(res, 200, url, null)
                } else {
                    sendResponse(res, 400, null, "Unable to generate signed url")

                }
            } catch (error) {

                sendResponse(res, 500, null, "Internal Server Error")
            }
        }
    }
}