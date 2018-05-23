"use strict";
var binaryParserClass = class bparser  {  
  constructor(bitmapJson, data, start=0) {
    if(start<0){
      start=0;
    }
    
    this.bitmapJson=bitmapJson;

    var startPos=start;
    for (var key in this.bitmapJson) {
      this[key]= this.data.slice(startPos,startPos+this.bitmapJson[key])
      startPos=startPos+ this.bitmapJson[key];
      this.lastPosition=startPos;
    }
  }
}

module.exports = binaryParserClass;


