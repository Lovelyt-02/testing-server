const mongoose=require('mongoose');
const longinSchema=new mongoose.Schema({
    username:{type:String,required:true},
    password:{type:String,required:true}
})
module.exports=mongoose.model('Login',longinSchema);