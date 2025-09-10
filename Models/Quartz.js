const mongoose = require('mongoose');
const QuartzSchema=new mongoose.Schema({
    bannerSection:{
        title:String,
        description:String,
        backgroundImageUrl:String
    },
    sectionOne:{
        title:String,
        description:String,
        imageUrl:String
    },

    sectionTwo:{
        title:String,
        points:[
            { point:String}
        ]
    },
    sectionThree:{
        videoThumbnail:String,
        videoUrl:String
    }
})
module.exports=mongoose.model("Quartz",QuartzSchema);