const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  fatherName: {
    type: String,
    required: true
  },
  motherName: {
    type: String,
    required: true
  },
  fatherMobile: {
    type: String,
    required: true
  },
  motherMobile: {
    type: String,
    required: true
  },
  guardianName: {
    type: String
  },
  guardianMobile: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const detailModel = mongoose.model('UserDetail', userDetailsSchema);

module.exports = detailModel;
