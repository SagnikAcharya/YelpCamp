const express=require('express');
const passport=require('passport');
const router=express.Router();
const User=require("../models/userPassport");


router.get('/register', async(req,res)=>{
    res.render('./register.ejs');
})
router.post('/register', async(req,res,next)=>{
    try{
    const {email,username,password}=req.body;
    const user=new User({email:email,username:username});
    const registeredUser=await User.register(user,password);
    req.login(registeredUser, function(err) {
        if (err) { return next(err); }
        req.flash("success", "Welcome to Yelpcamp");
        res.redirect('/campgrounds');
    })
    }catch(err){
        req.flash('error','Username not available');
        res.redirect('/register');
    }
})



router.get('/login', (req,res)=>{
    res.render('./login.ejs');
})
router.post('/login', passport.authenticate('local', { failureFlash:true , failureRedirect : '/login', keepSessionInfo: true}) , (req,res)=>{
    req.flash('success','Welcome Back');
    const redirectUrl=req.session.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
})

router.get('/logout', (req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
    req.flash('success',"Logged Out Successfully");
    res.redirect("/campgrounds");
    })
})


module.exports=router;