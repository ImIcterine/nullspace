alert("debug")

import { initDebug, sysMenuPad } from "./scripts/debugInit.js"
import { version, copyright, rights } from "./scripts/constants.js"
import { lvl0cmask } from "./scripts/mask.js"
import { newTerminal, newUiBox } from "./scripts/ui.js"
import { getAsset, initSound, assetsPrefix } from "./scripts/getassets.js"
import * as texts from "./scripts/terminaltext.js"

import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8.21.0/dist/pixi.min.mjs'
import { sound as pixisound } from 'https://cdn.jsdelivr.net/npm/@pixi/sound/+esm'


let x = 640; let y = 480;

window.onload = async () => {
    initDebug()
    initSound()
    
    await document.fonts.load('16px "DepartureMono"')

    // Helpers
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

    function count(arr, match) {
        let x = 0

        arr.forEach((item) => {
            if (item === match) x++
        })

        return x
    }

    function unitVec2(x, y) {
        const magn = Math.sqrt(x ** 2 + y ** 2)

        if (magn === 0) {
            return {x: 0, y: 0}
        }

        return {
            x: x / magn,
            y: y / magn
        }
    }

    // Collision helpers
    function getPlayerHitbox() {
        return {
            x: gs.player.x - 12,
            y: gs.player.y - 12,
            w: gs.player.hitbox.w,
            h: gs.player.hitbox.h 
        }
    }
    
    function rectIsInside(a, b) {
        return (
            a.x >= b.x &&
            a.y >= b.y &&
            a.x + a.w <= b.x + b.w &&
            a.y + a.h <= b.y + b.h
        )
    }

    function checkForCollision(rooms, collider) {
        for (const room of rooms.rooms) {
            if (rectIsInside(collider, room)) {
                return true
            }
        }

        return false
    }
    
    // Level room generator helpers
    function roomTopEdge(data) {
        return {
            y: data.y,
            x1: data.x,
            x2: data.x + data.w
        }
    }

    function subtractSegment(seg, cut) {
        const result = []

        // Check for no overlap
        if (cut.x2 <= seg.x1 || cut.x1 >= seg.x2) {
            result.push(seg)
            return result
        }

        // Get left side remains
        if (cut.x1 > seg.x1) {
            result.push({
                x1: seg.x1,
                x2: cut.x1
            })
        }

        // Get right side remains
        if (cut.x2 < seg.x2) {
            result.push({
                x1: cut.x2,
                x2: seg.x2
            })
        }

        return result
    }

    function getVisibleTopEdges(rects) {
        const edges = []

        for (const rect of rects) {
            let segments = [{
                x1: rect.x,
                x2: rect.x + rect.w
            }]

            for (const other of rects) {
                if (other === rect) continue

                // Only care about rectangles overlapping this top edge
                const overlapsY =
                    other.y <= rect.y &&
                    other.y + other.h > rect.y

                if (!overlapsY) continue

                const cut = {
                    x1: other.x,
                    x2: other.x + other.w
                }

                let next = []

                for (const seg of segments) {
                    next.push(...subtractSegment(seg, cut))
                }

                segments = next
            }

            for (const seg of segments) {
                edges.push({
                    x1: seg.x1,
                    y: rect.y,
                    x2: seg.x2,
                    roomheight: rect.h
                })
            }
        }

        return edges
    }

    // Level room generators
    async function lvl0rg(roomdata) {
        const cont = new PIXI.Container()
        cont.sortableChildren = true

        const borderWidth = 2

        for (const data of roomdata.rooms) {
            const border = new PIXI.Graphics()
            border.beginFill(0x9c9643)
            border.drawRect(data.x - borderWidth, data.y - roomdata.wallheight - borderWidth, data.w + borderWidth * 2, data.h + borderWidth * 2)
            border.endFill()
            border.zIndex = 0

            const carpet = new PIXI.TilingSprite({
                texture: await getAsset("lvl0carpet"),
                width: data.w,
                height: data.h,
            })
            carpet.tileScale.set(2, 2)
            carpet.position.set(data.x, data.y - roomdata.wallheight)
            carpet.zIndex = 2
            
            /*
            const wallshadow = new PIXI.NineSliceSprite({
                texture: await getAsset("lvl0wallshadow"),
                width: data.w / 2,
                height: (data.h - data.wallheight) / 2,
                leftWidth: 4,
                rightWidth: 4,
                topHeight: 4,
                bottomHeight: 0
            })
            wallshadow.scale.set(2)
            wallshadow.position.set(data.x, data.wallheight + data.y)
            wallshadow.zIndex = 2
            */
            
        
            cont.addChild(border)
            cont.addChild(carpet)
            // cont.addChild(wallshadow)
        }

        for (const edge of getVisibleTopEdges(roomdata.rooms)) {
            const newWallHeight = Math.min(roomdata.wallheight, edge.roomheight)
            
            const wallpaper = new PIXI.TilingSprite({
                texture: await getAsset("lvl0wallpaper"),
                width: edge.x2 - edge.x1,
                height: newWallHeight,
            })
            wallpaper.tileScale.set(2, 2)
            wallpaper.position.set(edge.x1, edge.y - roomdata.wallheight)
            wallpaper.zIndex = 3

            const wallstain = new PIXI.TilingSprite({
                texture: await getAsset("lvl0wallstain"),
                width: edge.x2 - edge.x1,
                height: Math.min(64, newWallHeight - (roomdata.wallheight - 64)),
            })
            wallstain.tileScale.set(2, 2)
            wallstain.position.set(edge.x1, edge.y - 64)
            wallstain.zIndex = 4

            cont.addChild(wallpaper)
            cont.addChild(wallstain)
        }

        return cont
    }
    
    // APP
    const cvs = document.getElementById("screen")
    const app = new PIXI.Application()
    await app.init({
        view: cvs,
        width: cvs.width,
        height: cvs.height,
        backgroundColor: 0x000000
    })

    {
        const graphicsenginename = app.renderer.name
        const graphicsengineparsed = graphicsenginename == "webgl" ? "WebGL" : graphicsenginename == "webgpu" ? "WebGPU" : graphicsenginename == "canvas" ? "2D Canvas" : graphicsenginename
        const graphicsenginetext = document.getElementById("graphicsengine")
        graphicsenginetext.textContent = `${"Graphics Engine:".padEnd(sysMenuPad, "\u00A0")}${graphicsengineparsed}`
    }
    

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
    
    // Track pressed keys
    let pressing = {}

    const settingsTextIndices = {
        select: [
            0,
            4,
            6,
            10,
            20
        ],
        change: [
            2,
            8
        ]
    }

    const controlsTextIndices = {
        select: [
            0,
            4,
            8,
            12,
            16,
            20,
            24,
            29
        ],
        space: [
            1,
            5,
            9,
            13,
            17,
            21,
            25
        ],
        change: [
            2,
            6,
            10,
            14,
            18,
            22,
            26
        ]
    }

    const controlsNames = [
        "up",
        "down",
        "left",
        "right",
        "confirm",
        "cancel",
        "menu"
    ]

    const logo = new PIXI.Sprite(await getAsset("logo"))
    
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
    
    // Default save data
    const savedata = {
        settings: {
            vol: 100,
            controls: ctrls
        },
        saves: {
            save0: null,
            save1: null,
            save2: null,
            save3: null,
            save4: null,
            save5: null,
            save6: null,
            save7: null
        }
    }

    // Game State
    const gs = {
        mode: "mainmenu",
        level: "",
        mainmenu: {
            sel: 0
        },
        settings: {
            shown: false,
            sel: 0,
            mode: "main",
            vol: 100,
            fullscr: false
        },
        credits: {
            stage: 0
        },
        savedata: {
            sel: 0,
            eraseStep: 0,
            lastEraseConfirm: 0,
            eraseConfirmCooldown: 500
        },
        controls: {
            sel: 0,
            changing: false
        },

        cam: {
            x: 0,
            y: 0,
            followsPlayer: true
        },
        player: {
            x: 25,
            y: 0,
            speed: 30,
            collisionCheckStep: 1,
            hitbox: {
                w: 24,
                h: 24
            }
        }
    }

    // IndexedDB via idb

    
    // Configure save data
    gs.settings.vol = savedata.settings.vol
    pixisound.volumeAll = gs.settings.vol / 100

    // World
    const world = new PIXI.Container()
    containers.game = world

    app.stage.addChild(world)
    app.stage.sortableChildren = true
    world.sortableChildren = true

    world.zIndex = 0

    // Player
    const playercont = new PIXI.Container()
    playercont.zIndex = 100
    world.addChild(playercont)
    
    const testplayer = new PIXI.Graphics()
    playercont.addChild(testplayer)

    testplayer.beginFill(0xff0000)
    testplayer.drawRect(-12, -110, 24, 110)
    testplayer.endFill()
    

    // UI
    const uiCont = new PIXI.Container()
    containers.ui = uiCont
    app.stage.addChild(uiCont)

    const lines = new PIXI.Graphics()
    

    // Level 0
    const lvl0cont = new PIXI.Container()
    containers.lvl0 = lvl0cont
    world.addChild(lvl0cont)
    lvl0cont.sortableChildren = true

    const roomdata = {
        wallheight: 100,
        rooms: [
            {
                x: 0,
                y: 0,
                w: 200,
                h: 200
            },
            {
                x: -100,
                y: -150,
                w: 200,
                h: 200
            },
            {
                x: -100,
                y: 150,
                w: 200,
                h: 100
            }
        ]
    }

    const room = await lvl0rg(roomdata)
    lvl0cont.addChild(room)

    const lvl0mask = lvl0cmask(roomdata)
    world.mask = lvl0mask
    world.addChild(lvl0mask)
    
    // Settings
    const settingsCont = new PIXI.Container()
    settingsCont.zIndex = 6
    containers.settings = settingsCont

    const settingsX = 512
    const settingsY = 338

    settingsCont.pivot.set(settingsX / 2, settingsY / 2)
    settingsCont.position.set(x / 2, y / 2)

    const settingsBg = await newUiBox(settingsX, settingsY)
    let settingsTerm = newTerminal(texts.settingsText)
    settingsTerm.position.set(4, 4)
    
    settingsCont.addChild(settingsBg)
    settingsCont.addChild(settingsTerm)

    // Achievements
    const achievCont = new PIXI.Container()
    achievCont.zIndex = 5
    containers.achiev = achievCont

    let achievTerm = newTerminal(texts.achievText)
    achievTerm.position.set(0, 0)
    
    achievCont.addChild(achievTerm)

    // Credits
    const creditsCont = new PIXI.Container()
    creditsCont.zIndex = 5
    containers.credits = creditsCont

    const creditsX = texts.creditsText.width
    const creditsY = texts.creditsText.height

    creditsCont.pivot.set(creditsX / 2, creditsY / 2)
    creditsCont.position.set(x / 2, y / 2)

    let creditsTerm = newTerminal(texts.creditsText)
    creditsTerm.position.set(0, 0)
    
    creditsCont.addChild(creditsTerm)
    
    // Main menu
    const mainMenuCont = new PIXI.Container()
    mainMenuCont.zIndex = 5
    containers.mainmenu = mainMenuCont

    let mainMenuTerm = newTerminal(texts.mainMenuText)

    mainMenuTerm.position.set(0, 0)
    mainMenuCont.addChild(mainMenuTerm)
    
    app.stage.addChild(mainMenuCont)
    app.stage.addChild(settingsCont)
    app.stage.addChild(achievCont)
    app.stage.addChild(creditsCont)

    
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

        if (isMode("game")) {
            visible.push("game")
            visible.push(gs.level)
        }
        
        if (gs.mode === "mainmenu") {
            visible.push("mainmenu")
            
            const newText = removeHls(texts.mainMenuText)
            const newHlText = newText.text[gs.mainmenu.sel * 3]
            if (typeof newHlText !== "string") {
                newHlText.highlight = 0xffffff
                delete newHlText.color
            }
            mainMenuTerm = replaceTerminal(mainMenuTerm, newTerminal(newText))
        }

        if (gs.mode === "achiev") {
            visible.push("achiev")
        }

        if (gs.mode === "credits") {
            visible.push("credits")

            const newText = structuredClone(texts.creditsText)
            newText.lineOffset = 16 * gs.credits.stage
            creditsTerm = replaceTerminal(creditsTerm, newTerminal(newText))
            creditsTerm.position.set(0, 0)
        }

        if (gs.settings.shown) {
            visible.push("settings")

            if (gs.settings.mode === "main") {
                const newText = removeHls(texts.settingsText)
                const volText = newText.text[settingsTextIndices.change[0]]
                const fullscrText = newText.text[settingsTextIndices.change[1]]
                const newHlText = newText.text[settingsTextIndices.select[gs.settings.sel]]
                if (typeof newHlText !== "string") {
                    newHlText.highlight = 0xffffff
                    delete newHlText.color
                }
                volText.text = (gs.settings.vol + "%").padStart(4, " ")
                fullscrText.text = gs.settings.fullscr ? " ON" : "OFF"
                settingsTerm = replaceTerminal(settingsTerm, newTerminal(newText))
                settingsTerm.position.set(4, 4)
            }

            if (gs.settings.mode === "vol") {
                const newText = removeHls(texts.settingsText)
                const fullscrText = newText.text[settingsTextIndices.change[1]]
                const newHlText = newText.text[settingsTextIndices.change[0]]
                if (typeof newHlText !== "string") {
                    newHlText.highlight = 0xffffff
                    delete newHlText.color
                }
                newHlText.text = (gs.settings.tempVol + "%").padStart(4, " ")
                fullscrText.text = gs.settings.fullscr ? " ON" : "OFF"
                settingsTerm = replaceTerminal(settingsTerm, newTerminal(newText))
                settingsTerm.position.set(4, 4)
            }

            if (gs.settings.mode === "controls") {
                const newText = removeHls(texts.controlsText)
                const newHlText = gs.controls.changing ? newText.text[controlsTextIndices.change[gs.controls.sel]] : newText.text[controlsTextIndices.select[gs.controls.sel]]
                if (typeof newHlText !== "string") {
                    newHlText.highlight = 0xffffff
                    delete newHlText.color
                }

                let i = 0

                for (const key of controlsNames) {
                    let keyName = ctrls[key]
                    if (ctrls[key] === " ") keyName = "space"
                    
                    newText.text[controlsTextIndices.change[i]].text = keyName
                    
                    const nameLen = newText.text[controlsTextIndices.select[i]].text.length
                    const keyLen = newText.text[controlsTextIndices.change[i]].text.length
                    const totalLen = 32

                    const spacesLen = totalLen - nameLen - keyLen
                    
                    newText.text[controlsTextIndices.space[i]].text = " ".repeat(spacesLen)

                    i++
                }
                
                settingsTerm = replaceTerminal(settingsTerm, newTerminal(newText))
                settingsTerm.position.set(4, 4)
            }

            if (gs.settings.mode === "fullscr") {
                const newText = removeHls(texts.settingsText)
                const volText = newText.text[settingsTextIndices.change[0]]
                const newHlText = newText.text[settingsTextIndices.change[1]]
                if (typeof newHlText !== "string") {
                    newHlText.highlight = 0xffffff
                    delete newHlText.color
                }
                newHlText.text = gs.settings.tempFullscr ? " ON" : "OFF"
                volText.text = (gs.settings.vol + "%").padStart(4, " ")
                settingsTerm = replaceTerminal(settingsTerm, newTerminal(newText))
                settingsTerm.position.set(4, 4)
            }

            if (gs.settings.mode === "savedata") {
                const newText = removeHls(texts.savedataText)
                const newHlText = newText.text[gs.savedata.sel * 3]
                if (typeof newHlText !== "string") {
                    newHlText.highlight = gs.savedata.sel === 2 ? 0xff0000 : 0xffffff
                    if (gs.savedata.eraseStep === 1) {
                        newHlText.text = "Erase all of your data?"
                    } else if (gs.savedata.eraseStep === 2) {
                        newHlText.text = "Are you sure?"
                    } else if (gs.savedata.eraseStep === 3) {
                        newHlText.text = "REALLY erase it?"
                    } else if (gs.savedata.eraseStep === 4) {
                        newHlText.text = "Erasing..."
                    }
                    delete newHlText.color
                }
                settingsTerm = replaceTerminal(settingsTerm, newTerminal(newText))
                settingsTerm.position.set(4, 4)
            }
        }

        showScreen()
    }

    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
            const isFullscr = !!document.fullscreenElement

            setBorder(!isFullscr)

            gs.settings.fullscr = isFullscr
            updateMode()
        }
    })

    function setBorder(enabled) {
        if (enabled) {
            cvs.style.borderStyle = "solid"
        } else {
            cvs.style.borderStyle = "none"
        }
    }

    function setFullscr(enabled) {
        if (enabled) {
            cvs.requestFullscreen?.() ||
            cvs.webkitRequestFullscreen?.()
        } else {
            document.exitFullscreen?.() ||
            document.webkitExitFullscreen?.()
        }

        setBorder(!enabled)
        updateMode()
    }

    updateMode()

    // MOVEMENT

    addEventListener("keydown", (e) => {
        if (gs.mode === "game") {
            pressing[low(e.key)] = true
        }
    })
    
    addEventListener("keyup", (e) => {
        if (gs.mode === "game") {
            delete pressing[low(e.key)]
        }
    })

    app.ticker.add(() => {
        let moveX = 0
        let moveY = 0
        
        if (pressing[ctrls.up]) {
            moveY -= 1
        }

        if (pressing[ctrls.down]) {
            moveY += 1
        }

        if (pressing[ctrls.left]) {
            moveX -= 1
        }

        if (pressing[ctrls.right]) {
            moveX += 1
        }

        const unitVecX = unitVec2(moveX, moveY).x
        const unitVecY = unitVec2(moveX, moveY).y
        
        for (let i = 0; i < gs.player.speed; i += Math.round(gs.player.collisionCheckStep)) {
            gs.player.x += unitVecX * Math.round(gs.player.collisionCheckStep)
            if (!checkForCollision(roomdata, getPlayerHitbox())) {
                gs.player.x -= unitVecX * Math.round(gs.player.collisionCheckStep)
            }
        
            gs.player.y += unitVecY * Math.round(gs.player.collisionCheckStep)
            if (!checkForCollision(roomdata, getPlayerHitbox())) {
                gs.player.y -= unitVecY * Math.round(gs.player.collisionCheckStep)
            }
        }

        playercont.x = Math.round(gs.player.x)
        playercont.y = Math.round(gs.player.y)

        if (gs.cam.followsPlayer) {
            gs.cam.x = playercont.x 
            gs.cam.y = playercont.y
        }

        world.x = -gs.cam.x + cvs.width / 2
        world.y = -gs.cam.y + cvs.height / 2
    })

    // KEY EVENTS

    addEventListener("keydown", (e) => {
        if (isMode("mainmenu")) {
            if (low(e.key) === ctrls.down) {
                pixisound.play("uimove")
                gs.mainmenu.sel += 1
                gs.mainmenu.sel = clamp(gs.mainmenu.sel, 0, 3)
                updateMode()
                return
            }

            if (low(e.key) === ctrls.up) {
                pixisound.play("uimove")
                gs.mainmenu.sel += -1
                gs.mainmenu.sel = clamp(gs.mainmenu.sel, 0, 3)
                updateMode()
                return
            }

            if (low(e.key) === ctrls.confirm) {
                pixisound.play("select")
                if (gs.mainmenu.sel === 0) {
                    gs.mode = "game"
                    gs.level = "lvl0"
                    updateMode()
                    return
                } else if (gs.mainmenu.sel === 1) {
                    gs.settings.shown = true
                    updateMode()
                    return
                } else if (gs.mainmenu.sel === 2) {
                    gs.mode = "achiev"
                    updateMode()
                    return
                } else if (gs.mainmenu.sel === 3) {
                    gs.mode = "credits"
                    updateMode()
                    return
                }
            }
        }

        if (isMode("achiev")) {
            if (low(e.key) === ctrls.cancel) {
                pixisound.play("goback")
                gs.mode = "mainmenu"
                updateMode()
                return
            }
        }

        if (isMode("credits")) {
            if (low(e.key) === ctrls.cancel) {
                pixisound.play("goback")
                gs.credits.stage = 0
                gs.mode = "mainmenu"
                updateMode()
                return
            }
            
            if (low(e.key) === ctrls.up) {
                gs.credits.stage -= 1
                gs.credits.stage = clamp(gs.credits.stage, 0, 8)
                updateMode()
                return
            }

            if (low(e.key) === ctrls.down) {
                gs.credits.stage += 1
                gs.credits.stage = clamp(gs.credits.stage, 0, 8)
                if (gs.credits.stage === 8) {
                    gs.credits.stage = 0
                    gs.mode = "mainmenu"
                }
                updateMode()
                return
            }
        }

        if (gs.settings.shown) {
            if (gs.settings.mode === "main") {
                if (low(e.key) === ctrls.cancel) {
                    pixisound.play("goback")
                    gs.settings.shown = false
                    gs.settings.sel = 0
                    updateMode()
                    return
                }
                
                if (low(e.key) === ctrls.down) {
                    pixisound.play("uimove")
                    gs.settings.sel += 1
                    gs.settings.sel = clamp(gs.settings.sel, 0, settingsTextIndices.select.length - 1)
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.up) {
                    pixisound.play("uimove")
                    gs.settings.sel -= 1
                    gs.settings.sel = clamp(gs.settings.sel, 0, settingsTextIndices.select.length - 1)
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.confirm) {
                    if (gs.settings.sel === 0) {
                        pixisound.play("select")
                        gs.settings.mode = "vol"
                        gs.settings.tempVol = gs.settings.vol
                        updateMode()
                        return
                    } else if (gs.settings.sel === 1) {
                        pixisound.play("select")
                        gs.settings.mode = "controls"
                        updateMode()
                        return
                    } else if (gs.settings.sel === 2) {
                        pixisound.play("select")
                        gs.settings.mode = "fullscr"
                        gs.settings.tempFullscr = gs.settings.fullscr
                        updateMode()
                        return
                    } else if (gs.settings.sel === 3) {
                        pixisound.play("select")
                        gs.settings.mode = "savedata"
                        updateMode()
                        return
                    } else if (gs.settings.sel === 4) {
                        pixisound.play("goback")
                        gs.settings.shown = false
                        gs.settings.sel = 0
                        updateMode()
                        return
                    }
                }
            }

            if (gs.settings.mode === "vol") {
                if (low(e.key) === ctrls.cancel) {
                    pixisound.play("goback")
                    gs.settings.tempVol = gs.settings.vol
                    pixisound.volumeAll = gs.settings.vol / 100
                    gs.settings.mode = "main"
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.confirm) {
                    pixisound.play("select")
                    gs.settings.vol = gs.settings.tempVol
                    pixisound.volumeAll = gs.settings.vol / 100
                    gs.settings.mode = "main"
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.up) {
                    pixisound.play("uimove")
                    const volDif = e.shiftKey ? 1 : 10
                    gs.settings.tempVol += volDif
                    gs.settings.tempVol = clamp(gs.settings.tempVol, 0, 100)
                    pixisound.volumeAll = gs.settings.tempVol / 100
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.down) {
                    pixisound.play("uimove")
                    const volDif = e.shiftKey ? 1 : 10
                    gs.settings.tempVol -= volDif
                    gs.settings.tempVol = clamp(gs.settings.tempVol, 0, 100)
                    pixisound.volumeAll = gs.settings.tempVol / 100
                    updateMode()
                    return
                }
            }

            if (gs.settings.mode === "controls") {
                if (low(e.key) === ctrls.cancel && !gs.controls.changing) {
                    pixisound.play("goback")
                    gs.settings.mode = "main"
                    gs.controls.sel = 0
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.confirm && !gs.controls.changing) {
                    if (gs.controls.sel >= 0 && gs.controls.sel <= 6) {
                        pixisound.play("select")
                        gs.controls.changing = true
                        updateMode()
                        return
                    } else if (gs.controls.sel === 7) {
                        pixisound.play("goback")
                        gs.settings.mode = "main"
                        gs.controls.sel = 0
                        updateMode()
                        return
                    }
                }

                if (low(e.key) === ctrls.down && !gs.controls.changing) {
                    pixisound.play("uimove")
                    gs.controls.sel += 1
                    gs.controls.sel = clamp(gs.controls.sel, 0, controlsTextIndices.select.length - 1)
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.up && !gs.controls.changing) {
                    pixisound.play("uimove")
                    gs.controls.sel -= 1
                    gs.controls.sel = clamp(gs.controls.sel, 0, controlsTextIndices.select.length - 1)
                    updateMode()
                    return
                }

                if (gs.controls.changing) {
                    const oldKey = ctrls[controlsNames[gs.controls.sel]]
                    const newKey = low(e.key)
                    ctrls[controlsNames[gs.controls.sel]] = newKey

                    if (count(Object.values(ctrls), newKey) > 1) {
                        ctrls[controlsNames[gs.controls.sel]] = oldKey
                        pixisound.play("selectfail")
                    } else {
                        pixisound.play("select")
                    }
                    
                    gs.controls.changing = false
                    updateMode()
                    return
                }
            }

            if (gs.settings.mode === "fullscr") {
                if (low(e.key) === ctrls.cancel) {
                    pixisound.play("goback")
                    gs.settings.tempFullscr = gs.settings.fullscr
                    gs.settings.mode = "main"
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.confirm) {
                    pixisound.play("select")
                    gs.settings.fullscr = gs.settings.tempFullscr
                    gs.settings.mode = "main"
                    updateMode()
                    setFullscr(gs.settings.fullscr)
                    return
                }

                if (low(e.key) === ctrls.up) {
                    pixisound.play("uimove")
                    gs.settings.tempFullscr = true
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.down) {
                    pixisound.play("uimove")
                    gs.settings.tempFullscr = false
                    updateMode()
                    return
                }
            }

            if (gs.settings.mode === "savedata") {
                if (low(e.key) === ctrls.cancel) {
                    pixisound.play("goback")
                    if (gs.savedata.eraseStep > 0) {
                        gs.savedata.eraseStep = 0
                        updateMode()
                        return
                    } else {
                        gs.savedata.sel = 0
                        gs.settings.mode = "main"
                        updateMode()
                        return
                    }
                }

                if (low(e.key) === ctrls.confirm) {
                    if (gs.savedata.sel === 0) {
                        pixisound.play("select")
                        alert("import")
                        return
                    } else if (gs.savedata.sel === 1) {
                        pixisound.play("select")
                        alert("export")
                        return
                    } else if (gs.savedata.sel === 2) {
                        if (gs.savedata.lastEraseConfirm + gs.savedata.eraseConfirmCooldown < Date.now()) {
                            gs.savedata.eraseStep += 1
                            gs.savedata.lastEraseConfirm = Date.now()
                        }
                        if (gs.savedata.eraseStep === 4) {
                            pixisound.play("select")
                            // Erase
                            window.location.reload()
                        } else {
                            pixisound.play("uimove")
                        }
                        updateMode()
                        return
                    }
                }

                if (low(e.key) === ctrls.down) {
                    pixisound.play("uimove")
                    if (gs.savedata.eraseStep > 0) return
                    
                    gs.savedata.sel += 1
                    gs.savedata.sel = clamp(gs.savedata.sel, 0, 2)
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.up) {
                    pixisound.play("uimove")
                    if (gs.savedata.eraseStep > 0) return
                    
                    gs.savedata.sel += -1
                    gs.savedata.sel = clamp(gs.savedata.sel, 0, 2)
                    updateMode()
                    return
                }
            }
        }
    })
}