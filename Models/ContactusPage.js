const mongoose=require("mongoose");
const ContactusPageSchema=new mongoose.Schema({
    bannerSection:{
        title:String,
        description:String,
        backgroundImage:String
    },
    contactDetails:{
        address:String,
        phone:String,
        email:String,
        mapEmbedLink:String,
        workingHours:String,
        mapImage:String
    },
    enquiryForm:[
        {
            isResolved:{type:Boolean,default:false},
            name:String,
            email:String,
            phone:String,
            subject:String,
            message:String
        }
    ]
})
module.exports=mongoose.model("ContactusPage",ContactusPageSchema);