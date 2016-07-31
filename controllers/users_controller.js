var mongoose = require('mongoose');
var crypto = require('crypto');

function hashPW(pwd){
    return crypto.createHash('sha256').update(pwd).
    digest('base64').toString();
}

var User = mongoose.model('userCollection');

var friend = require('./friend_controller');

exports.home = function (req,res) {
    if(req.session.name) {
        
        User.findOne({username:req.session.name})
            .exec(function (err,doc) {
                
                if(err || !doc){
                    req.session.msg = 'Database Connectivity Error';
                    res.redirect('/logout');
                    console.log('Error occured while getting user data for Home ' + err);
                }

                else {
                    res.render('home', {username: req.session.name, msg: req.session.msg,email:doc.email,status:doc.status,country:doc.country});
                }
            });
    }   
    else
        res.redirect('/login');
    };


exports.login = function (req,res) {

        User.findOne({username:req.body.username })
            .exec(function (err,doc) {
           if(err || !doc) {
               console.log('finding User name while logging in :' + err);
               req.session.msg = 'Wrong Password or Username  !! ';
               res.redirect('/login');
           } 
           else{
               if(doc.hashpasswd === hashPW(req.body.password.toString())){
                   console.log('Password match for :  ' + req.sessionID);
                   req.session.regenerate(function () {

                       req.session.userid = doc.id;
                       req.session.name = doc.username;

                       friend.online(req.session.name);

                       req.session.msg = 'Logged in !!';  
                       res.redirect('/home');
                   });

               }
               else{
                   console.log('Password  Wrong');
                   req.session.msg = 'Wrong Password :' + req.body.username;
                   res.redirect('/login');
               } 
           }

        });

};


exports.signup = function (req,res) {

    console.log('request came');

    if (req.body.email.length < 1) {
        req.session.msg2 = 'Please Enter Valid email id';
        res.render('signup', {msg: req.session.msg2});
    }

    else if (req.body.password.toString().length < 1) {
        req.session.msg2 = 'Please Choose a Password';
        res.render('signup', {msg: req.session.msg2});
    }
    else {
        var user = new User({
                username: req.body.username,
                hashpasswd: hashPW(req.body.password.toString()),
                country: req.body.country,
                email: req.body.email,
                status: 'I am using SoftChat'
            }
        );

        user.save(function (err) {
            if (err) {

                if (err.errmsg.indexOf('username') >= 0)
                    req.session.msg2 = 'Username already exist';

                else if (err.errmsg.indexOf('email') >= 0)
                    req.session.msg2 = 'Email already registered';

                res.render('signup', {msg: req.session.msg2});

            }
            else {
                req.session.userid = user.id;
                req.session.name = user.username;

                friend.totalAdd(req.session.name,user.status);

                req.session.msg = 'SuccessFully Signed Up';
                res.redirect('/home');
            }

        });
    }
};
    
exports.editProfile= function (req,res) {
    
                        if(req.session.name) {
                            
                            User.findOne({username:req.session.name})
                                .exec(function (err,doc) {
                            
                                    if(err || !doc){
                                        req.session.msg = 'Database Connectivity Error';
                                        res.redirect('/home');
                                    console.log('Error occured while getting user profile  ' + err);   
                                    }
                                    
                                    else {
                                        req.session.msg1 = req.session.msg1 || '* Change the Field You Want';
                                        res.render('editProfile', {username: req.session.name, country:doc.country, status:doc.status,email:doc.email,msg: req.session.msg1});
                                    }
                            
                                    });
                        }
                        else{
                            req.session.msg = 'Login Please ';
                            res.redirect('/login'); //passing msg to the login 
                        }
                    };

exports.saveProfile = function (req,res) {
    
            User.findOne({username:req.session.name})
                .exec(function (err,doc) {
                   if(err || !doc){
                       req.session.msg1 = 'Database Connection Problem ';
                       res.redirect('/editProfile');
                    console.log('error While finding username  ' + err);
                   }
                    
                    else {

                       //console.log(req.body);
                      // console.log(doc.set('country',req.body.country.toString()));
                       doc.set('country',req.body.country.toString());
                       doc.set('status',req.body.status.toString());
                       doc.set('email',req.body.email.toString());

                       if(req.body.value > 1 ){
                           console.log('password changed  new password  =  ' + req.body.password.toString());
                           doc.set('hashpasswd',hashPW(req.body.password.toString()));
                       }

                       doc.save(function (err) {

                           if(err) {
                               req.session.msg1 = 'Error Saving Documents ';
                               res.redirect('/editProfile');
                               console.log('error saving the document  ' + err);
                           }
                           
                           friend.friendupdate(req.session.name,req.body.status);
                           
                           if(req.body.value > 1 ){
                               res.cookie('msg','Password Changed !! Please Login To Continue'); 
                              res.redirect('/logout');
                           }
                           else {
                               req.session.msg = 'Changes Saved  Successfully !';
                               res.redirect('/home');   // msg for home also
                           }
                           });
                   }
                    
                });

};

exports.deleteUser = function (req,res) {
    if(req.session.name){
        
        User.findOne({username:req.session.name})
            .exec(function (err,doc) {
                if(err || !doc){
                    req.session.msg = 'Database Connection Problem';
                    res.redirect('/editProfile');
                }
                else{
                    
                    doc.remove(function (err,deldoc) {
                       
                        if(err || !deldoc){
                            req.session.msg = 'Problem in Deleting User';
                            res.redirect('/editProfile');
                        }
                        else{
                            friend.totalRemove(req.session.name);
                            res.cookie('msg','Account Deleted  for User :  ' + deldoc.username);
                            res.redirect('/logout');
                        }
                        
                    });
                    
                }
                
            });
        
    }        
    else 
    res.redirect('/login');
    
};


exports.total = function (req,res) {

    if(req.session.name)
    friend.total(req,res);

    else {
        req.session.msg = 'Please Login First';
        res.redirect('/login');
    }
};
