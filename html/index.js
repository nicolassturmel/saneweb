var selectedDevice = 0
var options = []
var filesList = []

window.onload = () => {
    listFiles()
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
            listFiles()
        })
    }
}

var listFiles = () => {
    let cont = document.getElementById("files")
    cont.innerHTML = ""
    let namef = document.createElement("span")
    namef.innerHTML = "Current files"
    cont.appendChild(namef)
    fetch("/files")
	.then(response => response.json())
    .then(response => {
        response.forEach(f => {
            let fn = document.createElement("div")
            fn.className = "file"
            fn.id = "file-" + f;
            let namef = document.createElement("span")
            namef.innerHTML = f
            fn.appendChild(namef)
            let del = document.createElement("span")
            del.innerHTML = " X"
            del.className = "del"
            fn.appendChild(del)
            cont.appendChild(fn)
            fn.onclick = () => {
                if(!filesList.includes(f)) {
                    filesList.push(f)
                    fn.classList.add("selected")
                }
                else {
                    filesList.splice(filesList.indexOf(f),1)
                    fn.classList.remove("selected")
                }
            }
            if(filesList.includes(f)) fn.classList.add("selected")
        })
    })
}

var deviceSelected = (test) => {
    console.log(test)
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
    a = [{ name: "testA"},{ name: "testB"}]
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
            d.onclick = () => {
                let items = document.querySelectorAll(".device")
                items.forEach(it => {
                    if(it._data.index == index)
                        it.classList.add("selected")
                    else
                        it.classList.remove("selected")
                })
                if(index != selectedDevice) {
                    selectedDevice = index
                    deviceSelected(selectedDevice)
                }
            }
            c.appendChild(d)
        });
        document.getElementById("device0").classList.add("selected")
        selectedDevice = 0
        deviceSelected(selectedDevice)
    }


})

