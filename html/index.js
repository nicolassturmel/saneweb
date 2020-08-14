var selectedDevice = 0
var options = []

window.onload = () => {

    document.getElementById("devices").innerHTML = "Searching network..."
    document.getElementById("scanbutton").onclick = () => {
        let i = document.getElementById("results")
        i.innerHTML = "Scanning..."
        let args = ""
        options.forEach(o => {
            let v = document.getElementById("option-value-" + o.name)
            if(v && v.value != o.default)
                args += "&" + o.name + "=" + v.value
        })
        fetch("/scannow?device=" + selectedDevice + "&file=" + Date.now() + ".jpg" + args)
	.then(response => response.json())
        .then(response => {
            let i = document.getElementById("results")
            i.innerHTML = ""
            let im = document.createElement("img")
            im.src = response.file
            i.appendChild(im)
        })
    }
}

var deviceSelected = () => {
    fetch("/options?device=" + selectedDevice)
	.then(response => response.json())
        .then(response => {
            options = response
            let i = document.getElementById("options")
            i.innerHTML = ""
            response.forEach(r => {
                if(r.default != "inactive") {
                    let cont = document.createElement("div")
                    cont.id = "options-" + r.name
                    cont.className = "options-cont"
                    let name = document.createElement("span")
                    name.className = "option-name"
                    name.innerHTML = r.name
                    cont.appendChild(name)
                    if(r.select) {
                        let select = document.createElement("select")
                        select.className = "option-select"
                        select.id = "option-value-" + r.name
                        r.select.forEach(s => {
                            var opt = document.createElement('option');
                            opt.value = s
                            opt.innerHTML = s
                            select.appendChild(opt);
                        })
                        select.value = r.default
                        cont.appendChild(select)
                    }
                    else {
                        let input = document.createElement("input")
                        input.className = "option-input"
                        input.id = "option-value-" + r.name
                        input.value = r.default
                        cont.appendChild(input)
                    }
                    i.appendChild(cont)   
                }
            })
        })
}

fetch("/listdevices")
.then(response => response.json())
.then(a => { 
    let c = document.getElementById("devices")
    c.innerHTML = ""
    if(a.length == 0) {
        let d = document.createElement("div")
        d.innerHTML = "Is the printer powered ?"
        d.className = "device"
        c.appendChild(d)
    }
    else {
        a.forEach((element,index) => {
            let d = document.createElement("div")
            d.innerHTML = "[" + index + "] " + element.name
            d.className = "device"
            d.id = "device" + index
            d._data = {index: index}
            c.appendChild(d)
        });
        document.getElementById("device0").classList.add("selected")
        selectedDevice = 0
        deviceSelected(selectedDevice)
    }


})
