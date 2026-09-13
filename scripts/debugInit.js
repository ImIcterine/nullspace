import { version, copyright, rights } from "./constants.js"

export const sysMenuPad = 25

export function initDebug() {
    addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "f3") {
            e.preventDefault()

            const menu = document.getElementById("debugmenu")
            menu.style.display = window.getComputedStyle(menu).display === "none" ? "block" : "none"
        }
    })

    const debugAbout = document.getElementById("debugbtnAbout")
    const debugGame = document.getElementById("debugbtnGame")
    const debugSys = document.getElementById("debugbtnSys")
    const debugLog = document.getElementById("debugbtnLog")
    const debugDiagn = document.getElementById("debugbtnDiagn")

    const debugcontAbout = document.getElementById("debugcontentAbout")
    const debugcontGame = document.getElementById("debugcontentGame")
    const debugcontSys = document.getElementById("debugcontentSys")
    const debugcontLog = document.getElementById("debugcontentLog")
    const debugcontDiagn = document.getElementById("debugcontentDiagn")

    function resetTabs() {
        const buttons = document.querySelectorAll(".debugcontbutton")
        const content = document.querySelectorAll(".debugcontent")

        buttons.forEach((btn) => btn.classList.remove("debugcontbuttonsel"))
        content.forEach((cont) => cont.classList.remove("debugcontentsel"))
    }

    debugAbout.onclick = () => {
        resetTabs()
        debugAbout.classList.add("debugcontbuttonsel")
        debugcontAbout.classList.add("debugcontentsel")
    }

    debugGame.onclick = () => {
        resetTabs()
        debugGame.classList.add("debugcontbuttonsel")
        debugcontGame.classList.add("debugcontentsel")
    }

    debugSys.onclick = () => {
        resetTabs()
        debugSys.classList.add("debugcontbuttonsel")
        debugcontSys.classList.add("debugcontentsel")
    }

    debugLog.onclick = () => {
        resetTabs()
        debugLog.classList.add("debugcontbuttonsel")
        debugcontLog.classList.add("debugcontentsel")
    }

    debugDiagn.onclick = () => {
        resetTabs()
        debugDiagn.classList.add("debugcontbuttonsel")
        debugcontDiagn.classList.add("debugcontentsel")
    }
    
    // Init debug menu content
    {
        const title = document.createElement("p")
        title.textContent = "NULLSPACE " + version
        title.classList.add("bd")
        debugcontGame.appendChild(title)

        const cprt = document.createElement("p")
        cprt.innerHTML = copyright + "<br>" + rights
        debugcontGame.appendChild(cprt)
    }

    {
        let webglon = false
        let webgl2on = false
        let webgpuon = false
        {
            const cvs = document.createElement("canvas")
            const gl = cvs.getContext("webgl")
            if (gl) webglon = true
        }
        {
            const cvs = document.createElement("canvas")
            const gl = cvs.getContext("webgl2")
            if (gl) webgl2on = true
        }
        {
            const cvs = document.createElement("canvas")
            const gl = cvs.getContext("webgpu")
            if (gl) webgpuon = true
        }

        const webgltext = document.createElement("p")
        webgltext.textContent = `${"WebGL 1.0 supported:".padEnd(sysMenuPad, "\u00A0")}${webglon ? "Yes" : "No"}`
        debugcontSys.appendChild(webgltext)

        const webgl2text = document.createElement("p")
        webgl2text.textContent = `${"WebGL 2.0 supported:".padEnd(sysMenuPad, "\u00A0")}${webgl2on ? "Yes" : "No"}`
        debugcontSys.appendChild(webgl2text)

        const webgputext = document.createElement("p")
        webgputext.textContent = `${"WebGPU supported:".padEnd(sysMenuPad, "\u00A0")}${webgpuon ? "Yes" : "No"}`
        debugcontSys.appendChild(webgputext)

        const graphicsenginetext = document.createElement("p")
        graphicsenginetext.id = "graphicsengine"
        graphicsenginetext.textContent = `${"Graphics Engine:".padEnd(sysMenuPad, "\u00A0")}Loading...`
        debugcontSys.appendChild(graphicsenginetext)
    }
}