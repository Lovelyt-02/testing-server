const mongoose = require('mongoose');
const LocationPageSchema = new mongoose.Schema({
    title: String,
    address:String,
    imageUrl:String,
});
module.exports = mongoose.model('LocationPage', LocationPageSchema);