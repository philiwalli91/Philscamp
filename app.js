if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
} // This will load the environment variables from the .env file into process.env

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
//const objectID = require('mongoose').ObjectID; 
const passport = require('passport'); // This is the passport module
const LocalStrategy = require('passport-local'); // This is the local strategy for passport
const User = require('./models/user'); // This is the user model
const helmet = require('helmet'); // This will add some security headers to our app

const mongoSanitize = require('express-mongo-sanitize'); // This will sanitize the user input to prevent mongo injection

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo'); // This will store the session in the database

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

  

mongoose.connect(dbUrl); 

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'thisisasecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
});

store.on('error', function (e) {
    console.log('Session Store Error', e)
})

const sessionConfig = { 
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, Ska läggas till senare när vi har https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet()); // This will add some security headers to our app

const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
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
                "https://res.cloudinary.com/dsxspcjcm/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize()); // This will initialize passport
app.use(passport.session()); // This will use passport session
passport.use(new LocalStrategy(User.authenticate())); // This will use the local strategy for passport and authenticate the user

passport.serializeUser(User.serializeUser()); // This will store the user in the session.
passport.deserializeUser(User.deserializeUser()); // This will unstore the user in the session.


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)


app.get('/', (req, res) => {
    res.render('home');
});


app.all('*', (err, req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

/* app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (err) {
        req.flash('error', err.message);
        return res.redirect('/campgrounds');
    }

    if (!err.message) err.message = 'Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});
 */
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    req.flash('error', err.message || 'Something Went Wrong!');
    res.status(statusCode).redirect('/campgrounds');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port} `);
});