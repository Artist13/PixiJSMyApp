const express = require("express");
const app = express();
const path = require("path");

app.use((request, response, next) => {
    console.log(request.headers);
    next();
})

app.use((request, response, next) =>{
    request.chance1 = Math.round(Math.random() * 9) + 1;
    request.chance2 = Math.round(Math.random() * 9) + 1;
    next();
})


app.get('/', (request, response) =>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.json({
        "first": request.chance1,
        "second": request.chance2
    });
})



app.listen(3030, (err) => {
    if(err){
        return console.log('somthing bad', err);
    }
    console.log("Server up");
})