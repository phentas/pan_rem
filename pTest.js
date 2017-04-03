"use strict";
var panrem = require('./modules/pan_rem');

var vieraTX = new panrem();

vieraTX.on("response",(m)=>{
    console.log("sent");
}).on("response_error",(m)=>{
    console.log("Command couldn't sent.\n"+m);
}).on("device_list",(l)=>{
    console.log("List of devices in local network:");
    console.log(l);
});

vieraTX.define_device("192.168.0.1",5501);
vieraTX.list_devices();
