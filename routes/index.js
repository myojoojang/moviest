const express = require('express');
const router = express.Router();// new instance of Express Router
const passport = require('passport');
const Movie = require('../models/movie');
const User = require('../models/user');


//Root Route
router.get("/", function (req, res) {
	res.render("landing");
});


router.get("/main", function (req, res) {

	Movie.find({}, function (err, allmovies) {
		if (err) {
			console.log(err);
		} else {
			res.render('main', { movies: allmovies, currentUser: req.user, page: 'main' });
		}
	});

})



//=================================
// AUTH ROUTES
//=================================

//show register form
router.get('/register', function (req, res) {
	res.render('register', { page: 'register' });
});


// handle sign up logic
router.post('/register', function (req, res) {
	const newUser = new User({ username: req.body.username });
	User.register(newUser, req.body.password, function (err, user) {
		if (err) {
			console.log(err);
			return res.render("register", { error: err.message });
		}
		passport.authenticate('local')(req, res, function () {
			res.redirect('/main');
		});
	});
});




// show login form
router.get('/login', function (req, res) {
	res.render('login', { page: 'login' });
});
// handling login logic
// app.post('/login', middleware, callback)
//passport.use(new LocalStrategy(User.authenticate()));
router.post('/login', passport.authenticate('local',
	{
		successRedirect: '/main',
		failureRedirect: '/login'
	}), function (req, res) {
	});




//logout route
router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/main');
});






module.exports = router;// returning router to app.js