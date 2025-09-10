const mongoose=require('mongoose');
const HomePageSchema=new mongoose.Schema({
    bannerSection:{
        title:String,
        subTitle:String,
        banner:String
    },
    sectionOne:{
        title:String,
        discription:String
    },
    sectionTwo:{
        title:String,
        discription:String,
        linkText:String,
        backGroundImageUrl:String
    },
    sectionThree:{
        title:String,
        discription:String,
        linkText:String,
        backGroundImageUrl:String
    },
    sectionFour:{
        title:String,
        discription:String,
        linkText:String,
        backGroundImageUrl:String
    },
    sectionFive:{
        title:String,
        discription:String,
        linkText:String,
        backGroundImageUrl:String
    },
})
module.exports=new mongoose.model("HomePage",HomePageSchema);