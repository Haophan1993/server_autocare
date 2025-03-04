import {servicepostBookAppointment, serViceVerifyEmail} from '../services/patientService.js';

const postBookAppointment = async(req, res)=>{
    
    //console.log('Data From client ', req.body);

    try{
        if(req.body){
            let bookingResult= await servicepostBookAppointment(req.body);
            res.status(200).json(bookingResult);

        }else{
            res.status(200).json({
                message: 'Missing Booking Data'
            })
        }
        


    }catch(e){
        console.log(e);
        res.status(200).json({
            message: 'Error From Server'
        })
    }

}

const postVerifyEmail = async(req, res)=>{
    try{
        
        let result= await serViceVerifyEmail(req.body);
        //console.log(result.message);
        res.status(200).json(result.message);


    }catch(e)
    {
        console.log(e);
        res.status(200).json({
            message: 'Error From Server'
        })

    }

}
export {postBookAppointment, postVerifyEmail}