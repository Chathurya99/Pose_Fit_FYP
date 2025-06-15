const mongoose = require("mongoose");



const ExerciseSchema = mongoose.Schema(
  {
    exerciseType: { type: String, required: true },
    exerciseName: { type: String},
    image: { type: String },
  }
);


module.exports = mongoose.model('exercise', ExerciseSchema);