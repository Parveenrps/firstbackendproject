import mongoose, {Schema} from "mongoose";

const userSchema = new Schema(
    {
    //id bydefault mongodb add kar deta hai
        username:{
            type: String,
            require: true,
            unique : true,
            lowercase: true,
            trim : true,
            index : true
        },

        email:{
            type: String,
            require: true,
            unique : true,
            lowercase: true,
            trim : true,
        },

        fullname:{
            type: String,
            require: true,
            trim : true,
            index: true
        },
        avatar:{
            type: String, //cloundinary url
            require: true,
        },

        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],

        password :{
            type: String,
            require: [true, "Password is required"]
        },

        refreshToken:{
            type: String
        }


    }, 
    {
        timestamps: true
    }
)


export const User = mongoose.model("User", userSchema);