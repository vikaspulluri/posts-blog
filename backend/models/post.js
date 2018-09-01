const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: { type: String, required: true},
  content: { type: String, required: true}
});

module.exports = mongoose.model('Post', postSchema); // Collection name will be plural name of lower case of 'Post'