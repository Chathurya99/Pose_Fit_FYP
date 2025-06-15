/*
const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    emailId: { type: String, required: true, unique:true },
    password: { type: String, required: true },
    firstName: { type: String},
    lastName: { type: String},
    contact: { type: String },
    height: { type: Number },
    weight: { type: Number },
  },
  { _id: false },
  { collection: "user" }
);

const createModel = function () {
  return mongoose.model("user", UserSchema);
};

module.exports.createModel = createModel;
*/


const mongoose = require('mongoose');
// const personalInfoSchema = require('../models/PersonalInfoSchema');
//const personalInfoSchema = require('./PersonalInfoSchema');

const workoutSchema = new mongoose.Schema({
  nameWorkout: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  repetition: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const personalInfoSchema = new mongoose.Schema({
  age: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  activityLevel: {
    type: String,
    required: true
  },
  BMI: {
    type: Number
    
  },
  BMR: {
    type: Number
   
  },
  BMITags: {
    type: String
    
  }
});


const UserSchema = new mongoose.Schema({
  emailId: {
    type: String,
    required: true,
    unique: true,
    sparse:true
  },
  password: {
    type: String,
    required: true
  },
  firstName:{
    type: String,
    required: true
  },
  mobile:{
    type: String
  },
  dateofbirth:{
    type: Date
  },
  nickname:{
    type: String
  },
  workouts: [workoutSchema],
  date: {
    type: Date,
    default: Date.now
  },
  personalInfo: [personalInfoSchema],

  settings: {
    goal: String,
    intensity: String,
    duration: Number,
    currWorkout: String,
    currDuration: Number,
    isAccessCamera: Boolean,
    isAudioEffect: Boolean,
    isFullscreen: Boolean,
    isFlipCamera: Boolean,
    isDirectionSign: Boolean,
    isDeveloperMode: Boolean
  },


});

module.exports = mongoose.model('user', UserSchema);