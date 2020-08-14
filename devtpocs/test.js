var fs = require('fs')

var parseOpts = (txt) => {
    var lines = txt.split("\n")
    var regline = /\s+--([a-zA-Z]+)\s(.+)\s\[(.*)\]/
    let opt = null
    let opts = []
    lines.forEach(element => {
        let res = /\s+-(\S+)\s(-*\d+)\.+(\S+)\s\[(.*)\]/.exec(element)
        if(res) {
            if(opt) opts.push(opt)
            opt = {
                name: res[1],
                min: parseFloat(res[2]),
                max: parseFloat(res[3]),
                default: res[4],
                description: ""
            }
        }
        else {
            res = regline.exec(element)
            if(res) {
                if(opt) opts.push(opt)
                opt = {
                    name: res[1],
                    select: res[2].split("|"),
                    default: res[3],
                    description: ""
                }
            }
            else {
                res = /\s+--.*/.exec(element) 
                if(res) {
                    if(opt) opts.push(opt)
                    opt = null
                }
                else
                    if(opt) opt.description += element
            }
        }
    });

    console.log(opts)
}


try {  
    var data = fs.readFileSync('test.txt', 'utf8');
    parseOpts(data.toString());    
} catch(e) {
    console.log('Error:', e.stack);
}