import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8.21.0/dist/pixi.min.mjs'
import { getAsset } from "./getassets.js"

export function newTerminal(textObj) {
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

export async function newUiBox(w, h) {
    const boxTex = await getAsset("nineslicebox")
    
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