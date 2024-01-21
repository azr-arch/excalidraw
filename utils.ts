import { ElementAtPosition, PositionStatusType } from "./app/_components/canvas";
import { DrawnElementType } from "./types";

export const getSvgPathFromStroke = (stroke: number[][]) => {
    if (!stroke.length) return "";

    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ["M", ...stroke[0], "Q"]
    );

    d.push("Z");
    return d.join(" ");
};

export const isWithInElement = (
    x: number,
    y: number,
    element: DrawnElementType,
    context: CanvasRenderingContext2D | null = null
): PositionStatusType => {
    let { shape, x1, x2, y1, y2 } = element;
    const tolerance = 10;

    const textTolerance = 5;

    // Ensure x1/y1 is the top-left corner and x2/y2 is the bottom-right
    if (x1 > x2) [x1, x2] = [x2, x1];
    if (y1 > y2) [y1, y2] = [y2, y1];

    switch (shape) {
        case "line":
        case "arrow":
            const m = (y2 - y1) / (x2 - x1);
            const c = y1 - m * x1;
            const dist = Math.abs(y - (m * x + c));
            return dist < tolerance ? "boundary" : "outside";

        case "rectangle":
            const isInside =
                x > x1 + tolerance &&
                x < x2 - tolerance &&
                y > y1 + tolerance &&
                y < y2 - tolerance;
            const isNearBoundary =
                x >= x1 - tolerance &&
                x <= x2 + tolerance &&
                y >= y1 - tolerance &&
                y <= y2 + tolerance;
            return isInside ? "inside" : isNearBoundary ? "boundary" : "outside";

        case "circle":
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            const radiusX = Math.abs(x2 - x1) / 2;
            const radiusY = Math.abs(y2 - y1) / 2;
            const ellipseValue =
                Math.pow(x - centerX, 2) / Math.pow(radiusX, 2) +
                Math.pow(y - centerY, 2) / Math.pow(radiusY, 2);
            const outerEllipseValue =
                Math.pow(x - centerX, 2) / Math.pow(radiusX + tolerance, 2) +
                Math.pow(y - centerY, 2) / Math.pow(radiusY + tolerance, 2);
            return outerEllipseValue <= 1 ? (ellipseValue > 1 ? "boundary" : "inside") : "outside";

        case "pencil":
            if (!element.points) return "outside";

            const isOnPath = element.points.some((point, index) => {
                if (!element.points) return "outside";

                if (index === element.points.length - 1) return false;
                const nextPoint = element.points[index + 1];
                const a = { x: point.x, y: point.y };
                const b = { x: nextPoint.x, y: nextPoint.y };
                const c = { x, y };
                const offset =
                    Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)) -
                    (Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2)) +
                        Math.sqrt(Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2)));
                return Math.abs(offset) < 5;
            });
            return isOnPath ? "boundary" : "outside";

        case "text":
            if (!element.textValue) return "outside";

            const textWidth = context?.measureText(element.textValue).width;
            const textHeight = (element?.fontSize || 24) * 1.2;

            return x >= x1 - textTolerance &&
                x <= x2 + (textWidth || 0) + textTolerance &&
                y >= y1 - textTolerance &&
                y <= y2 + textHeight + textTolerance
                ? "boundary"
                : "outside";

        default:
            return "outside";
    }
};

export const getElementAtPosition = (
    x: number,
    y: number,
    elements: DrawnElementType[],
    context: CanvasRenderingContext2D | null
): ElementAtPosition => {
    for (let element of elements) {
        const positionStatus = isWithInElement(x, y, element, context);

        if (positionStatus !== "outside") {
            return { positionStatus, element };
        }
    }
    return { positionStatus: "outside", element: null };
};

export const eraseElement = (toErase: DrawnElementType, from: DrawnElementType[]) => {
    const { id: toEraseId } = toErase;
    return from.filter(({ id }) => id !== toEraseId);
};

export const getCoordinates = (
    event: any,
    panOffset: { x: number; y: number },
    scale: number,
    scaleOffset: { x: number; y: number }
) => {
    const clientX = (event.clientX - panOffset.x * scale + scaleOffset.x) / scale;
    const clientY = (event.clientY - panOffset.y * scale + scaleOffset.y) / scale;

    return { clientX, clientY };
};
