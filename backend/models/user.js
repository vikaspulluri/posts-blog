const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  //unique will not validate data. It just tells mongodb that it's a unique data field so that it can index it
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
