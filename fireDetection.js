const Key = require('./secret.json');
const cors = require('cors');
const express = require('express');

var mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

isFire = false;
fireWebsocketTemp = "";
posNameTemp = "";
app.post("/api/SocketDataReceive", (req, res)=>{
    const {posId} = req.body;
    console.log(posId)

    var con = mysql.createConnection({
        host: Key.host,
        port: Key.port,
        user: Key.user,
        password: Key.password,
        database: Key.database
    });
    

    con.connect(function(err){
        if (err) throw err;
        var sql = "SELECT pos_id, pos_name, websocketurl FROM cctv JOIN sensor_pos ON cctv.sensorpos_id = sensor_pos.pos_id";
        
        con.query(sql, function(err,result, fields){
            if (err) throw err;
            var cctvListLength = result.length;
            for(var i=0; i<cctvListLength; i++){
                
                if(result[i].pos_id == posId){
                    posNameTemp = result[i].pos_name
                    fireWebsocketTemp = result[i].websocketurl
                    isFire = true
                    break
                }
            }
            con.end();

        })
    });

    res.json({ok : true})

})

app.get("/api/fireDetection",(req, res)=>{
    if(isFire === false){
        res.send({nodetection : "No detection", detection : false, detectionUrl : "none", posName : ""});
    }
    else{
        
        console.log(fireWebsocketTemp)
        console.log(posNameTemp)
        res.send({detection : true, detectionUrl : fireWebsocketTemp, posName : posNameTemp});
        isFire = false;
    }
    
})

app.listen(3000, () => console.log("CCTV Fire Detection Server On"));