let x = 640; let y = 480;

let camX = 0; let camY = 0;

window.onload = async () => {
    await document.fonts.load('16px "DepartureMono"')

    function d() {
        alert("DEBUG: script")
    }

    function t(thing) {
        return JSON.stringify(thing)
    }

    function rad(deg) {
        return (Math.PI / 180) * deg
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
    }

    function low(value) {
        return value.toLowerCase()
    }

    function newTerminal(textObj) {
        if (!textObj || typeof textObj !== 'object') return null

        const usingFont = "DepartureMono"
        const endlid = "endl"

        const terminal = new PIXI.Container()

        // Background
        const bg = new PIXI.Graphics()
        bg.beginFill(textObj.color ?? 0x000000)
        bg.drawRect(0, 0, textObj.width, textObj.height)
        bg.endFill()
        
        terminal.addChild(bg)

        // Mask
        const mask = new PIXI.Graphics()
        mask.beginFill(0x000000)
        mask.drawRect(0, 0, textObj.width, textObj.height)
        mask.endFill()
        
        terminal.addChild(mask)

        // Base style
        const bs = new PIXI.TextStyle({
            fontFamily: usingFont,
            fontSize: textObj.size ?? 16
        })
        
        // Metrics
        const temp = new PIXI.Text({
            text: "M",
            style: {
                fontFamily: usingFont,
                fontSize: textObj.size ?? 16
            }
        })

        const cw = temp.width
        const ch = temp.height

        // Space between lines
        let padding = 4

        // Cursor start location
        let startCursorX = (textObj.colOffset ?? 0) * -cw
        let startCursorY = (textObj.lineOffset ?? 0) * -(ch + padding)

        // Cursor
        let offsetX = startCursorX
        let offsetY = startCursorY

        const charWidth = temp.width
        const charHeight = temp.height

        // Drawing
        for (let tx of textObj.text) {
            // Newline
            if (tx === endlid) {
                offsetX = startCursorX
                offsetY += ch + padding
                continue
            }

            // Style
            const style = new PIXI.TextStyle({
                fontFamily: usingFont,
                fontSize: textObj.size ?? 16,
                fill: tx.color ?? textObj.color ?? 0xffffff,
                fontWeight: tx.bold ? "bold" : "normal",
                fontStyle: tx.italic ? "italic" : "normal",
                textDecoration: (
                    (tx.underline ? "underline " : "") +
                    (tx.strikethrough ? "line-through" : "")
                ).trim()
            })

            // Text object
            const txt = new PIXI.Text({
                text: tx.text,
                style: style
            })

            txt.x = offsetX
            txt.y = offsetY

            // Highlight
            if (tx.highlight != null) {
                const hl = new PIXI.Graphics()
                hl.beginFill(tx.highlight)
                hl.drawRect(txt.x, txt.y, txt.width, txt.height)
                hl.endFill()
                terminal.addChild(hl)
            }

            terminal.addChild(txt)

            offsetX += txt.width
        }

        // Mask
        terminal.mask = mask
        
        return terminal
    }

    const assetsPrefix = "https://cdn.jsdelivr.net/gh/ImIcterine/nullspace@main/assets/pack0/"

    const cvs = document.getElementById("screen")
    const app = new PIXI.Application()
    await app.init({
        view: cvs,
        width: cvs.width,
        height: cvs.height,
        backgroundColor: 0x000000
    })

    // SET DEFAULT CONTROLS
    const ctrls = {
        up: "arrowup",
        down: "arrowdown",
        left: "arrowleft",
        right: "arrowright",
        confirm: "e",
        cancel: "w",
        menu: "escape"
    }

    const world = new PIXI.Container()

    app.stage.addChild(world)

    app.ticker.add(() => {
        world.x = -camX + cvs.width / 2
        world.y = -camY + cvs.height / 2
    })

    
    let mainMenuText = {
        color: 0x000000,
        width: 640,
        height: 480,
        size: 20,
        lineOffset: -9,
        colOffset: -2,
        text: [
            {
                text: "Play",
                color: 0x000000,
                highlight: 0xffffff
            },
            "endl",
            "endl",
            {
                text: "Settings",
                color: 0xffffff
            },
            "endl",
            "endl",
            {
                text: "Achievements",
                color: 0xffffff
            },
            "endl",
            "endl",
            {
                text: "Credits",
                color: 0xffffff
            },
            "endl",
            {
                text: "                                          v0.0.1",
                color: 0xffffff
            }
        ]
    }

    let testTerm = {
        color: 0x000000,
        width: 640,
        height: 480,
        size: 20,
        lineOffset: -9,
        colOffset: -2,
        text: [
            {
                text: "MAJAVAAA",
                color: 0xffffff
            }
        ]
    }

    const logoTex = await PIXI.Assets.load(assetsPrefix + "logo.png")
    logoTex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
    const logo = new PIXI.Sprite(logoTex)

    let mode = "mmStart"

    let mmStartSel = 0

    const mainMenuCont = new PIXI.Container()

    let term = newTerminal(mainMenuText)

    function replaceTerminal(oldTerm, newTerm) {
        const parent = oldTerm.parent

        if (!parent) return newTerm

        const index = parent.getChildIndex(oldTerm)

        parent.removeChild(oldTerm)
        parent.addChildAt(newTerm, index)

        return newTerm
    }

    function removeHls(term) {
        const newTerm = structuredClone(term)

        for (let item of newTerm.text) {
            
            if (typeof item === "string") continue
            
            delete item.highlight
            item.color = item.color ? item.color : 0xffffff
        }
        
        return newTerm
    }

    term.x = 0
    term.y = 0
    
    mainMenuCont.addChild(term)
    app.stage.addChild(mainMenuCont)

    logo.anchor.set(0.5)
    logo.position.set(x / 2, 65)
    mainMenuCont.addChild(logo)
    logo.scale.set(3)

    addEventListener("keydown", (e) => {
        if (mode === "mmStart") {
            if (low(e.key) === ctrls.down) {
                mmStartSel += 1
                mmStartSel = clamp(mmStartSel, 0, 3)
                testTerm.text[0].text = mmStartSel
                const newText = removeHls(mainMenuText)
                const newHlText = newText.text[mmStartSel * 3]
                if (typeof newHlText !== "string") {
                    newHlText.highlight = 0xffffff
                    delete newHlText.color
                }
                term = replaceTerminal(term, newTerminal(newText))
            }

            if (low(e.key) === ctrls.up) {
                mmStartSel += -1
                mmStartSel = clamp(mmStartSel, 0, 3)
                testTerm.text[0].text = mmStartSel
                const newText = removeHls(mainMenuText)
                const newHlText = newText.text[mmStartSel * 3]
                if (typeof newHlText !== "string") {
                    newHlText.highlight = 0xffffff
                    delete newHlText.color
                }
                term = replaceTerminal(term, newTerminal(newText))
            }

            if (low(e.key) === ctrls.confirm) {
                if (mmStartSel === 0) {
                    alert("PLAY")
                } else if (mmStartSel === 1) {
                    alert("SETTINGS")
                } else if (mmStartSel === 2) {
                    alert("ACHIEVEMENTS")
                } else if (mmStartSel === 3) {
                    alert("CREDITS")
                }
            }
        }
    })

    app.ticker.add(() => {
        camX += 1
    })
}