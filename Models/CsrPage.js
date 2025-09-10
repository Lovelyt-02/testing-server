const mongoose=require('mongoose');
const CsrPageSchema=new mongoose.Schema({
    bannerSection:{
        title:String,
        description:String,
        backgroundImage:String
    },
    sectionOne:{
        title:String,
        description:String,
    },
    sectionTwo:{
        title:String,
        subProducts:[
            {
                title:String,
                image:String
            }
        ]
    }
})
module.exports=mongoose.model('CsrPage',CsrPageSchema);