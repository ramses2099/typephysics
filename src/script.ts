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

class HelperMath {

    static Clamp(value: number, min: number, max: number): number {
        if (min == max) {
            return min
        }
        if (min > max) {
            throw new Error("min is grater than the max")
        }
        if (value < min) {
            return min
        }
        if (value > max) {
            return max
        }
        return value;
    }


    static Length(v: Vec2): number {
        return Math.sqrt(v.x ** 2 + v.y ** 2)
    }

    static Distance(a: Vec2, b: Vec2): number {
        let dx = a.x - b.x
        let dy = a.y - b.y
        return Math.sqrt(dx ** 2 + dy ** 2)
    }

    static Normalize(v: Vec2): Vec2 {
        let len = HelperMath.Length(v)
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

enum ShapeType {
    Circle = 0,
    Box = 1,
    Poligon = 3
}

class Shape {

    static DrawLine(ctx: CanvasRenderingContext2D, pos0: Vec2, pos1: Vec2, color: string, lineWidth: number): void {
        ctx.beginPath()
        ctx.moveTo(pos0.x, pos0.y)
        ctx.lineTo(pos1.x, pos1.x)
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.stroke()
    }

    static DrawCircle(ctx: CanvasRenderingContext2D, pos: Vec2, radius: number, color: string, lineWidth: number): void {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = lineWidth
        ctx.stroke()
    }

    static DrawRectangle(ctx: CanvasRenderingContext2D, pos: Vec2, size: Vec2, color: string, lineWidth: number): void {
        ctx.fillStyle = color
        ctx.fillRect(pos.x, pos.y, size.x, size.y)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 3
        ctx.strokeRect(pos.x, pos.y, size.x, size.y)
    }

    static DrawPoligon(ctx: CanvasRenderingContext2D, vertices: Array<Vec2>, color: string, lineWidth: number): void {
        ctx.beginPath()
        let point = vertices[0] as Vec2
        ctx.moveTo(point?.x, point?.y)

        for (let i = vertices.length - 1; i > 0; --i) {
            point = vertices[i] as Vec2
            ctx.lineTo(point.x, point.y)
        }
        ctx.closePath()

        ctx.fillStyle = color
        ctx.fill()
        ctx.stroke()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = lineWidth
        ctx.stroke()
    }

}

interface RigidBodyResult {
    created: boolean
    body?: RigidBody | null
    errorMessage?: string
}

//A rigidbody is a physics component in software and game development 
// (like Unity or Blender) that allows an object to act under
//  the control of a physics engine. 
class RigidBody {
    position: Vec2
    linearVelocity: Vec2
    density: number
    mass: number
    restitution: number
    area: number
    isStatic: boolean
    radius: number
    width: number
    height: number
    shapeType: ShapeType

    private constructor(position: Vec2,
        density: number,
        mass: number,
        restitution: number,
        area: number,
        isStatic: boolean,
        radius: number,
        width: number,
        height: number,
        shapeType: ShapeType) {
        this.position = position
        this.linearVelocity = Vec2.Zero
        this.mass = 0

        this.density = density
        this.area = area
        this.mass = mass
        this.restitution = restitution
        this.isStatic = isStatic
        this.radius = radius
        this.width = width
        this.height = height
        this.shapeType = shapeType

    }

    static CreateCircleBody(position: Vec2,
        density: number,
        mass: number,
        restitution: number,
        isStatic: boolean,
        radius: number,
        width: number,
        height: number,
        shapeType: ShapeType): RigidBodyResult {
        let errorMessage: string = ""
        let created: boolean = true

        let area = radius * radius * Math.PI
        if (area < World.MinBodySize) {
            return {
                created: false,
                body: null,
                errorMessage: `Circle radius is to small .Minum circle area is ${World.MinBodySize}`
            }
        }

        if (area > World.MaxBodySize) {
            return {
                created: false,
                body: null,
                errorMessage: `Circle radius is to Big .Maximun circle area is ${World.MaxBodySize}`
            }
        }

        if (density < World.MaxBodySize) {
            return {
                created: false,
                body: null,
                errorMessage: `Density is to Small .Minimun circle density is ${World.MinDensity}`
            }
        }

        if (density > World.MaxBodySize) {
            return {
                created: false,
                body: null,
                errorMessage: `Density is to Big .Maximun circle density is ${World.MaxDensity}`
            }
        }

        let body: RigidBody | null = null


        return {
            created: created,
            body: body,
            errorMessage: errorMessage
        }
    }
}

class World {
    static MinBodySize: number = 2  // this is area 1 * 1
    static MaxBodySize: number = 64 // this is area 1 * 1
    static MinDensity: number = 1
    static MaxDensity: number = 21
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

    // draw line
    Shape.DrawLine(ctx, Vec2.Zero, new Vec2(250, 250), "#fff", 3)


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
