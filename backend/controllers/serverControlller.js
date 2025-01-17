import db from '../models/userModel.js';

let getHomePage = async (req,res)=>{
    try{
        
        return res.render('../views/displayCRUD.ejs')
        

    }catch(e){
        console.log(e)
    }
    

}

export{
    getHomePage
}