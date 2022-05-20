const express = require("express");
const twilio = require("twilio");
const { response } = require("../app");
const router = express.Router();
const userHelpers = require("../helpers/user-helpers");

let veryfyUserLogin = (req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

//login
router.get("/", veryfyUserLogin, function (req, res, next) {

  res.render("users/home",{userData:req.session.user});
});
router.get("/login", function (req, res, next) {
  if(req.session.userLoggedIn){
    res.redirect('/')
  }else{
  res.render("users/login",{err:req.session.logErr});
  req.session.destroy()
  }
});

//twilio OTP setup

router.post("/login", function (req, res, next) {
  userHelpers.doLogin(req.body).then((response) => {
    req.session.user = response.user;
    req.session.userMobile = req.body.mobile;

    if (response.status) {
      const serviceSID = "VA6331c95d760a5b09578a86465493d27b";
      const accountSID = "AC499479d9b71f95ee80bdbb612c6afdfc";
      const authToken = "20043308003af182fc64a6795c8cb46a";
      const otp = require("twilio")(accountSID, authToken);
      otp.verify
        .services(serviceSID)
        .verifications.create({
          to: `+91${req.body.mobile}`,
          channel: "sms",
        })
        .then((response) => {
          res.status(200).json({ response });
        });

      res.redirect("/otp-verification");
    } else {
      req.session.logErr=response.msg
       res.redirect("/login")
    }
  });
});
//otp-verification

router.get("/otp-verification", function (req, res, next) {
  if(req.session.userLoggedIn){
    res.redirect('/')
  }
  res.render("users/otp-verification", { userMobile: req.session.userMobile });
});
router.post("/otp-checking/:mobile", (req, res) => {
  console.log(req.body);
  console.log(req.params.mobile);
  const serviceSID = "VA6331c95d760a5b09578a86465493d27b";
  const accountSID = "AC499479d9b71f95ee80bdbb612c6afdfc";
  const authToken = "20043308003af182fc64a6795c8cb46a";
  const otp = require("twilio")(accountSID, authToken);

  otp.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: `+91${req.params.mobile}`,
      code: req.body.otp,
    })
    .then((response) => {
      console.log(response);
      if (response.valid) {
        req.session.userLoggedIn = true;
        res.redirect("/");
      } else {
        req.session.userLoggedIn = false;
        res.redirect("/otp-verification");
      }
    });
});


//signup
router.get("/signup", function (req, res) {
res.render("users/signup",{error: req.session.signupErr});
req.session.destroy()
});

router.post("/register", (req, res) => {
  
  userHelpers
    .doSignup(req.body)
    .then((response) => {
      if (response.status) {
        req.session.userLoggedIn=true
      res.redirect("/login");
      }
    }).catch((err) => {
      
      console.log(err);
      req.session.signupErr = err.msg
      
      res.redirect('/signup')
      
      
      
    });

});


//forgot password
router.get("/forgot-password", (req, res) => {
  res.render("users/forgot-password",{err:req.session.numErr});
  req.session.destroy()
});
router.post("/forgotPassword", (req, res) => {
  userHelpers.checkValidMobile(req.body).then((response) => {
    if (response.status) {
      const serviceSID = "VA6331c95d760a5b09578a86465493d27b";
      const accountSID = "AC499479d9b71f95ee80bdbb612c6afdfc";
      const authToken = "20043308003af182fc64a6795c8cb46a";
      const otp = require("twilio")(accountSID, authToken);
      otp.verify
        .services(serviceSID)
        .verifications.create({
          to: `+91${req.body.mobile}`,
          channel: "sms",
        })
        .then((response) => {
          res.render("users/reset-password-otp", {
            userMobile: req.body.mobile,
          });
          res.status(200).json({ response });
        })
        
    }
  }).catch((err) => {
    req.session.numErr=err.msg
    
    console.log("hello here")
    console.log(err);
    res.redirect('/forgot-password')
  });
});

router.post("/resetPasswordOtp/:mobile", (req, res) => {
  const serviceSID = "VA6331c95d760a5b09578a86465493d27b";
  const accountSID = "AC499479d9b71f95ee80bdbb612c6afdfc";
  const authToken = "20043308003af182fc64a6795c8cb46a";
  const otp = require("twilio")(accountSID, authToken);

  otp.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: `+91${req.params.mobile}`,
      code: req.body.otp,
    })
    .then((response) => {
      console.log(response);
      if (response.valid) {
        // req.session.userLoggedIn=true
        //res.redirect("/new-password")
        res.render("users/new-password", { userMobile: req.params.mobile });
      } else {
        // req.session.userLoggedIn=false
        res.redirect("/forgot-password");
      }
    });
});
router.post("/newPassword/:mobile", (req, res) => {
  userHelpers.updatePassword(req.params.mobile, req.body.password).then((response)=>{
    res.redirect('/login')
  })
});
//cart

router.get("/cart", veryfyUserLogin, function (req, res, next) {
  res.render("users/cart",{userData:req.session.user});
});
//whishlist
router.get("/wishlist", veryfyUserLogin, function (req, res, next) {
  res.render("users/wishlist",{userData:req.session.user});
});
//Logout
router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/login')
})
module.exports = router;
