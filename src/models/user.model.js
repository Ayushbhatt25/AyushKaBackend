import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username : {
            type : String ,
            required : true ,
            unique : true ,
            lowcase : true ,
            trim : true
        } ,
            email : {
            type : String ,
            required : true ,
            unique : true ,
            lowcase : true ,
            trim : true
        },
            fullname : {
            type : String ,
            required : true ,
            lowcase : true ,
            trim : true
        },
            avatar : {
            type : String ,
            required : true 
        } ,
            coverimage : {
            type : String ,

        },

            watchHistoy : {
                type : Schema.Types.ObjectId,
                ref : video
            },
            password : {
                type : String ,
                required : [true , "Password is Required"]
            },
            refreshToekn : {
                type : String 
            }
},
    {timestamps : true }

)
userSchema.pre("save", async function (next){
    if (this.isModeifed("password")) return next();

    
   this.password= bcrypt.hash(this.password, 10)
    next()
})
userSchema.methods.isPassowrdCorrect = async function (password){
    return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateAccessToken + function(){
    jwt.sign(
        {
            _id : this.id,
            email :this.email,
            username : this.username,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )

}
userSchema.methods.generateRefreshToken + function(){
    jwt.sign(
        {
            _id : this.id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const user = mongoose.model("User", userSchema)