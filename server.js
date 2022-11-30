//import initRoutes from "./src/routes";
const initRoutes = require("./src/routes");
const cors = require("cors");
const express = require("express");
const app = express();
//const morgan = require('morgan');
const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
require("dotenv").config();

let corsOptions = {
    origin: ["http://localhost:8081", 
        "https://unthink.shop/", 
        "https://unthink.ai/", 
        "https://shop.budgettravel.com/",
        "https://unthink.shop",
        "https://unthink.ai",
        "https://shop.budgettravel.com",
        "https://unthink-ui-gatsby-unthink-stage-qvde2butpa-uc.a.run.app/",
        "https://unthink-ui-gatsby-unthink-stage-qvde2butpa-uc.a.run.app"
    ]   
};

app.use(cors(corsOptions));



app.use(express.urlencoded({ extended: true }));
initRoutes(app);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});