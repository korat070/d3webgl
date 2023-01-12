import {Chart} from "./chart.js";

const {L, C} = window._;

/*// const getData = (index, size)
const makeParam = size => [...d3.range(0, size, 1000), size]
const getData = page => new Promise(
    resolve => setTimeout(() => resolve(page * 100), 1000)
);

const param = makeParam(3004)
_.log(param);*/



_.go(
    d3.range(0, 1000),
    C.map(param => new Chart())
)

