const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

function connectDB() {
	return new Promise((resolve, reject) => {
  
	  if (process.env.NODE_ENV === 'test') {
		const Mockgoose = require('mockgoose').Mockgoose;
		const mockgoose = new Mockgoose(mongoose);
  
		mockgoose.prepareStorage()
		  .then(() => {
			mongoose.connect(db,
			  { useNewUrlParser: true,useUnifiedTopology: true })
			  .then((res, err) => {
				if (err) return reject(err);
				resolve();
			  })
		  })
	  } else {
		  mongoose.connect(db,
			{ useNewUrlParser: true,useUnifiedTopology: true })
			.then((res, err) => {
			  if (err) return reject(err);
			  resolve();
			});
			console.log('MongoDB Connected...');
	  }
	});
  }

function close() {
	return mongoose.disconnect();
  }

module.exports = {connectDB,close};