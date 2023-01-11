export let dataExample = [];

for (let i = 0; i < 10000; i++) {
    const x = Math.floor(Math.random() * 999999) + 1;
    const y = Math.floor(Math.random() * 999999) + 1;
    dataExample.push([x, y]);
}
