const db = require("../config/connection");
const collection = require("../config/collections");
const jwt = require("jsonwebtoken");
const { response } = require("../app");
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      const user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({$or:[{ email: userData.email},{mobile:userData.mobile }]});
      if (user) {
        console.log("registration rejected");
        reject({ status: false, msg: "This email or mobile already taken" });
      } else {
        userData.password = await bcrypt.hash(userData.password, 10);
        userData.repassword = await bcrypt.hash(userData.repassword, 10);
        await db
          .get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData);
        //jwt
        const secret = "hellooo";
        const payload = {
          email: userData.email,
          number: userData.mobile,
        };
        let token = jwt.sign(payload, secret, { expiresIn: "4m" });
        console.log(token);

        //welcome mail
        const fromEmail = "anasabdulkareem99@gmail.com";
        const toEmail = userData.email;

        const transporter = nodeMailer.createTransport({
          service: "gmail",
          auth: {
            user: "anasabdulkareem99@gmail.com",
            pass: "xryezkjtainljozw",
          },
        });
        transporter.sendMail(
          {
            from: fromEmail,
            to: toEmail,
            subject: "Welcome mail",
            text: "You are successfully registered in GetLaps",
            html: `<h4>We are welcoming you Mr/Ms <h2>${userData.fullname}</h2><h1>To GetLaps</h1></h4>`,
          },
          function (error, response) {
            if (error) {
              console.log("Failed in sending mail");
            } else {
              console.log("Successful in sending email");
            }
          }
        );
        resolve({ status: true, msg: "successfully registered" });
      }
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("login success");

            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false,msg:'Invalid Email or Password' });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },
  //forgotpassword ;finding user mobile number
  checkValidMobile: (userMob) => {
    console.log(userMob);
    return new Promise(async (resolve, reject) => {
      let mob = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ mobile: userMob.mobile });
      if (mob) {
        console.log(mob);
        resolve({ status: true });
      } else {
        console.log(mob);
        reject({ status: false, msg: "Mobile Number Does't Match" });
      }
    });
  },
  //updatepassword for forgote password
  updatePassword: (userMobile, newPassword) => {
    return new Promise(async (resolve, reject) => {
      newPassword = await bcrypt.hash(newPassword, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { mobile: userMobile },
          {
            $set: {
              password: newPassword,
            },
          }
        )
        .then((Response) => {
          console.log(response);
          resolve(Response);
        });
    });
  },
};
