import TynyColor from "tinycolor2";
import tinygradient from "tinygradient";

export const allGenres = [
    "pop",
    "classical",
    "baroque",
    "rock",
    "renaissance",
    "alternative-indie",
    "italian french spanish",
    "metal",
    "country",
    "romantic",
    "traditional",
    "dance-eletric",
    "modern",
    "jazz",
    "blues",
    "hits of 2011 2020",
    "hip-hop-rap",
    "punk",
    "instrumental",
    "hits of the 1970s",
    "hits of the 2000s",
];

const gradient = tinygradient([
    '#ff0000',
    '#00ff00',
    '#0000ff'
]);
const colorsHsv = gradient.hsv(allGenres.length, false);

export const genreColorMap: Map<string, string> = new Map(allGenres.map((genre, index) => [
    genre, colorsHsv[index].toHexString()
]));
