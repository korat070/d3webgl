export let dataExample = [];

for (let i = 0; i < 1000; i++) {
    const x = Math.floor(Math.random() * 1000) + 1;
    const y = Math.floor(Math.random() * 1000) + 1;
    const groupId = (x % 10) + 1;
    dataExample.push([x, y, groupId]);
}
