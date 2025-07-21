
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Exercise = require('../models/ExerciseSchema');
const config = require('config');
const User = require('../models/UserSchema');
// Adding a Exercise




// Fetch all Exercises

router.post("/getAllExercises", async(req, res) => {
     const { userId } = req.body;
     if (!userId) {
       return res.status(400).json({ message: 'userId is required' });
     }
     try {
          // Find user by _id (ObjectId), not emailId
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
          const workouts = user.workouts || [];
          return res.status(200).json(workouts);
     } catch (error) {
          return res.status(400).json({ message: error.message });
     }
});


// Fetch a particular type of Exercise




router.post("/getactivitybyid", async(req, res) => {
     console.log(req.body.exid);
     
     try {
          const room = await Exercise.findOne({'_id' : req.body.exid})
          res.send(room)
     } catch (error) {
          return res.status(400).json({ message: error });
     }
});

router.post("/scores", async(req, res) => {
     try {
          // Find the user by ID
          workoutData = req.body.newScore;
          console.log(workoutData);
          const {emailId} = req.body;
          console.log(emailId);
          const user = await User.findOne({ emailId });
      
          if (!user) {
            return res.status(404).send({ message: 'User not found' });
          }
      
          // Add the new workout data to the user's workouts list
          user.workouts.push(workoutData);
      
          // Save the updated user document
          await user.save();
      
          res.send({ message: 'Workout added to user' });
        } catch (err) {
          console.error(err);
          res.status(500).send({ message: 'Error adding workout to user' });
        }
});

router.get("/getallactivities", async(req, res) => {
    console.log(req.body);
    try {
         const act = await Exercise.find({})
         res.send(act)
    } catch (error) {
         return res.status(400).json({ message: error });
    }
});

router.post("/addactivity", async(req, res) => {
    
 const { exerciseName, exerciseType } = req.body

    const nex = new Exercise({
         
        exerciseName, 
        exerciseType
    })
    try {
         await nex.save()
         res.send('New Activity Added Successfully')
    } catch (error) {
         return res.status(400).json({ error });
    }
});

router.post("/settingsChange", async (req, res) => {
  const { userId, ...settings } = req.body;

  if (!userId || Object.keys(settings).length === 0) {
    return res.status(400).json({ message: "userId and settings are required" });
  }

  try {
    const user = await User.findOne({ emailId: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.settings = {
      ...user.settings,
      ...settings,
    };

    await user.save();
    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




module.exports = router;