const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const mongoURI = process.env.DATABASE_URL || 'mongodb://localhost:27017/monitor-dashboard';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDatabase }; 