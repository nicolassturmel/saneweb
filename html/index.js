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
        let filename = document.getElementById("configuration-filename").value || (Date.now()+ ".jpg")
        fetch("/scannow?device=" + selectedDevice + "&file=" + filename  + args)
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
    document.getElementById("group").onclick = () => {
        let args = []
        let filename = document.getElementById("configuration-filename").value || (Date.now()+ ".pdf")
        filesList.forEach((f, id) => {
            args.push("&file" + id + "=" + f )
        })
        fetch("/group?&destination=" + filename  + args)
	    .then(response => response.json())
        .then(response => {
            listFiles
        })
    }
    document.getElementById("configuration-increment").onchange = () => {
        listFiles(document.getElementById("configuration-increment").value)
    }

}

var listFiles = (inc,deleteF) => {
    let args = ""
    if(inc)
        args += "?increment=" + document.getElementById("configuration-increment").value
    if(deleteF)
        args += "?delete=" + deleteF

    let cont = document.getElementById("files")
    cont.innerHTML = ""
    let namef = document.createElement("span")
    namef.innerHTML = "Current files<br>--"
    cont.appendChild(namef)
    fetch("/files" + args)
	.then(response => response.json())
    .then(response => {
        response.files.forEach(f => {
            let fn = document.createElement("div")
            fn.className = "file"
            fn.id = "file-" + f;
            let namef = document.createElement("span")
            namef.className = "fileName"
            namef.innerHTML = f
            fn.appendChild(namef)
            let show = document.createElement("span")
            show.innerHTML = "🔎"
            show.className = "showPic"
            show.onclick = () => { 
                let i = document.getElementById("results")
                i.innerHTML = ""
                let im = document.createElement("img")
                im.src = "./scans/" + f
                i.appendChild(im)
             }
             fn.appendChild(show)
            let del = document.createElement("span")
            del.innerHTML = " X"
            del.className = "del"
            del.onclick = () => { console.log("Delete",f) ; listFiles(null,f) }
            fn.appendChild(del)
            cont.appendChild(fn)
            namef.onclick = () => {
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
        document.getElementById("configuration-increment").value = response.increment
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

