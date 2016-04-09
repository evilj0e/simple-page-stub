var express = require("express");
var app = express();
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + "/build"));

app.get("/", function (request, response) {
    response.sendFile(__dirname + "/build/index.html");
});

app.listen(port, function () {
    console.log("Listening on " + port);
});
