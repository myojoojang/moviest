const express = require("express");
const router = express.Router({ mergeParams: true });
const Movie = require("../models/movie");
const Review = require("../models/review");
const middleware = require("../middleware");

// Reviews Index
router.get("/", function (req, res) {
  Movie.findById(req.params.id).populate({
    path: "reviews",
    options: { sort: { createdAt: -1 } } // sorting the populated reviews array to show the latest first
  }).exec(function (err, movie) {
    if (err || !movie) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    res.render("reviews/index", { movie: movie });
  });
});

// Reviews New
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
  // middleware.checkReviewExistence checks if a user already reviewed the movie, only one review per user is allowed
  Movie.findById(req.params.id, function (err, movie) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    res.render("reviews/new", { movie: movie });

  });
});

// Reviews Create
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
  //lookup movie using ID
  Movie.findById(req.params.id).populate("reviews").exec(function (err, movie) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    Review.create(req.body.review, function (err, review) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      //add author username/id and associated movie to the review
      review.author.id = req.user._id;
      review.author.username = req.user.username;
      review.movie = movie;
      //save review
      review.save();
      movie.reviews.push(review);
      // calculate the new average review for the movie
      movie.rating = calculateAverage(movie.reviews);
      //save movie
      movie.save();
      req.flash("success", "Your review has been added.");
      res.redirect('/movies/' + movie._id);
    });
  });
});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
  Review.findById(req.params.review_id, function (err, foundReview) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    res.render("reviews/edit", { movie_id: req.params.id, review: foundReview });
  });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
  Review.findByIdAndUpdate(req.params.review_id, req.body.review, { new: true }, function (err, updatedReview) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    Movie.findById(req.params.id).populate("reviews").exec(function (err, movie) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      // recalculate movie average
      movie.rating = calculateAverage(movie.reviews);
      //save changes
      movie.save();
      req.flash("success", "Your review was edited.");
      res.redirect('/movies/' + movie._id);
    });
  });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
  Review.findByIdAndRemove(req.params.review_id, function (err) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    Movie.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.review_id } }, { new: true }).populate("reviews").exec(function (err, movie) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      // recalculate movie average
      movie.rating = calculateAverage(movie.reviews);
      //save changes
      movie.save();
      req.flash("success", "Your review was deleted.");
      res.redirect("/movies/" + req.params.id);
    });
  });
});

function calculateAverage(reviews) {
  if (reviews.length === 0) {
    return 0;
  }
  let sum = 0;
  reviews.forEach(function (element) {
    sum += element.rating;
  });
  return sum / reviews.length;
}

module.exports = router;