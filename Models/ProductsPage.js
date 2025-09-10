const mongoose=require('mongoose');
const ProductsPageSchema=new mongoose.Schema({
        bannerSection:{
            title:String,
            subTitle:String,
            backgroundImage:String,
        },
        productsSection:[
            {
                image:String,
                title:String,
                description:String,
                toUrl:String,
            }
        ]
        
})
module.exports=mongoose.model('ProductsPage',ProductsPageSchema);