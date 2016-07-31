var express = require('express');

module.exports = function (app) {

  var users = require('./controllers/users_controller');
  var friend = require('./controllers/friend_controller');
  var chat = require('./controllers/chat_controller');

  app.use('/',express.static('./'));
  
  app.get('/',function (req,res) {
    if(req.session.name)
        res.redirect('/home');
    
    else{
    /*  setInterval(function () {
        console.log(req.sessionID);
      },10000);*/
      req.session.msg = 'Please Login here';
        res.redirect('/login');
    } 
  });
  
  app.get('/login',function (req,res) {
    if(req.session.name)
      res.redirect('/home');

    else{
      if(req.cookies.msg)
      req.session.msg = req.cookies.msg;
      else
        req.session.msg = req.session.msg || 'Login To Continue' ;

      if(req.cookies.msg)
          res.clearCookie('msg');

      res.render('login',{msg : req.session.msg});
    }
  });

  app.get('/logout',function (req,res) {
    if(req.session.name) {
      if(!req.cookies.msg)
        res.cookie('msg','Successfully Logged Out');

      friend.offline(req.session.name);
      req.session.destroy(function () {
        res.redirect('/login');
      });
    }
    else{
      res.redirect('/login');
    }
    
  });
  
  app.get('/signup',function (req,res) {
    if(req.session.name) {
      req.session.msg = 'You are Already Logged In';
      res.redirect('/home');
    }

    else{
      req.session.msg2 =  req.session.msg2 || '* All Fields are Mandatory';
      res.render('signup',{msg:req.session.msg2});
    }
    
    
  });

app.get('/home',users.home);  
app.post('/login',users.login);
app.post('/signup',users.signup);  
app.get('/editProfile',users.editProfile);
app.post('/editProfile',users.saveProfile);
app.get('/deleteUser',users.deleteUser);
app.post('/total',users.total);
app.get('/chat/:friendname',chat.allChats);
app.post('/chatmsg/:sendingTo',chat.msgCollect);
  
};