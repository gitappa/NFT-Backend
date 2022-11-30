const http = require("http");
const https = require("https");
class CommonClass{
    //HTTP GET AND POST CALL/
    callHttpApi(params) {
        console.log("invoked callHttpApi!");
        return new Promise((resolve, reject) => {
            if (params.method === "GET") {
                console.log("[INFO] callHttpApi :: calling get request", params.url);
                https.get(params.url, response => {
                    console.log("[INFO] callHttpApi :: status code",response.statusCode);
                    if(response.statusCode===200){
                        response.setEncoding("utf8");
                        let body = "";
                        response.on("data", data => {
                            body += data;
                        });
                        response.on("end", () => {
                            body = JSON.parse(body);
                            resolve(body);
                            //return body
                        });
                    }else if (response.statusCode!=200 && params.hasOwnProperty("fallback_url") && params.fallback_url){
                        console.log("calling fallback API");
                        https.get(params.fallback_url, response => {
                            console.log("[INFO] callHttpApi :: calling get request", params.fallback_url);
                            response.setEncoding("utf8");
                            let body = "";
                            response.on("data", data => {
                                body += data; 
                            });
                            response.on("end", () => {
                                body = JSON.parse(body);
                                // callback(body);
                                //console.log("resolving promise", body);
                                resolve(body);
                            });
                        });
                    }else{
                        //reject(`${response.statusCode} error`)
                        console.log(`${response.statusCode} on HTTP call`);
                        
                    }
          
                }).on('error', err => {
                    console.log('Error: ', err.message);
                })
            }else if (params.method === "POST") {
                var options = {
                "hostname": params.domain,
                "path": params.path,
                "port": params.port,
                "method": "POST",
                "headers": params.headers
                };
                console.log("[INFO] callHttpApi :: calling post request", params);
                var req = https.request(options, resp => {
                    //console.log(resp);
                    resp.setEncoding("utf8");
                    let body = "";
                    resp.on("data", data => {
                        body += data; 
                    });
                    resp.on("end", () => {
                        try{
                            body = JSON.parse(body);
                            console.log("body response ------------------>: ",body);
                        }catch (e) {
                            console.log("***********exception************",e);
                        }
                        //console.log("body : ",body);
                        // callback(body);
                        // return body;
                        resolve(body);
                    });
                })
                req.on('error', error => {
                    console.log('Error: ', err.message);
                });
                //console.log('Http response -1');
                req.write(params.data);
                //console.log('Http response -2');
                req.end();
                //console.log('Http response -3');
            } else {
                console.log("[ALARM] callHttpApi :: unsupported http method");
                reject("unsupported http method");
            }
        });
    }
}

module.exports=CommonClass