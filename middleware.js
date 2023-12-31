const express=require("express");
const Campground = require("./models/campgrounds");
const Review = require("./models/review");
const baseJoi = require("joi");
const sanitizeHtml = require('sanitize-html');



const extension = (Joi) => ({
  type: "string",
  base: Joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
            allowedTags: [],
            allowedAttributes: {},
        });
        if(clean !== value) return helpers.error('string.escapeHTML',{value})
        return clean;
      },
    },
  },
});


const Joi=baseJoi.extend(extension);


//Joi Validation for forms
module.exports.validateCampground = (req, res, next) => {
    const campgroundSchema = Joi.object({
      campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // images: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
      }).required(),
      deleteImages: Joi.array()
    });
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((er) => er.message).join(",");
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };

  //Joi Validation for forms

  module.exports.validateReview=(req,res,next)=>{
    const reviewSchema =Joi.object({
        review : Joi.object({
        body :Joi.string().required().escapeHTML(),
        rating :Joi.number().required().min(1)
      }).required(),
    });
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((er) => er.message).join(",");
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  }


  
module.exports.isAuthor=async(req,res,next)=>{
  const {id}=req.params;
  const campground=await Campground.findById(id);
  if(!campground.author.equals(req.user._id)){
    req.flash('error',"You do not have permission to do that");
    return res.redirect(`/campgrounds/${campground._id}`);
  }
  next();
}

module.exports.isReviewAuthor=async(req,res,next)=>{
  const {id,reviewId}=req.params;
  const review=await Review.findById(reviewId);
  if(!review.author.equals(req.user._id)){
    req.flash('error',"You do not have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

// Express error handling
class ExpressError extends Error {
    constructor(message, statusCode) {
      super();
      this.message = message;
      this.statusCode = statusCode;
    }
  }
  
  module.exports.catchAsync=function (fn){
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
  }


//Passport Authentication
module.exports.isLoggedIn = (req,res,next)=>{
  if(!req.isAuthenticated()){
    req.session.returnTo=req.originalUrl;
    req.flash('error','You must be signed in first');
    return res.redirect('/login');
  }
  next();
}
