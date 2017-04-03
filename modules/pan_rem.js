/* PanRem - Panasonic Network Remote Control
 * @description      Node modul using the SOAP API of Panasonic
 * Viera Devices by simulating a IOS device. The API provides 
 * no backchannel to read out settings of the device (for hints, 
 * i'm grateful), which is difficult to use modul and remote
 * control at same time. The VTxxx device series suports WOL
 * to power on the device from suspent mode, XTxxx series not.
 * 
 * @ctreator         Stephan Kirchhoff <st.kirchhoff@phentas.com>
 * 
 */

"use strict";
var http = require('http');
var sys = require('sys')
var exec = require('child_process').exec;


// TV REMOTE COMMANDS

const CHANNEL_DOWN  = "NRC_CH_DOWN-ONOFF";  // channel down
const CHANNEL_UP    = "NRC_CH_UP-ONOFF";    // channel up
const VOLUME_UP     = "NRC_VOLUP-ONOFF";    // volume up
const VOLUME_DOWN   = "NRC_VOLDOWN-ONOFF";  // volume down
const MUTE          = "NRC_MUTE-ONOFF";     // mute
const TV_ON         = "NRC_TV-ONOFF";       // TV mode on
const CHANGE_INPUT  = "NRC_CHG_INPUT-ONOFF" // chnage video input channel
const RED_BUTTON    = "NRC_RED-ONOFF";      // red
const GREEN_BUTTON  = "NRC_GREEN-ONOFF";    // green
const YELLOW_BUTTON = "NRC_YELLOW-ONOFF";   // yellow
const BLUE_BUTTON   = "NRC_BLUE-ONOFF";     // blue
const VIERA_TOOLS   = "NRC_VTOOLS-ONOFF";   // VIERA tools
const EXIT          = "NRC_CANCEL-ONOFF";   // Cancel / Exit
const OPTION_MENU   = "NRC_SUBMENU-ONOFF";  // Option
const RETURN        = "NRC_RETURN-ONOFF";   // Return
const CTRL_ENTER    = "NRC_ENTER-ONOFF";    // Control Center click / enter
const CTRL_RIGHT    = "NRC_RIGHT-ONOFF";    // Control RIGHT
const CTRL_LEFT     = "NRC_LEFT-ONOFF";     // Control LEFT
const CTRL_UP       = "NRC_UP-ONOFF";       // Control UP
const CTRL_DOWN     = "NRC_DOWN-ONOFF";     // Control DOWN
const THREE_DEE     = "NRC_3D-ONOFF";       // 3D button
const READ_SD_CARD  = "NRC_SD_CARD-ONOFF";  // SD-card
const ASPECT_RATIO  = "NRC_DISP_MODE-ONOFF";// Display mode / Aspect ratio
const MAIN_MENU     = "NRC_MENU-ONOFF";     // Menu
const INTERNET      = "NRC_INTERNET-ONOFF"; // VIERA connect
const VIERA_LINK    = "NRC_VIERA_LINK-ONOFF"; // VIERA link
const EPG           = "NRC_EPG-ONOFF";      // Guide / EPG
const VIDEO_TEXT    = "NRC_TEXT-ONOFF";     // Text / TTV
const SUBTITLES     = "NRC_STTL-ONOFF";     // STTL / Subtitles
const INFO          = "NRC_INFO-ONOFF";     // info
const CHANNEL_INDEX = "NRC_INDEX-ONOFF";    // TTV index
const IMAGE_FREEZE  = "NRC_HOLD-ONOFF";     // TTV hold / image freeze
const LAST_CHANNEL  = "NRC_R_TUNE-ONOFF";   // Last view
const POWER_OFF     = "NRC_POWER-ONOFF";    // Power off

// Video / DVD / BlueRay Control Commands
const REWIND        = "NRC_REW-ONOFF";      // rewind
const PLAY          = "NRC_PLAY-ONOFF";     // play
const FASTFORWARD   = "NRC_FF-ONOFF";       // fast forward
const SKIP_PREV     = "NRC_SKIP_PREV-ONOFF";// skip previous
const PAUSE         = "NRC_PAUSE-ONOFF";    // pause
const SKIP_NEXT     = "NRC_SKIP_NEXT-ONOFF";// skip next
const STOP          = "NRC_STOP-ONOFF";     // stop
const RECORD        = "NRC_REC-ONOFF";      // record

