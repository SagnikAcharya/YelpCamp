const express=require("express");
const router = express.Router();
const {validateCampground,isAuthor,isLoggedIn,catchAsync}=require('../middleware');
const campground=require("../controllers/campgrounds");
const multer  = require('multer')
const {storage}=require('../cloudinary/index');
const upload = multer({  storage });


//Defining Routes


router.get("/",catchAsync(campground.campgroundShowPage));

router.get("/new", isLoggedIn, catchAsync(campground.newCampgroundForm));

router.post("/",isLoggedIn, upload.array('campground[image]') ,validateCampground ,catchAsync(campground.makeNewCampground));

router.get("/:id",catchAsync(campground.showCampgroundPage));

router.get("/:id/edit",isLoggedIn,isAuthor,catchAsync(campground.campgroundEditForm));

router.put("/:id",isLoggedIn,isAuthor,upload.array('campground[image]'), validateCampground,catchAsync(campground.editCampground));

router.delete("/:id",isLoggedIn,isAuthor,catchAsync(campground.deleteCampground));

module.exports = router;