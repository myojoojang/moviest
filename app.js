const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');


const methodOverride = require('method-override');

const Movie = require('./models/movie');
const Comment = require('./models/comment');
const User = require('./models/user');
//const seedDB = require('./seeds');


// requiring routes
const commentRoutes = require('./routes/comments'),
	movieRoutes = require('./routes/movies'),
	indexRoutes = require('./routes/index'),
	reviewRoutes = require('./routes/reviews');


mongoose.connect('mongodb+srv://MJ:1226@moviest.ixetb.mongodb.net/<dbname>?retryWrites=true&w=majority', {
	useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
}).then(() => {
	console.log('connect to DB')
}).catch(err => {
	console.log('err!!!', err.message);
});


app.use(bodyParser.urlencoded({ extended: true })); //bodyParser이용하려면 필수적으로 넣어야하는 코드/그냥 외워
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment');




//seedDB(); // seed the database

// PASSPORT CONFIGURATION
app.use(require('express-session')({
	secret: 'I am the best one',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});



// app.use('/', indexRoutes);
app.use('/', indexRoutes);
app.use('/movies', movieRoutes);
app.use('/movies/:id/comments', commentRoutes);
app.use("/movies/:id/reviews", reviewRoutes);

//여기의 url다음을 기준으로 라우터 실행

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Our app is running on port ${PORT}`);
});