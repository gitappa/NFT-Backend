const express = require("express");
const router = express.Router();
const mintCall = require("../controller/mint");
//import controllerCall from "../controller/mint";

let routes = (app) => {
    router.post("/transferNFT",function(req, res){
        mintCall.createAndMitNFT(req,res)
    });
    app.use(router);
};
  
module.exports = routes;