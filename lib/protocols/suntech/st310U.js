function parse(msg){
    var msgParts=msg.split(";");
    var hdr=msgParts[0];
    
    if (hdr=="SA200STT"){
        var YYYY=msgParts[3].substr(0, 4);
        var MM=msgParts[3].substr(4, 2);
        var DD=msgParts[3].substr(6, 2);
        var hms=msgParts[4];
        //YYYY-MM-DDThh:mm:ss
        dt=Date.parse(YYYY + "-" + MM+  "-" + DD + "T" + hms);
        return {
                id:msgParts[1],
                sw_ver:msgParts[2],
                _ts:dt,
                cell:msgParts[5],
                lat:Number(msgParts[6]),
                lon:Number(msgParts[7]),
                speed:Number(msgParts[8]),
                course:msgParts[9],
                satelites:Number(msgParts[10]),
                gpsfix:Number(msgParts[11]),
                dist:Number(msgParts[12]),
                pwrvolt:Number(msgParts[13]),
                ios:msgParts[14],
                mode:msgParts[15],
                msg_num:msgParts[16],
                h_meter:msgParts[17],
                bck_volt:Number(msgParts[18]),
                msg_type:msgParts[19]

                }
    }else{
        return null;
    }
}

module.exports = {
    parse: parse
};
  