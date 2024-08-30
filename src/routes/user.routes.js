import { Router } from "express";
import { loginUser, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//for files 
router.route('/register').post(
    upload.fields([// array with can accept multiple fields
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
]),registerUser)


//post beacuse ham info lere hai
router.route('/login').post(loginUser)



//secured route due to token
router.route('/logout').post(verifyJWT , logoutUser) // isse middleware ka next() batayega ki verifyJwt kai baad logoutuser chalao

//endpoint of refresh token 
router.route("refresh-token").post(refreshAccessToken)
export default router;