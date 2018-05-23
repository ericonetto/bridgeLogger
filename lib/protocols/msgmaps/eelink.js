var msgmap={
    mark:2,
    pid:1,
    size:2,
    sequence:2,
    content:{
      "01":{
        imei:8,
        language:1,
        timezone:1,
        sysver:2,
        appver:2,
        psver:2,
        psosize:2,
        pscsize:2,
        pssum16:2
      },
      "03":{
        status:2
      },
      "12":{
        location:{
          time:4,
          mask:1,
          masks:{
            bit0:{
              latitude:4,
              longitude:4,
              altitude: 2,
              speed: 2,
              course: 2,
              satellites: 1
            },
            bit1:{
              mcc:2,
              mnc:2,
              lac: 2,
              cid: 4,
              rxlev: 1
            },
            bit2:{
              lac: 2,
              cid: 4,
              rxlev: 1
            },
            bit4:{
              lac: 2,
              cid: 4
            }
          }
        },
        status:2,
        battery:2,
        ain0:2,
        ain1:2,
        mileage:4,
        gsmcntr:2,
        gpscntr:2,
        pdmstep:2,
        pdmtime:2,
        temperature:2,
        humidity:2,
        illuminance:4,
        co2:4        
      }
    }
  }


  module.exports = msgmap;
