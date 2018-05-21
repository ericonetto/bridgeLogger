"use strict";
var binaryParserClass = class bparser  {  
  constructor(bitmapJson, data) {
    this.bitmapJson=bitmapJson;
    this.data=data;

    var startPos=0;
    for (var key in this.bitmapJson) {
        this[key]= this.data.slice(startPos,startPos+this.bitmapJson[key])
        startPos=startPos+ this.bitmapJson[key];
        this.lastPosition=startPos;
    }
  }
}

module.exports = binaryParserClass;


