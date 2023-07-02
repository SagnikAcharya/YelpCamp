if(process.env.NODE_ENV !=="production"){
  require('dotenv').config();
}

//Requiring Modules
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/userPassport');
const mongoSanitize = require('express-mongo-sanitize');
const helmet=require('helmet');
const MongoStore = require('connect-mongo');


class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}



const campgrounds=require("./routes/campgroundRoutes");
const review=require("./routes/reviewRoutes");
const userRoutes=require("./routes/users");

const dbUrl=process.env.DB_URL;
// const dbUrl='mongodb://127.0.0.1:27017/yelp-camp';
//Mongoose connection
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error : "));
db.once("open", () => {
  console.log("Database connected");
});

//Use Express and encode the json data
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize({
    replaceWith: '_',
  }),
);



// Configuring session for cookies
const store = new MongoStore({
  mongoUrl: dbUrl,
  secret:'Keepthisasecret',
  touchAfter : 24*3600,
})
store.on("error",function (e){
  console.log("Connection Error");
})

const sessionConfig={
  store: store,
  name : 'sid',
  secret:'Keepthisasecret',
  resave: false,
  saveUninitialized:true,
  cookie:{
      expires : Date.now() + (1000*60*60*24*7),
      maxAge : (1000*60*60*24*7),
      // secure : true,    Used for production in http only
      HttpOnly : true
  },
  // store: MongoStore.create({
  //   mongoUrl: dbUrl,
  //   touchAfter: 24 * 3600 // time period in seconds
  // })

}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.currentUser=req.user;
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
})


const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dgyqiof0x/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);





//Use ejs for html templating
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.get("/", (req, res,) => {
  res.render("home.ejs");
});

//Using Express Router
app.use("/campgrounds",campgrounds);
app.use("/campgrounds/:id/reviews",review);
app.use("/",userRoutes);
// Universal Route
app.get("*", (req, res, next) => {
  next(new ExpressError("Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Something went wrong";
  }
  res.status(statusCode).render("../campgrounds/error.ejs", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
