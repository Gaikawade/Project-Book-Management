const aws = require('aws-sdk');
// const { create } = require('../models/bookModel');

aws.config.update(
    {
        accessKeyId: 'AKIAY3L35MCRVFM24Q7U',
        secretAccessKey: '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',
        region: 'ap-south-1',
    }
)

let uploadFile = async (file) => {
    return new Promise((resolve, reject) => {
        const s3 = new aws.S3({apiVersion: '2006-03-01'});
        const params = {
            ACL: 'public-read',
            Bucket: 'classroom-training-bucket',
            Key: 'file/' + file.originalname,
            Body: file.buffer
        }
        s3.upload(params, function (err, data){
            if (err) {
                return reject({'error': err});
            }
            console.log(data);
            console.log('File uploaded successfully');
            return resolve(data.Location);
        })
    })
}

const createAws = async function (req,res){
    try{
        let files = req.files;
        if(files && files.length > 0){
            let uploadedFileURL = await uploadFile(files[0]);
            res.status(201).send({message: 'File uploaded successfully', data: uploadedFileURL});
        }else{
            res.status(400).send({message: 'File not found'});
        }
    }
    catch(err){
        res.status(500).send({status: false, message: err.message });
    }
}

module.exports = {createAws};