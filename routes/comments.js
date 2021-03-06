const express = require('express');
const router = express.Router({ mergeParams: true });//express서버의 파람을 이곳의 파람과 merge한다 // new instance of Express Router
const Movie = require('../models/movie');
const Comment = require('../models/comment');
const middleware = require('../middleware');



//Comments New
router.get('/new', middleware.isLoggedIn, function (req, res) {

	//find movie by Id
	Movie.findById(req.params.id, function (err, movie) {
		if (err) {
			console.log(err);
		} else {
			res.render('comments/new', { movie: movie });
		}
	})
});


//Comments create
router.post('/', middleware.isLoggedIn, function (req, res) {
	//look up movie using id
	Movie.findById(req.params.id, function (err, movie) {
		if (err) {
			console.log(err);
			res.redirect('/movies');
		} else {

			;			//create new comment
			Comment.create(req.body.comment, function (err, comment) {
				if (err) {
					req.flash('error', 'Something went wrong.');
					console.log(err);
				} else {
					// add username + id
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// save comment
					comment.save();
					movie.comments.push(comment);
					movie.save();
					req.flash('success', 'Successfully added comment.');
					res.redirect('/movies/' + movie._id);
				}
			})
		}
	});
});


// EDIT ROUTE
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function (req, res) {
	Comment.findById(req.params.comment_id, function (err, foundComment) {
		if (err) {
			res.redirect('back');
		} else {
			res.render('comments/edit', { movie_id: req.params.id, comment: foundComment });
		}
	});
});



// UPDATE ROUTE 
// movies/:id/comments/:comment_id
router.put('/:comment_id', middleware.checkCommentOwnership, function (req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
		if (err) {
			res.redirect('back');
		} else {
			res.redirect('/movies/' + req.params.id);
		}
	});
});


// DESTROY ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership, function (req, res) {
	//findByIdAndRemove
	Comment.findByIdAndRemove(req.params.comment_id, function (err) {
		if (err) {
			res.redirect('back');
		} else {
			req.flash('success', 'Comment deleted.');
			res.redirect('/movies/' + req.params.id);
		}
	});
});






module.exports = router;