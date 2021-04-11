const mongoose = require('mongoose');
var Comment = require("./comment");
var Review = require("./review");

//SCHEMA SETUP
const movieSchema = new mongoose.Schema({
	name: String,
	u_rating: String,
	poster: String,
	director: String,
	plot: String,
	description: String,
	createdAt: { type: Date, Default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,//db에 저장된 Schema와 타입, 아이디를 찾아서
			ref: 'Comment'//코멘트를 참조함

		}
	],
	reviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Review"
		}
	],
	rating: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('Movie', movieSchema);
