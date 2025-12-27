import { Router } from "express";
import { loginUser, registerUser ,logoutuser, refreshaccesstoken } from "../controllers/user.controller.js";
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


export default router;





