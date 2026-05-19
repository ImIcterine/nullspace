let x = 640; let y = 480;

window.onload = async () => {
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

    
    // Display helpers
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

    function newUiBox(w, h) {
        const boxTex = assetpack.nineslicebox
        
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

    // World mask
    function lvl0cmask(roomdata) {
        const mask = new PIXI.Graphics()

        mask.beginFill(0xffffff)

        for (const room of roomdata.rooms) {
            mask.drawRect(room.x, room.y - roomdata.wallheight, room.w, room.h)
        }

        mask.endFill()

        return mask
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
    function lvl0rg(roomdata) {
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
                texture: assetpack.lvl0carpet,
                width: data.w,
                height: data.h,
            })
            carpet.tileScale.set(2, 2)
            carpet.position.set(data.x, data.y - roomdata.wallheight)
            carpet.zIndex = 2
            
            /*
            const wallshadow = new PIXI.NineSliceSprite({
                texture: assetpack.lvl0wallshadow,
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
                texture: assetpack.lvl0wallpaper,
                width: edge.x2 - edge.x1,
                height: newWallHeight,
            })
            wallpaper.tileScale.set(2, 2)
            wallpaper.position.set(edge.x1, edge.y - roomdata.wallheight)
            wallpaper.zIndex = 3

            const wallstain = new PIXI.TilingSprite({
                texture: assetpack.lvl0wallstain,
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

    const version = "v0.0.4"

    // Asset loading
    const assetsPrefix = "https://cdn.jsdelivr.net/gh/ImIcterine/nullspace@main/assets/pack0/"
    
    const assetpaths = {
        logo: "textures/logo.png",
        nineslicebox: "textures/nine-slice-box2.png",
        lvl0wallpaper: "textures/lvl0/wallpaper32.png",
        lvl0carpet: "textures/lvl0/carpet16.png",
        lvl0wallstain: "textures/lvl0/wallstain32.png",
        lvl0wallshadow: "textures/lvl0/wallshadow.png",
    }
    const assetpack = {}

    for (const key in assetpaths) {
        const tex = await PIXI.Assets.load(assetsPrefix + assetpaths[key])
        sharp(tex)
        assetpack[key] = tex
    }

    // Sound loading
    const soundpaths = {
        goback: "sounds/goback.wav",
        selectfail: "sounds/selectfail.wav",
        uimove: "sounds/uimove.wav",
        select: "sounds/select.wav",
    }

    for (const key in soundpaths) {
        PIXI.sound.add(key, assetsPrefix + soundpaths[key])
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
                text: "Save Data",
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

    let achievText = {
        color: 0x000000,
        width: 640,
        height: 480,
        size: 22,
        lineOffset: -1,
        colOffset: -2,
        text: [
            {
                text: "No achievements yet",
                color: 0xffffff
            },
            "endl",
            "endl",
            {
                text: "Press [" + ctrls.cancel + "] to go back",
                color: 0xffffff
            },
            "endl",
            {
                text: "destroyerofbraincells"
            }
        ]
    }

    let controlsText = {
        color: 0x000000,
        width: 504, // 36 chars (32)
        height: 330, // 11 lines (9)
        size: 22,
        lineOffset: -1,
        colOffset: -2,
        text: [
            {
                text: "Up",
                highlight: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            {
                text: "Down",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            {
                text: "Left",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            {
                text: "Right",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            {
                text: "Confirm",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            {
                text: "Cancel",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            {
                text: "Menu",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            {
                text: "",
                color: 0xffffff
            },
            "endl",
            "endl",
            {
                text: "Back",
                color: 0xffffff
            }
        ]
    }

    let savedataText = {
        color: 0x000000,
        width: 504, // 36 chars (32)
        height: 330, // 11 lines (9)
        size: 22,
        lineOffset: -1,
        colOffset: -2,
        text: [
            {
                text: "Import data",
                highlight: 0xffffff
            },
            "endl",
            "endl",
            {
                text: "Export data",
                color: 0xffffff
            },
            "endl",
            "endl",
            {
                text: "Erase all data",
                color: 0xff0000
            }
        ]
    }

    const creditsText = {
        color: 0x000000,
        width: 644,
        height: 480,
        size: 22,
        lineOffset: 0,
        colOffset: -2,
        text: [
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "              - NULLSPACE -",
                color: 0xffffff,
                bold: true
            },
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "              By ImIcterine",
                color: 0xffffff
            },
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "        and destroyerofbraincells",
                color: 0xffffff
            },
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",

            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "             - Game Design -",
                color: 0x7f7f7f,
                bold: true
            },
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "                ImIcterine",
                color: 0xffffff
            },
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "           destroyerofbraincells",
                color: 0xffffff
            },
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "             - Programming -",
                color: 0x7f7f7f,
                bold: true,
            },
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "                ImIcterine",
                color: 0xffffff
            },
            "endl",
            "endl",
            "endl",
            
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "              Art & Visuals",
                color: 0x7f7f7f,
                bold: true
            },
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "                ImIcterine",
                color: 0xffffff
            },
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "           destroyerofbraincells",
                color: 0xffffff
            },
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "                Imacarrot5",
                color: 0xffffff
            },
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "            - Audio & Music -",
                color: 0x7f7f7f,
                bold: true
            },
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "                ImIcterine",
                color: 0xffffff
            },
            "endl",
            "endl",
            
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "             - Playtesters -",
                color: 0x7f7f7f
            },
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "                ImIcterine",
                color: 0xffffff
            },
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "           destroyerofbraincells",
                color: 0xffffff
            },
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "                Imacarrot5",
                color: 0xffffff
            },
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "               Wadebomber12",
                color: 0xffffff
            },
            "endl",
            "endl",
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "             - Inspirations -",
                color: 0x7f7f7f,
                bold: true
            },
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: '         "Deltarune" by Toby Fox',
                color: 0xffffff
            },
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "          The Backrooms Wikidot",
                color: 0xffffff
            },
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "           The Backrooms Fandom",
                color: 0xffffff
            },
            "endl",
            "endl",
            
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "              - Tools used -",
                color: 0x7f7f7f,
                bold: true
            },
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "          Rendering: PixiJS v.8",
                color: 0xffffff
            },
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "           Data Storing: idb 8",
                color: 0xffffff
            },
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "          Seeding: SeedGoat v1.1",
                color: 0xffffff
            },
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",

            
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",

            
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            {
                //     123456789 123456789 || 987654321 987654321
                text: "            To be continued...",
                color: 0xffffff,
                bold: true
            },
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
            "endl",
        ]
    }

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

    const logo = new PIXI.Sprite(assetpack.logo)
    
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
    PIXI.sound.volumeAll = gs.settings.vol / 100

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
    
    const room = lvl0rg(roomdata)
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
    let settingsTerm = newTerminal(settingsText)
    settingsTerm.position.set(4, 4)
    
    settingsCont.addChild(settingsBg)
    settingsCont.addChild(settingsTerm)

    // Achievements
    const achievCont = new PIXI.Container()
    achievCont.zIndex = 5
    containers.achiev = achievCont

    let achievTerm = newTerminal(achievText)
    achievTerm.position.set(0, 0)
    
    achievCont.addChild(achievTerm)

    // Credits
    const creditsCont = new PIXI.Container()
    creditsCont.zIndex = 5
    containers.credits = creditsCont

    const creditsX = creditsText.width
    const creditsY = creditsText.height

    creditsCont.pivot.set(creditsX / 2, creditsY / 2)
    creditsCont.position.set(x / 2, y / 2)

    let creditsTerm = newTerminal(creditsText)
    creditsTerm.position.set(0, 0)
    
    creditsCont.addChild(creditsTerm)
    
    // Main menu
    const mainMenuCont = new PIXI.Container()
    mainMenuCont.zIndex = 5
    containers.mainmenu = mainMenuCont

    let mainMenuTerm = newTerminal(mainMenuText)

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
            
            const newText = removeHls(mainMenuText)
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

            const newText = structuredClone(creditsText)
            newText.lineOffset = 16 * gs.credits.stage
            creditsTerm = replaceTerminal(creditsTerm, newTerminal(newText))
            creditsTerm.position.set(0, 0)
        }

        if (gs.settings.shown) {
            visible.push("settings")

            if (gs.settings.mode === "main") {
                const newText = removeHls(settingsText)
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
                const newText = removeHls(settingsText)
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
                const newText = removeHls(controlsText)
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
                const newText = removeHls(settingsText)
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
                const newText = removeHls(savedataText)
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
                PIXI.sound.play("uimove")
                gs.mainmenu.sel += 1
                gs.mainmenu.sel = clamp(gs.mainmenu.sel, 0, 3)
                updateMode()
                return
            }

            if (low(e.key) === ctrls.up) {
                PIXI.sound.play("uimove")
                gs.mainmenu.sel += -1
                gs.mainmenu.sel = clamp(gs.mainmenu.sel, 0, 3)
                updateMode()
                return
            }

            if (low(e.key) === ctrls.confirm) {
                PIXI.sound.play("select")
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
                PIXI.sound.play("goback")
                gs.mode = "mainmenu"
                updateMode()
                return
            }
        }

        if (isMode("credits")) {
            if (low(e.key) === ctrls.cancel) {
                PIXI.sound.play("goback")
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
                    PIXI.sound.play("goback")
                    gs.settings.shown = false
                    gs.settings.sel = 0
                    updateMode()
                    return
                }
                
                if (low(e.key) === ctrls.down) {
                    PIXI.sound.play("uimove")
                    gs.settings.sel += 1
                    gs.settings.sel = clamp(gs.settings.sel, 0, settingsTextIndices.select.length - 1)
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.up) {
                    PIXI.sound.play("uimove")
                    gs.settings.sel -= 1
                    gs.settings.sel = clamp(gs.settings.sel, 0, settingsTextIndices.select.length - 1)
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.confirm) {
                    if (gs.settings.sel === 0) {
                        PIXI.sound.play("select")
                        gs.settings.mode = "vol"
                        gs.settings.tempVol = gs.settings.vol
                        updateMode()
                        return
                    } else if (gs.settings.sel === 1) {
                        PIXI.sound.play("select")
                        gs.settings.mode = "controls"
                        updateMode()
                        return
                    } else if (gs.settings.sel === 2) {
                        PIXI.sound.play("select")
                        gs.settings.mode = "fullscr"
                        gs.settings.tempFullscr = gs.settings.fullscr
                        updateMode()
                        return
                    } else if (gs.settings.sel === 3) {
                        PIXI.sound.play("select")
                        gs.settings.mode = "savedata"
                        updateMode()
                        return
                    } else if (gs.settings.sel === 4) {
                        PIXI.sound.play("goback")
                        gs.settings.shown = false
                        gs.settings.sel = 0
                        updateMode()
                        return
                    }
                }
            }

            if (gs.settings.mode === "vol") {
                if (low(e.key) === ctrls.cancel) {
                    PIXI.sound.play("goback")
                    gs.settings.tempVol = gs.settings.vol
                    PIXI.sound.volumeAll = gs.settings.vol / 100
                    gs.settings.mode = "main"
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.confirm) {
                    PIXI.sound.play("select")
                    gs.settings.vol = gs.settings.tempVol
                    PIXI.sound.volumeAll = gs.settings.vol / 100
                    gs.settings.mode = "main"
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.up) {
                    PIXI.sound.play("uimove")
                    const volDif = e.shiftKey ? 1 : 10
                    gs.settings.tempVol += volDif
                    gs.settings.tempVol = clamp(gs.settings.tempVol, 0, 100)
                    PIXI.sound.volumeAll = gs.settings.tempVol / 100
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.down) {
                    PIXI.sound.play("uimove")
                    const volDif = e.shiftKey ? 1 : 10
                    gs.settings.tempVol -= volDif
                    gs.settings.tempVol = clamp(gs.settings.tempVol, 0, 100)
                    PIXI.sound.volumeAll = gs.settings.tempVol / 100
                    updateMode()
                    return
                }
            }

            if (gs.settings.mode === "controls") {
                if (low(e.key) === ctrls.cancel && !gs.controls.changing) {
                    PIXI.sound.play("goback")
                    gs.settings.mode = "main"
                    gs.controls.sel = 0
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.confirm && !gs.controls.changing) {
                    if (gs.controls.sel >= 0 && gs.controls.sel <= 6) {
                        PIXI.sound.play("select")
                        gs.controls.changing = true
                        updateMode()
                        return
                    } else if (gs.controls.sel === 7) {
                        PIXI.sound.play("goback")
                        gs.settings.mode = "main"
                        gs.controls.sel = 0
                        updateMode()
                        return
                    }
                }

                if (low(e.key) === ctrls.down && !gs.controls.changing) {
                    PIXI.sound.play("uimove")
                    gs.controls.sel += 1
                    gs.controls.sel = clamp(gs.controls.sel, 0, controlsTextIndices.select.length - 1)
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.up && !gs.controls.changing) {
                    PIXI.sound.play("uimove")
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
                        PIXI.sound.play("selectfail")
                    } else {
                        PIXI.sound.play("select")
                    }
                    
                    gs.controls.changing = false
                    updateMode()
                    return
                }
            }

            if (gs.settings.mode === "fullscr") {
                if (low(e.key) === ctrls.cancel) {
                    PIXI.sound.play("goback")
                    gs.settings.tempFullscr = gs.settings.fullscr
                    gs.settings.mode = "main"
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.confirm) {
                    PIXI.sound.play("select")
                    gs.settings.fullscr = gs.settings.tempFullscr
                    gs.settings.mode = "main"
                    updateMode()
                    setFullscr(gs.settings.fullscr)
                    return
                }

                if (low(e.key) === ctrls.up) {
                    PIXI.sound.play("uimove")
                    gs.settings.tempFullscr = true
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.down) {
                    PIXI.sound.play("uimove")
                    gs.settings.tempFullscr = false
                    updateMode()
                    return
                }
            }

            if (gs.settings.mode === "savedata") {
                if (low(e.key) === ctrls.cancel) {
                    PIXI.sound.play("goback")
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
                        PIXI.sound.play("select")
                        alert("import")
                        return
                    } else if (gs.savedata.sel === 1) {
                        PIXI.sound.play("select")
                        alert("export")
                        return
                    } else if (gs.savedata.sel === 2) {
                        if (gs.savedata.lastEraseConfirm + gs.savedata.eraseConfirmCooldown < Date.now()) {
                            gs.savedata.eraseStep += 1
                            gs.savedata.lastEraseConfirm = Date.now()
                        }
                        if (gs.savedata.eraseStep === 4) {
                            PIXI.sound.play("select")
                            // Erase
                            window.location.reload()
                        } else {
                            PIXI.sound.play("uimove")
                        }
                        updateMode()
                        return
                    }
                }

                if (low(e.key) === ctrls.down) {
                    PIXI.sound.play("uimove")
                    if (gs.savedata.eraseStep > 0) return
                    
                    gs.savedata.sel += 1
                    gs.savedata.sel = clamp(gs.savedata.sel, 0, 2)
                    updateMode()
                    return
                }

                if (low(e.key) === ctrls.up) {
                    PIXI.sound.play("uimove")
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