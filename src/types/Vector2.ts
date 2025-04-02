export default class Vector2 {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    add(v: Vector2): Vector2 {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v: Vector2): Vector2 {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mult(scalar: number): Vector2 {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    div(scalar: number): Vector2 {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }

    dot(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }

    sqrNorm(): number {
        return this.x * this.x + this.y * this.y;
    }

    norm(): number {
        return Math.sqrt(this.sqrNorm());
    }

    normalize(): Vector2 {
        const norm = this.norm();
        this.x /= norm;
        this.y /= norm;
        return this;
    }

    normalized(): Vector2 {
        const norm = this.norm();
        return new Vector2(this.x / norm, this.y / norm);
    }

    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    rotate(angle: number): Vector2 {
        console.log(this.x, this.y)
        const x = this.x;
        this.x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
        console.log(x, this.x)
        this.y = x * Math.sin(angle) + this.y * Math.cos(angle);
        return this;
    }

    apply(x: number, y: number): Vector2 {
        this.x = x;
        this.y = y;
        return this;
    }

    static Add(v1: Vector2, v2: Vector2): Vector2 {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    static Sub(v1: Vector2, v2: Vector2): Vector2 {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    static Mult(v: Vector2, scalar: number): Vector2 {
        return new Vector2(v.x * scalar, v.y * scalar);
    }

    static Div(v: Vector2, scalar: number): Vector2 {
        return new Vector2(v.x / scalar, v.y / scalar);
    }

    static Dot(v1: Vector2, v2: Vector2): number {
        return v1.x * v2.x + v1.y * v2.y;
    }

    static PointFrom(e: MouseEvent): Vector2 {
        return new Vector2(e.clientX, e.clientY);
    }

    static PositionFrom(e: HTMLElement | null): Vector2 {
        if (e == null) return Vector2.ZERO;
        
        const rect = e.getBoundingClientRect();
        return new Vector2(rect.x, rect.y);
    }

    static ZERO: Vector2  = new Vector2(0, 0);
    static UP: Vector2    = new Vector2(0, -1);
    static DOWN: Vector2  = new Vector2(0, 1);
    static LEFT: Vector2  = new Vector2(-1, 0);
    static RIGHT: Vector2 = new Vector2(1, 0);
}