const mongoose= require('mongoose');


const Auth=mongoose.model('Auth');

const logger= require('./../libs/loggerLib');
const responseLib = require('./../libs/responseLib')
const token = require('./../libs/tokenLib')
const check = require('./../libs/checkLib')

let isAuthorized=(req,res,next)=>{

    if(req.params.authtoken||req.query.authtoken||req.header('authToken')){
        Auth.findOne({authToken:req.params.authtoken||req.query.authtoken||req.header('authToken')},(err,authDetails)=>{
            if(err){
                console.log(err)
        logger.error(err.message, 'AuthorizationMiddleware', 10)
        let apiResponse = responseLib.generate(true, 'Failed To Authorized', 500, null)
        res.send(apiResponse)
            }
            else if(check.isEmpty(authDetails)){
                logger.error('No AuthorizationKey Is Present', 'AuthorizationMiddleware', 10)
        let apiResponse = responseLib.generate(true, 'Invalid Or Expired AuthorizationKey', 404, null)
        res.send(apiResponse)
            }
            else{
                token.verifyClaim(authDetails.authtoken,authDetails.tokenSecret,(err,decoded)=>{
                    if(err){
                        logger.error(err.message, 'Authorization Middleware', 10)
                        let apiResponse = responseLib.generate(true, 'Failed To Authorized', 500, null)
                        res.send(apiResponse)
                    }else{
                        req.user={userId:decoded.data.userId}
                        next();
                    }
                })
            }
        })
    }else{
        logger.error('AuthorizationToken Missing', 'AuthorizationMiddleware', 5)
    let apiResponse = responseLib.generate(true, 'AuthorizationToken Is Missing In Request', 400, null)
    res.send(apiResponse)
    }
}

module.exports={
    isAuthorized:isAuthorized
}

