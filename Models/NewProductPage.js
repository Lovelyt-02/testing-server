const mongoose=require('mongoose');
const NewProductPageSchema=new mongoose.Schema({
    isNewProductPage:Boolean,
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
module.exports=mongoose.model("NewProductPage",NewProductPageSchema);