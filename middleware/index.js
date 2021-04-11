const Movie = require('../models/movie');
const Comment = require('../models/comment');
const Review = require("../models/review");

//all middleware goes here

const middlewareObj = {};

middlewareObj.checkmovieOwnership = function (req, res, next) {
	//is user logged in?
	if (req.isAuthenticated()) {
		// member?
		Movie.findById(req.params.id, function (err, foundmovie) {
			if (err) {
				req.flash('error', 'movie not found.');
				res.redirect('back');
			} else {
				if (foundmovie.author.id.equals(req.user._id)) {
					next();
					//movies/edit.ejs로 movie정보를 전달
				} else {
					req.flash('error', 'You do not have permission to do that.');
					res.redirect('back');
				}
			}
		});

	} else {
		// not a member
		req.flash('error', 'You need to be logged in to do that.');
		res.redirect('back');
	}
}



middlewareObj.checkCommentOwnership = function (req, res, next) {
	//is user logged in?
	if (req.isAuthenticated()) {
		// member?
		Comment.findById(req.params.comment_id, function (err, foundComment) {
			if (err) {
				res.redirect('back');
			} else {
				// does user own the comment?
				if (foundComment.author.id.equals(req.user._id)) {
					next();
					//movies/edit.ejs로 movie정보를 전달
				} else {
					req.flash('error', 'You do not have permission to do that.');
					res.redirect('back');
				}
			}
		});

	} else {
		req.flash('error', 'You need to be logged in to do that.');
		res.redirect('back');
	}
}




middlewareObj.isLoggedIn = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You need to be logged in to do that.');
	res.redirect('/login');
}





middlewareObj.checkReviewOwnership = function (req, res, next) {
	if (req.isAuthenticated()) {
		Review.findById(req.params.review_id, function (err, foundReview) {
			if (err || !foundReview) {
				res.redirect("back");
			} else {
				// does user own the comment?
				if (foundReview.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in");
		res.redirect("back");
	}
};

middlewareObj.checkReviewExistence = function (req, res, next) {
	if (req.isAuthenticated()) {
		Movie.findById(req.params.id).populate("reviews").exec(function (err, foundMovie) {
			if (err || !foundMovie) {
				req.flash("error", "Movie not found.");
				res.redirect("back");
			} else {
				// check if req.user._id exists in foundMovie.reviews
				var foundUserReview = foundMovie.reviews.some(function (review) {
					return review.author.id.equals(req.user._id);
				});
				if (foundUserReview) {
					req.flash("error", "You already wrote a review.");
					return res.redirect("/movies/" + foundMovie._id);
				}
				// if the review was not found, go to the next middleware
				next();
			}
		});
	} else {
		req.flash("error", "You need to login first.");
		res.redirect("back");
	}
};



//이파일의 [middlewareObj] 내용을 전체모듈에 export함
module.exports = middlewareObj;