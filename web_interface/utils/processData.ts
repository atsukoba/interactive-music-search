// import { Data } from "plotly.js";
import { ResponseDatum } from "../api/data";

export const calcMappingCoordinates = (
    data: ResponseDatum[]
): ResponseDatum[] => {
    let meanX: number = 0;
    let meanY: number = 0;
    let meanZ: number = 0;
    const dataLen = data.length;
    console.log(dataLen);
    data.forEach((d) => {
        meanX += d.x / dataLen;
        meanY += d.y / dataLen;
        meanZ += d.z / dataLen;
    });
    console.log([meanX, meanY, meanZ]);
    return data.map((d) => {
        return {
            ...d,
            x: d.x - meanX,
            y: d.y - meanY,
            z: d.z - meanZ,
        };
    });
};

export const getTitleToSid = (d: ResponseDatum[]): Map<string, string> => {
    const m = new Map<string, string>();
    d.forEach((e) => {
        m.set(e.title, e.sid);
    });
    return m;
};