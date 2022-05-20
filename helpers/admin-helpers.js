const db=require('../config/connection')
const collection = require("../config/collections");
const { promises } = require('nodemailer/lib/xoauth2');
module.exports={
    doAdminLogin:(adminData)=>{
        return new Promise(async (resolve,reject) =>{
            
             
            
             let admin = await db.get().collection(collection.ADMIN_COLLECTION)
                .findOne({ email: adminData.email });
            console.log(admin)
            
                if(admin){
                    
                    if(adminData.password==admin.password){
                        
                        console.log("admin login success");
                        
                       
                        resolve({status:true,admin})
                    }else{
                        console.log("admin login failed");
                        resolve({status:false})
                        
                        
                    }
                }else{
                    console.log('no admin found')
                    resolve({status:false})
                    
                }
        }

        
        
        )}
    
}