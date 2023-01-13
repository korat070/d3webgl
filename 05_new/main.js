import {Chart} from "./chart.js";
const {L, C} = window._;
const _ = window._;

let sampleData = [];


for (let i = 0; i < 10000; i++) {
    const x = Math.floor(Math.random() * 1000) + 1;
    const y = Math.floor(Math.random() * 1000) + 1;
    const groupId = (x % 10) + 1;
    sampleData.push([x, y, groupId]);
}

// _.go(
//     L.range(100),
//     L.map(_=>sampleData),
//     L.map(data => () => new Chart(data)),
//     L.chunk(4),
//     L.map(L.map( f => f())),
//     L.map(C.takeAll),
//     _.each(
//         _.each(
//             _.log
//         )
//     )
// );


async function a() {
    await _.go(
        L.interval(0),
        L.map((a) => a + 1),
        L.takeUntil((a) => a == 100),
        L.map( _ => () => new Chart(sampleData)),
        L.chunk(10),
        L.map(L.map( f=>f())),
        _.each(C.takeAll)

    );
}

a();



// _.go(
//     d3.range(0, 1000),
//     _.map(_ => () => new Chart(sampleData)),
//     _.chunk(5),
//     _.each(chunk => {
//         C.map(f => f(), chunk)
//     })
//     // console.log
//)

