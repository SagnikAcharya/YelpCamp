const Campground = require("../models/campgrounds");
const {cloudinary}=require("../cloudinary/index");
const mbxStyles = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken=process.env.MAPBOX_TOKEN;
const geoCoder = mbxStyles({ accessToken: mapboxToken});

//Defining Routes

//All Campgrounds

module.exports.campgroundShowPage=async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("../campgrounds/index.ejs", { campgrounds });
}

//New Campground Form Page
module.exports.newCampgroundForm=async (req, res) => {
    res.render("../campgrounds/new.ejs");
}

//Make new Campground
module.exports.makeNewCampground=async (req, res) => {   
    const campground = new Campground(req.body.campground);
    const geoData=await geoCoder.forwardGeocode({
      query : campground.location,
      limit : 1
    }).send()
    campground.geometry=geoData.body.features[0].geometry;
    campground.images=req.files.map(f=>({url: f.path , filename:f.filename}));
    campground.author=req.user._id;
    await campground.save();
    req.flash('success','Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

//Show specific campground with id
module.exports.showCampgroundPage=async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
      path:'reviews',
      populate:{
        path:'author',
      }
    }).populate('author');
    if(!campground){
      req.flash('error','Campground not found');
      return res.redirect("/campgrounds");
    }
    res.render("../campgrounds/show.ejs", { campground });
}

//Edit campground with id
module.exports.campgroundEditForm=async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
      req.flash('error','Campground not found');
      return res.redirect("/campgrounds");
    }
    console.log(campground.location);
    res.render("../campgrounds/edit.ejs", { campground });
}

//Update Campground
module.exports.editCampground=async (req, res) => {
    const img=req.files.map(f=>({url: f.path , filename:f.filename}));
    const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground,});
    console.log("Updated : " + campground.location);
    campground.images.push(...img);
    const geoData=await geoCoder.forwardGeocode({
      query : campground.location,
      limit : 1
    }).send()
    campground.geometry=geoData.body.features[0].geometry;
    console.log(campground.geometry);
    await campground.save();
    if(req.body.deleteImages){
      for(let filename of req.body.deleteImages){
        await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({$pull:{images:{filename:{$in : req.body.deleteImages}}}})
    }
    req.flash('success','Successfully updated the campground');
    console.log("Updated after save: " + campground.location);
    res.redirect(`/campgrounds/${campground._id}`);
}

//Delete Campground
module.exports.deleteCampground=async (req, res) => {
    const campground = await Campground.findByIdAndDelete(req.params.id);
    res.redirect("/campgrounds");
  }