const { stringify } = require("querystring");
const commonCall = require("./common");
const newCommonObj = new commonCall()

    function getDateIssue(){
        const date = new Date();
        const formatData = (input) => {
            if (input > 9) {
            return input;
            } else return `0${input}`;
        };
        const format = {
            dd: formatData(date.getDate()),
            mm: formatData(date.getMonth() + 1),
            yyyy: date.getFullYear(),
            HH: formatData(date.getHours()),
            MM: formatData(date.getMinutes()),
            SS: formatData(date.getSeconds()),
        };
        
        
        var format24Hour = `${format.mm}/${format.dd}/${format.yyyy} ${format.HH}:${format.MM}:${format.SS}`
        return format24Hour
    }

    async function getAliceId(user_id){
        console.log("....invoked getAliceId function....")
        var Hedera_address = ""
        var data = {
            "access_key": "e191921352124a06a09bb811a86a5c3a",
            "user_id": user_id
        }
        return newCommonObj.callHttpApi({
            "method": "GET",
            "url": "https://api.yfret.com/users/get_user_info/?" + stringify(data),
        }).then((result) => {
            if(result.data["venlyUser"] && Object.keys(result.data.venlyUser).length>0){
                if(result.data.venlyUser.wallets.length>0 && result.data.venlyUser.wallets[0]["secretType"] === "HEDERA"){
                    Hedera_address = result.data.venlyUser.wallets[0]["address"]
                }
            }
            return Hedera_address
        });
    }


module.exports = {getDateIssue,getAliceId}