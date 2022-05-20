const db=require('../config/connection')
const collection = require("../config/collections");
module.exports={
    //add product
    addProduct:(product,callback)=>{
        
             db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((result)=>{
                console.log(result)
                callback(result.insertedId)
            })  
    },
    //view product list for admin
    getAllProduct:()=>{

        return new Promise(async(resolve,reject)=>{

            let result=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                       
            resolve(result)

        })
    },//view all detailes of each product



    //category
    //add product category
    addCategory:(cateData)=>{
        
            return new Promise(async(resolve, reject) => {
                await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(cateData).then((response) => {
                    console.log(response)
                    resolve(response.insertedId)
                }).catch((err) => {
                    reject(err)
                })
            })

       
    },
    //get list of all category
    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories)
            
        })
    },
    //brand
    //add brand
    addBrand:(brandData)=>{
        
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.BRAND_COLLECTION).insertOne(brandData).then((response) => {
                console.log(response)
                resolve(response.insertedId)
            }).catch((err) => {
                reject(err)
            })
        })

   
  },//get list of all brand
  getAllBrands: () => {
      return new Promise(async (resolve, reject) => {
          let brands = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
          resolve(brands)
          
      })
  }
}