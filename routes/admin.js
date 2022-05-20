const express = require('express');
const { Result } = require('express-validator');
const router = express.Router();

const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers');
const { response } = require('../app');

let veryfyAdminLogin=(req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('/admin')
  }
}

/* GET Admin page. */
router.get('/', function(req, res, next) {
  
  res.render('admin/login');
});
router.post('/login', function(req, res) {
  adminHelpers.doAdminLogin(req.body).then((response)=>{
    if (response.status) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      res.redirect('/admin/home')

    } else {
      req.session.adminLoggErr = true;
      req.session.logErr
      res.redirect("/admin");
    }
    
  })
  
});
router.get('/home',veryfyAdminLogin,(req,res)=>{
  res.render('admin/home');
})

// view products
router.get('/view-products', function(req, res) {
  productHelpers.getAllProduct().then((products)=>{
    
    console.log(products)
    res.render('admin/view-products',{products});
  })  
  
});
// add products
router.get('/add-products', function(req, res) {
  productHelpers.getAllCategory().then((categories)=>{
    productHelpers.getAllBrands().then((brands)=>{
      res.render('admin/add-products',{brands,categories})
    })
     
  })
  
});
router.post('/add-products', function(req, res) {
   console.log(req.body)
   console.log(req.files)
  
  productHelpers.addProduct(req.body,(id)=>{
    let image1 = req.files.image1
    let image2 = req.files.image2
    let image3 = req.files.image3
    let image4 = req.files.image4
    
     image1.mv('./public/productImages/' + id + 'a.jpg')
     image2.mv('./public/productImages/' + id + 'b.jpg')
     image3.mv('./public/productImages/' + id + 'c.jpg')
     image4.mv('./public/productImages/' + id + 'd.jpg')

       res.redirect('/admin/view-products')
  })
});
//edit products
router.get('/edit-products', function(req, res) {
  
  res.render('admin/edit-products');
});
//view categories
router.get('/view-category',(req,res)=>{
  productHelpers.getAllCategory().then((categories)=>{
     
    
    console.log(categories)
    res.render('admin/view-category',{categories})
  })
  
})
//add category
router.get('/add-category',(req,res)=>{
  res.render('admin/add-category')
})
router.post('/add-category',(req,res)=>{
  console.log(req.body)
  productHelpers.addCategory(req.body).then((id)=>{
    
    let Image = req.files.image
    Image.mv('./public/productImages/'+ id +'.jpg')
    res.redirect('/admin/view-category')
  }).catch((err) => {
    
    res.redirect('/admin/add-category')
  })
})
//barnd
//add nwe brand
router.get('/add-brand',(req,res)=>{
  res.render('admin/add-brand')
})
router.post('/add-brand',(req,res)=>{
  console.log(req.body)
  productHelpers.addBrand(req.body).then((id)=>{
    
    let Logo = req.files.logo
    Logo.mv('./public/productImages/'+ id +'.jpg')
    res.redirect('/admin/view-brand')
  }).catch((err) => {
    
    res.redirect('/admin/add-brand')
  })
})
//view brands
router.get('/view-brand',(req,res)=>{
  productHelpers.getAllBrands().then((brands)=>{
    res.render('admin/view-brand',{brands})
  })
  
})
//logout
router.get('/logout',(req,res)=>{
  req.session.admin = null
  req.session.adminLoggedIn = false
  res.redirect('/admin')
})
module.exports = router;
