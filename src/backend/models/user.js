const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema =  new mongoose.Schema({
   password: {
       type: String,
       required: true,
       minLength: 7,
       trim: true,
       validate(value) {
           if(value.toLowerCase().includes('password')) {
               throw new Error('Password can not contain the word "password"!');
           }
       }
   },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    familyName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
       type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
           if(!validator.isEmail(value)) {
               throw new Error('Email is invalid!');
           }
        }
    },
    tokens: [{
       token: {
           type: String,
           required: true
       }
    }]
}, {
    timestamps: true
});

// Generating a token for the user when logging in.
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, 'TogetherApp');

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// sends only the public information without the password and tokens
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
};

// Confirms if the password matches the users email.
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if(!user) {
      throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) {
      throw new Error('Unable to login');
  }

  return user;
};

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
   const user = this;

   if(user.isModified('password')) {
       user.password = await bcrypt.hash(user.password, 8);
   }

   next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;