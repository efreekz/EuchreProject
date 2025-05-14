const { sendResponse } = require("./responseHandler")
const aws = require("aws-sdk")
const path = require('path');
const fs = require('fs');

module.exports = {


  deleteFile: function (fileArray) {
    const config = {
      signatureVersion: 'v4',
      accessKeyId: process.env.S3ACCESSKEYID,
      secretAccessKey: process.env.S3ACCESSSECRET,
      region: process.env.S3REGION,
      s3ForcePathStyle: true,
    }
    var s3 = new aws.S3(config);
    const BUCKET = process.env.S3BUCKET;
    try {
      for (let i = 0; i < fileArray.length; i++) {
        const fileURL = fileArray[i];

        const deleteObjectParams = {
          Bucket: BUCKET,
          Key: decodeURI(fileURL),
        };

        s3.deleteObject(deleteObjectParams, (err, data) => {
          if (err) {
            console.error('Error deleting the object:', err);
          } else {
            console.log('Successfully deleted the object.', fileURL);
            return
            // sendResponse(res, 200,null, "File deleted successfully")
          }
        });
      }
    } catch (error) {
      // sendResponse(res, 500, null, "Internal Server Error")
    }

  }
}








