const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const opts={toJSON:{virtuals:true}};

const ImageSchema=new Schema({
    url: String,
    filename: String
})

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  images: [ ImageSchema ],
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: false
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  description: String,
  location: String,
  author:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },
  reviews : [{
    type : Schema.Types.ObjectId,
    ref : 'Review'
  }]
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
  return `<strong><a href="/campgrounds/${this._id}" style="text-decoration:none;">${this.title}</a></strong>
  <p>${this.description.substring(0,20)}</p>`
})


CampgroundSchema.post('findOneAndDelete', async(doc)=>{ //doc - the campground that was just deleted
  if(doc){
    await Review.deleteMany({
      _id:{
        $in:doc.reviews //looks for that specific id in the doc.reviews
      }
    })
  }
})

module.exports = mongoose.model("Campground", CampgroundSchema);
