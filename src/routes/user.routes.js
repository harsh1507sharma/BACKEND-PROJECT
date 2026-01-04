import { Router } from "express";
import { loginUser, registerUser ,logoutuser, refreshaccesstoken, changecurrentpassword, getcurrentuser, updateaccountdeatail, avatarupdate, coverimageupdate ,useraccountcontroller,getwatchhistory} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/authenticate.middleware.js";  


const router = Router();

router.route("/register").post(
    (req, res, next) => {
        console.log("🔥 REGISTER ROUTE HIT");
        next();
    },
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverimage", maxCount: 1 }

    ]),
    registerUser)

router.route("/login").post(loginUser)


//secured routes

router.route("/logout").post(verifyjwt,logoutuser)
router.route("/refresh-token").post(refreshaccesstoken)
router.route("/changecurrentpassword").post(verifyjwt,changecurrentpassword)
router.route("/currentuser").post(verifyjwt,getcurrentuser)
router.route("/update").patch(verifyjwt,updateaccountdeatail)
router.route("/updateavatar").patch(verifyjwt,upload.single("avatar"),avatarupdate)
router.route("/coverimageupdate").patch(verifyjwt,upload.single("coverimage"),coverimageupdate)
router.route("/c/:username").get(verifyjwt,useraccountcontroller)
router.route("/history").get(verifyjwt,getwatchhistory)






export default router;





