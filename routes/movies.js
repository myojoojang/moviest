const express = require('express');
const router = express.Router();// new instance of Express Router
const Movie = require('../models/movie');
const middleware = require('../middleware');
const Review = require("../models/review");


// //Root Route
// router.get("/", function (req, res) {
// 	console.log("eterttertre");
// 	res.render("movies");
// });

//INDEX - show all movie
router.get('/', function (req, res) {

	// get all movies from DB
	Movie.find({}, function (err, allmovies) {
		if (err) {
			console.log(err);
		} else {
			res.render('movies/index', { movies: allmovies, currentUser: req.user, page: 'movies' });
		}
	});
});



//CREATE - add new movie to DB
router.post('/', middleware.isLoggedIn, function (req, res) {
	//get data from the form amd add to movies array
	const name = req.body.name;
	const u_rating = req.body.u_rating;
	const poster = req.body.poster;
	const director = req.body.director;
	const plot = req.body.plot;
	const desc = req.body.description;
	const author = {
		id: req.user._id,
		username: req.user.username
	};
	const newmovie = { name: name, u_rating: u_rating, poster: poster, director: director, plot: plot, description: desc, author: author };

	//create a new movie and save to DB
	Movie.create(newmovie, function (err, newlyCreated) {
		if (err) {
			console.log(err);
		} else {
			//redirect back to movies page
			res.redirect('/movies')
		}
	});
});



//NEW - show form to create new movie
router.get('/new', middleware.isLoggedIn, function (req, res) {
	res.render('movies/new');
});



//SHOW - shows more info about one movie
router.get('/:id', function (req, res) {
	// find the movie with provided ID
	Movie.findById(req.params.id).populate("comments").populate({
		path: "reviews",
		options: { sort: { createdAt: -1 } }
	}).exec(function (err, foundMovie) {
		if (err) {
			console.log(err);
		} else {
			//render show template 
			res.render("movies/show", { movie: foundMovie });
		}
	});
});

//EDIT movie ROUTE
router.get('/:id/edit', middleware.checkmovieOwnership, function (req, res) {
	Movie.findById(req.params.id, function (err, foundmovie) {
		res.render('movies/edit', { movie: foundmovie });
	});
});



//UPDATE movie ROUTE
router.put('/:id', middleware.checkmovieOwnership, function (req, res) {
	//find and update post
	Movie.findByIdAndUpdate(req.params.id, req.body.movie, function (err, updatemovie) {
		if (err) {
			res.redirect('/movies');
		} else {
			//redirect showpage
			res.redirect('/movies/' + req.params.id);
		}
	})
});


// DESTROY movie ROUTE
router.delete("/:id", middleware.checkmovieOwnership, function (req, res) {
	Movie.findById(req.params.id, function (err, movie) {
		if (err) {
			res.redirect("/movies");
		} else {
			// deletes all comments associated with the movie
			Comment.remove({ "_id": { $in: movie.comments } }, function (err) {
				if (err) {
					console.log(err);
					return res.redirect("/movies");
				}
				// deletes all reviews associated with the movie
				Review.remove({ "_id": { $in: movie.reviews } }, function (err) {
					if (err) {
						console.log(err);
						return res.redirect("/movies");
					}
					//  delete the movie
					movie.remove();
					req.flash("success", "Movie deleted");
					res.redirect("/movies");
				});
			});
		}
	});
});






module.exports = router;// returning router to app.js