// NUMERIC BUTTONS OF REMOTE CONTROL
const BTN_1         = "NRC_D1-ONOFF";
const BTN_2         = "NRC_D2-ONOFF";
const BTN_3         = "NRC_D3-ONOFF";
const BTN_4         = "NRC_D4-ONOFF";
const BTN_5         = "NRC_D5-ONOFF";
const BTN_6         = "NRC_D6-ONOFF";
const BTN_7         = "NRC_D7-ONOFF";
const BTN_8         = "NRC_D8-ONOFF";
const BTN_9         = "NRC_D9-ONOFF";
const BTN_0         = "NRC_D0-ONOFF";

// COMMANDS OF EXTENDED FUNCTIONS
const NOISE_REDUCTION = "NRC_P_NR-ONOFF";   // P-NR (Noise reduction)
const TIMER         = "NRC_OFFTIMER-ONOFF"; // off timer
const INFO_2        = "NRC_R_TUNE-ONOFF";   // Seems to do the same as INFO

// API request content
const REQ_CNT       = '<?xml version="1.0" encoding="utf-8"?>'
                    +'<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">'
                    +'<s:Body>'
                    +'<u:X_SendKey xmlns:u="urn:panasonic-com:service:p00NetworkControl:1">'
                    +'<X_KeyEvent>PANREM_CMD</X_KeyEvent>'
                    +'</u:X_SendKey>'
                    +'</s:Body>'
                    +'</s:Envelope>';

module.exports = (function(){
    
    // private area
    var options, data, on_response_call_back, settings, channels, com, that;

    // constructor
    var PanRem = function (){
        console.log("PanRem started.");
    };

    // prepare command for sending
    var call_command = (_cmd)=>{
        data = REQ_CNT.replace("PANREM_CMD",_cmd);
        options.headers['Content-Length'] =  Buffer.byteLength(data);
        send_request(data);

        return PanRem.prototype;
    };

    // send command to device
    var send_request = (data)=>{
        
        com = http.request(options, function(chunk) {
            on_any(chunk);
        }).on('data', function (chunk) {
            on_response_call_back(chunk);
            on_any(chunk);
        }).on('error', function (chunk) {
            on_response_error(chunk);
            on_any(chunk);
        }).on('end', function (chunk) {
            on_any(chunk);
        }).write(data);
        //com.end();
    }
    // event if request sucess
    var on_response_call_back = ()=>{

    };
    // event if request throws error
    var on_response_error = ()=>{

    };
    // event for both, sucess & error
    var on_any = ()=>{

    };

    // public area
    
    /* list_devices
     * @description - writes list of devices in local network
     * to console. 
     */
    PanRem.prototype.list_devices = ()=>{
        exec(" ifconfig | grep broadcast | arp -a", (error, stdout, stderr)=>{
            if (error !== null) {
                console.log('exec error: ' + error);
            }else{
                var out = stdout.split("\n");
                for(var part in out){
                    try{
                        console.log(out[part].split(" ")[0] + " - " + out[part].split(" ")[1].replace("(","").replace(")",""));
                    }catch(e){}
                }
            }
        });
    };

    /* 
     *
     */
    PanRem.prototype.define_device = (host_ip, host_port)=>{
        
        options = {
            host:host_ip,
            port:host_port,
            path: '/nrc/control_0',
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml;charset="utf-8"',
                'User-Agent': 'Panasonic iOS VR-CP UPnP/2.0',
                'Accept': 'text/xml',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'SOAPACTION': '"urn:panasonic-com:service:p00NetworkControl:1#X_SendKey"',
                'Content-Length': Buffer.byteLength(REQ_CNT)
            }
        }        

        console.log("Device configured with:");
        console.log(options);
        return PanRem.prototype;
    };
    PanRem.prototype.next_channel = ()=>{
        call_command(CHANNEL_DOWN);
        console.log(options);
        return PanRem.prototype;
    };
    PanRem.prototype.prev_channel = ()=>{
        call_command(CHANNEL_UP);
        console.log(options);
        return PanRem.prototype;
    };
    PanRem.prototype.channel_by_number = (_n)=>{
        
        _n = Number.isInteger(_n)?_n.toString(10):_n;
        var i = _n.length;

        while(i>0){
            call_command("NRC_D"+_n.substr((i)*-1,1)+"-ONOFF");
            i-=1;
        }
    };
    PanRem.prototype.then = (_f)=>{
        _f();
        return PanRem.prototype;
    };
    PanRem.prototype.scopeTest = ()=>{
        console.log();
    };

    // events
    PanRem.prototype.on = (_e,_f)=>{

        switch(_e){
            case "response":
                on_response_call_back = _f;
                break;
            case "response_error":
                on_response_error = _f;
                break;
            default:
                on_any = _f;
                break;
        }
        return PanRem.prototype;
    };

    return PanRem;
}());
