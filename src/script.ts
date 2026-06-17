const canvas: HTMLCanvasElement = document.getElementById(
    'canvas1'
) as HTMLCanvasElement
const ctx: CanvasRenderingContext2D = canvas.getContext(
    '2d'
) as CanvasRenderingContext2D

const CANVAS_SIZE = { w: 1024, h: 800 } as const
let lastTime: number = 0

const log = <T>(msg: T): void => {
    console.log(`[DEBUG] - ${msg}`)
}

//=============================PHYSICS=================================
class Vec2 {
    x: number
    y: number

    public static Zero: Vec2 = new Vec2(0, 0)

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    add(v: Vec2): Vec2 {
        return new Vec2(v.x, v.y)
    }

    sub(v: Vec2): Vec2 {
        return new Vec2(this.x - v.x, this.y - v.y)
    }

    mult(n: number): Vec2 {
        return new Vec2(this.x * n, this.y * n)
    }

    div(n: number): Vec2 {
        return new Vec2(this.x / n, this.y / n)
    }

    mag(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2)
    }

    equal(v: Vec2): boolean {
        return this.x == v.x && this.y == v.y
    }

    toString(): string {
        return `{x: ${this.x}, y: ${this.y}}`
    }

}

class Vec2Math {

    static Length(v: Vec2): number {
        return Math.sqrt(v.x ** 2 + v.y ** 2)
    }

    static Distance(a: Vec2, b: Vec2): number {
        let dx = a.x - b.x
        let dy = a.y - b.y
        return Math.sqrt(dx ** 2 + dy ** 2)
    }

    static Normalize(v: Vec2): Vec2 {
        let len = Vec2Math.Length(v)
        let x = v.x / len
        let y = v.y / len
        return new Vec2(x, y)
    }

    static Dot(a: Vec2, b: Vec2): number {
        return a.x * b.x + a.y * b.y
    }

    static Cross(a: Vec2, b: Vec2): number {
        return a.x * b.y - a.y * b.x
    }

}



const drawText = (msg: string, pos: Vec2): void => {
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px Arial, sans-serif'
    ctx.fillText(msg, pos.x, pos.y)
}
//=============================DRAW=====================================
const drawObject = (): void => {
    //clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE.w, CANVAS_SIZE.h)
    // draw Text to the screen

    const v1 = new Vec2(25, 58)
    drawText(v1.toString(), new Vec2(10, 25))
    drawText(Vec2.Zero.toString(), new Vec2(10, 45))


}
//=============================UPDATE=====================================
const updateObject = (deltatime: number): void => {

}


// animation frame loop
const animateloop = (timeStamp: number) => {
    // calculate the delta time
    const dt = (timeStamp - lastTime) / 1000
    lastTime = timeStamp
    const cappeDt = Math.min(dt, 0.16)

    // Update
    updateObject(cappeDt)
    // Render
    drawObject()

    requestAnimationFrame(animateloop)
}
requestAnimationFrame(animateloop)
