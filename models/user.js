const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({ // This is the schema for the user
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// This will add a username and password field to our schema

UserSchema.plugin(passportLocalMongoose); // This will add a bunch of methods to our schema

module.exports = mongoose.model('User', UserSchema); // This will export the model for the user