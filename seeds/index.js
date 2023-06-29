const mongoose = require("mongoose");
const Campground = require("../models/campgrounds");
const cities = require("./cities");
const { descriptors, places } = require("./seed-helpers");
const axios=require('axios');
const fetch=require('node-fetch');

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error : "));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

 // call unsplash and return small image
//  async function seedImg() {
//   try {
//     const resp = await axios.get('https://api.unsplash.com/photos/random', {
//       params: {
//         client_id: 'SJ4caBBzDBOABoSPQWed49515u92ZG2r91Tx1Gdfi6k',
//         collections: 1114848,
//       },
//     })
//     return resp.data.urls.small;
//   } catch (err) {
//     console.error(err)
//   }
// }

const url = "https://api.unsplash.com/photos/random?client_id=SJ4caBBzDBOABoSPQWed49515u92ZG2r91Tx1Gdfi6k&collections=1114848";
 
// Function to get one image url
async function getImg() { 
  const fet=await fetch(url);
  console.dir(fet);
  // .then((res)=>{
  //   // res.json();
  //   return res.json().urls.full;
  // })
  // .then((data)=>{
  // })
}

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 20; i++) {
    const rand = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20)+10;
    const camp = new Campground({
      author:"6499bd3853fee6b88ccdce7a",
      images: {
        url: 'https://res.cloudinary.com/dgyqiof0x/image/upload/v1687935991/YelpCamp/j0jvimfl4fo0wuyuc7xb.jpg',
        filename: 'YelpCamp/j0jvimfl4fo0wuyuc7xb',
      },
      geometry:{
        type : "Point",
        coordinates : [cities[rand].longitude,cities[rand].latitude]
      },
      title: `${sample(descriptors)} ${sample(places)}`,
      price : price,
      description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi tempore, nam cupiditate quod blanditiis expedita. Numquam debitis omnis quidem eum at fugiat cupiditate voluptas quo veniam architecto, laboriosam dignissimos! Ullam.',
      location: `${cities[rand].city},${cities[rand].state}`,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
