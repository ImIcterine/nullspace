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

    function sharp(img) {
        img.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
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

    async function newUiBox(w, h) {
        const boxTex = await PIXI.Assets.load(assetsPrefix + "nine-slice-box2.png")
        
        const box = new PIXI.NineSliceSprite({
            texture: boxTex,
            leftWidth: 5,
            rightWidth: 5,
            topHeight: 5,
            bottomHeight: 5
        })
    
        box.width = w
        box.height = h

        return box
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

    const version = "v0.0.2"

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
    app.stage.sortableChildren = true

    app.ticker.add(() => {
        world.x = -camX + cvs.width / 2
        world.y = -camY + cvs.height / 2
    })

    
    let mainMenuText = {
        color: 0x000000,
        width: 640,
        height: 480,
        size: 22,
        lineOffset: -8,
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
                text: " ".repeat(43 - version.length) + version,
                color: 0xffffff
            }
        ]
    }

    let settingsText = {
        color: 0x000000,
        width: 504, // 36 chars (32)
        height: 330, // 11 lines (9)
        size: 22,
        lineOffset: -1,
        colOffset: -2,
        text: [
            {
                text: "Master Volume",
                color: 0x000000,
                highlight: 0xffffff
            },
            {
                text: "               "
            },
            {
                text: "100%",
                color: 0xffffff
            },
            "endl",
            {
                text: "Controls",
                color: 0xffffff
            },
            "endl",
            {
                text: "Fullscreen",
                color: 0xffffff
            },
            {
                text: "                   "
            },
            {
                text: "OFF",
                color: 0xffffff
            },
            "endl",
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            {
                text: "Back",
                color: 0xffffff
            },
            "endl"
        ]
    }

    const settingsTextIndices = {
        select: [
            0,
            4,
            6,
            20
        ],
        change: [
            2,
            8
        ]
    }

    const logoTex = await PIXI.Assets.load(assetsPrefix + "logo.png")
    sharp(logoTex)
    
    const logo = new PIXI.Sprite(logoTex)
    
    const containers = {}
    let visible = []

    function showScreen() {
        for (const key in containers) {
            containers[key].visible = false
        }

        for (const name of visible) {
            containers[name].visible = true
        }
    }

    // Game State
    const gs = {
        mode: "mainmenu",
        mainmenu: {
            sel: 0
        },
        settings: {
            shown: false,
            sel: 0,
            mode: "main",
            vol: 100,
        }
    }
    

    const settingsCont = new PIXI.Container()
    settingsCont.zIndex = 6
    containers.settings = settingsCont

    const settingsX = 512
    const settingsY = 338

    settingsCont.pivot.set(settingsX / 2, settingsY / 2)
    settingsCont.position.set(x / 2, y / 2)

    const settingsBg = await newUiBox(settingsX, settingsY)
    let settingsTerm = newTerminal(settingsText)
    settingsTerm.position.set(4, 4)
    
    settingsCont.addChild(settingsBg)
    settingsCont.addChild(settingsTerm)
    

    const mainMenuCont = new PIXI.Container()
    mainMenuCont.zIndex = 5
    containers.mainmenu = mainMenuCont

    let mainMenuTerm = newTerminal(mainMenuText)

    mainMenuTerm.position.set(0, 0)
    
    mainMenuCont.addChild(mainMenuTerm)
    app.stage.addChild(mainMenuCont)

    
    app.stage.addChild(settingsCont)

    //mainMenuCont.scale.set(0.75)
    //mainMenuCont.x = 100

    logo.anchor.set(0.5)
    logo.position.set(x / 2, 65)
    mainMenuCont.addChild(logo)
    logo.scale.set(3)

    function isMode(mode) {
        return gs.mode === mode && !gs.settings.shown
    }

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

    function updateMode() {
        visible = []
        
        if (gs.mode === "mainmenu") {
            visible.push("mainmenu")
            
            const newText = removeHls(mainMenuText)
            const newHlText = newText.text[gs.mainmenu.sel * 3]
            if (typeof newHlText !== "string") {
                newHlText.highlight = 0xffffff
                delete newHlText.color
            }
            mainMenuTerm = replaceTerminal(mainMenuTerm, newTerminal(newText))
        }

        if (gs.settings.shown) {
            visible.push("settings")

            if (gs.settings.mode === "main") {
                const newText = removeHls(settingsText)
                const volText = newText.text[settingsTextIndices.change[0]]
                const newHlText = newText.text[settingsTextIndices.select[gs.settings.sel]]
                if (typeof newHlText !== "string") {
                    newHlText.highlight = 0xffffff
                    delete newHlText.color
                    volText.text = (gs.settings.vol + "%").padStart(4, " ")
                }
                settingsTerm = replaceTerminal(settingsTerm, newTerminal(newText))
                settingsTerm.position.set(4, 4)
            }

            if (gs.settings.mode === "vol") {
                const newText = removeHls(settingsText)
                const newHlText = newText.text[settingsTextIndices.change[0]]
                if (typeof newHlText !== "string") {
                    newHlText.highlight = 0xffffff
                    delete newHlText.color
                    newHlText.text = (gs.settings.tempVol + "%").padStart(4, " ")
                }
                settingsTerm = replaceTerminal(settingsTerm, newTerminal(newText))
                settingsTerm.position.set(4, 4)
            }
        }

        showScreen()
    }

    updateMode()

    // KEY EVENTS

    addEventListener("keydown", (e) => {
        if (isMode("mainmenu")) {
            if (low(e.key) === ctrls.down) {
                gs.mainmenu.sel += 1
                gs.mainmenu.sel = clamp(gs.mainmenu.sel, 0, 3)
                updateMode()
                return
            }

            if (low(e.key) === ctrls.up) {
                gs.mainmenu.sel += -1
                gs.mainmenu.sel = clamp(gs.mainmenu.sel, 0, 3)
                updateMode()
                return
            }

            if (low(e.key) === ctrls.confirm) {
                if (gs.mainmenu.sel === 0) {
                    alert("PLAY")
                    return
                } else if (gs.mainmenu.sel === 1) {
                    gs.settings.shown = true
                    updateMode()
                    return
                } else if (gs.mainmenu.sel === 2) {
                    gs.mode = ""
                    updateMode()
                    return
                } else if (gs.mainmenu.sel === 3) {
                    alert("CREDITS")
                    return
                }
            }
        }

        if (gs.settings.shown) {
            if (gs.settings.mode === "main") {
                if (low(e.key) === ctrls.cancel) {
                    gs.settings.shown = false
                    gs.settings.sel = 0
                    updateMode()
                    return
                }
                
                if (low(e.key) === ctrls.down) {
                    gs.settings.sel += 1
                    gs.settings.sel = clamp(gs.settings.sel, 0, settingsTextIndices.select.length - 1)
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.up) {
                    gs.settings.sel -= 1
                    gs.settings.sel = clamp(gs.settings.sel, 0, settingsTextIndices.select.length - 1)
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.confirm) {
                    if (gs.settings.sel === 0) {
                        gs.settings.mode = "vol"
                        gs.settings.tempVol = gs.settings.vol
                        updateMode()
                        return
                    } else if (gs.settings.sel === 1) {
                        alert("controls")
                    } else if (gs.settings.sel === 2) {
                        alert("fullscreen")
                    } else if (gs.settings.sel === 3) {
                        gs.settings.shown = false
                        gs.settings.sel = 0
                        updateMode()
                        return
                    }
                }
            }

            if (gs.settings.mode === "vol") {
                if (low(e.key) === ctrls.cancel) {
                    gs.settings.tempVol = gs.settings.vol
                    gs.settings.mode = "main"
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.confirm) {
                    gs.settings.vol = gs.settings.tempVol
                    gs.settings.mode = "main"
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.up) {
                    const volDif = e.shiftKey ? 1 : 10
                    gs.settings.tempVol += volDif
                    gs.settings.tempVol = clamp(gs.settings.tempVol, 0, 100)
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.down) {
                    const volDif = e.shiftKey ? 1 : 10
                    gs.settings.tempVol -= volDif
                    gs.settings.tempVol = clamp(gs.settings.tempVol, 0, 100)
                    updateMode()
                    return
                }
            }
        }
    })

    app.ticker.add(() => {
        camX += 0
    })
}