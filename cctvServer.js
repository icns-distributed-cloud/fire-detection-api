const Stream = require('node-rtsp-stream');
const Key = require('./secret.json')
const cors = require('cors')
const express = require('express');
var mysql = require('mysql2');
const app = express();




app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

var con = mysql.createConnection({
    host: Key.host,
    port: Key.port,
    user: Key.user,
    password: Key.password,
    database: Key.database
});
streamList=  []
con.connect(function(err){
    if (err) throw err;
    var sql = "SELECT streamurl, websocketurl, user_id, password FROM cctv";
    con.query(sql, function(err,result, fields){
        if (err) throw err;
        var rtspListLength = result.length;
        var rtspList = []
        for(var i=0; i<rtspListLength; i++){
            var rtspDictionary = {}
            rtsp_param = result[i].user_id+':'+result[i].password+'@'
            rtsp_string = result[i].streamurl
            websocket_string = result[i].websocketurl
            rtspDictionary['url'] = rtsp_string.substr(0,7)+rtsp_param+rtsp_string.substr(7,rtsp_string.length)
            rtspDictionary['port'] = Number(websocket_string.substr(websocket_string.indexOf(':',4)+1,websocket_string.length))
            rtspList.push(rtspDictionary)
        }
        con.end();
        for(var i=0;i<rtspListLength;i++){
            openStream(rtspList[i])
        }
        //console.log(streamList[0].options.wsPort)
        
    })
})

function openStream(obj){
    var stream = new Stream({
        name: 'name',
        streamUrl : obj.url,
        wsPort: obj.port,
        width: 1280,
        height: 720,
    })
    streamList.push(stream)
}

app.post("/api/addStream", (req, res)=> {
    const {cctvLocation, password, streamURL, userId, websocketURL} = req.body;
    const newCCTV = {cctvLocation, password, streamURL, userId, websocketURL};
    var newStream = {};
    rtsp_param = newCCTV.userId+':'+newCCTV.password+'@';
    rtsp_string = newCCTV.streamURL;
    websocket_string = newCCTV.websocketURL;
    newStream['url'] = rtsp_string.substr(0,7)+rtsp_param+rtsp_string.substr(7,rtsp_string.length);
    newStream['port'] = Number(websocket_string.substr(websocket_string.indexOf(':',4)+1,websocket_string.length))
    console.log(newStream);
    openStream(newStream);
    res.json({ok : true})

})

app.post("/api/deleteStream", (req,res)=> {
    const {websocketURL} = req.body;
    const delSocket = {websocketURL}
    console.log(delSocket.websocketURL);
    websocket_string = delSocket.websocketURL
    var port = Number(websocket_string.substr(websocket_string.indexOf(':',4)+1,websocket_string.length));
    var streamListLength = streamList.length;
    var stop_index
    for(var i=0;i<streamListLength;i++){
        if(port == streamList[i].options.wsPort){
            streamList[i].stop();
            stop_index = i;
        }
    }
    const idx = streamList.indexOf(streamList[stop_index]) 
    if (idx > -1) streamList.splice(idx, 1)
    console.log(streamList)
    res.json({ok : true})

})


app.listen(3000, () => console.log("CCTV Websocket Server On"));








