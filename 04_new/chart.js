import {dataExample} from './data.js'

const pointColor = ['#ff85ff', '#aa85ff', '#7785ff', ,'#0085ff']
const margin = { top: 20, right: 15, bottom: 60, left: 70 };
const outerWidth = 800;
const outerHeight = 600;
const width = outerWidth - margin.left - margin.right;
const height = outerHeight - margin.top - margin.bottom;

export class Chart {
    constructor(containerSelector) {

        this.lastTransform = null;
        this.lastSelection = null;
        this.brushStartPoint = null;

        this.container = d3.select(containerSelector);

        this.svgChart = this.container.append('svg:svg')
            .attr('width', outerWidth)
            .attr('height', outerHeight)
            .style('z-index', 1)
            .attr('class', 'svg-plot')
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .on('dblclick', this.resetZoom.bind(this));

        this.canvasChart = this.container.append('canvas')
            .attr('width', width)
            .attr('height', height)
            .style('z-index', 0)
            .style('margin-left', margin.left + 'px')
            .style('margin-top', margin.top + 'px')
            .attr('class', 'canvas-plot');


        this.context = this.canvasChart.node().getContext('2d');

        this.x = d3.scaleLinear().domain([0, d3.max(dataExample, (d) => d[0])]).range([0, width]).nice();
        this.y = d3.scaleLinear().domain([0, d3.max(dataExample, (d) => d[1])]).range([height, 0]).nice();

        this.xAxis = d3.axisBottom(this.x);
        this.yAxis = d3.axisLeft(this.y);

        this.gxAxis = this.svgChart.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(this.xAxis);

        this.gyAxis = this.svgChart.append('g')
            .call(this.yAxis);

        this.svgChart.append('text')
            .attr('x', `-${height / 2}`)
            .attr('dy', '-3.5em')
            .attr('transform', 'rotate(-90)')
            .text('Axis Y');
        this.svgChart.append('text')
            .attr('x', `${width / 2}`)
            .attr('y', `${height + 40}`)
            .text('Axis X');

        this.draw(d3.zoomIdentity)

        this.zoom_function = d3.zoom().scaleExtent([1, 1000])
            .on('zoom', () => {
                const transform = d3.event.transform;
                this.context.save();
                this.draw(transform);
                this.context.restore();
            });

        this.canvasChart.call(this.zoom_function);

        this.brush = d3.brush().extent([[0, 0], [width, height]])
            .on("start", () => { this.handleBrushStart(); })
            .on("brush", () => { this.handleBrush(); })
            .on("end", () => { this.handleBrushEnd(); })
            .on("start.nokey", function() {
                d3.select(window).on("keydown.brush keyup.brush", null);
            });

        this.brushSvg = this.svgChart
            .append("g")
            .attr("class", "brush")
            .call(this.brush);


    }
    draw (transform) {
        this.lastTransform = transform;

        const scaleX = transform.rescaleX(this.x);
        const scaleY = transform.rescaleY(this.y);

        this.gxAxis.call(this.xAxis.scale(scaleX));
        this.gyAxis.call(this.yAxis.scale(scaleY));

        this.context.clearRect(0, 0, width, height);

        dataExample.forEach(point => {
            this.drawPoint(scaleX, scaleY, point, transform.k);
        });
    }
    drawPoint (scaleX, scaleY, point, k) {
        this.context.beginPath();
        this.context.fillStyle = pointColor[Math.floor(Math.random() * 10 % 4)]  ;
        const px = scaleX(point[0]);
        const py = scaleY(point[1]);

        this.context.arc(px, py, 1.2 * k, 0, 2 * Math.PI, true);
        this.context.fill();
    }
    resetZoom () {
        const t = d3.zoomIdentity.translate(0, 0).scale(1);
        this.canvasChart
            .transition()
            .duration(200)
            .ease(d3.easeLinear)
            .call(this.zoom_function.transform, t)
    }
    handleBrushStart () {
        const sourceEvent = d3.event.sourceEvent;
        const selection = d3.event.selection;
        if (sourceEvent.type === 'mousedown') {
            this.brushStartPoint = {
                mouse: {
                    x: sourceEvent.screenX,
                    y: sourceEvent.screenY
                },
                x: selection[0][0],
                y: selection[0][1]
            }
        } else {
            this.brushStartPoint = null;
        }
    }
    handleBrush () {
        if (this.brushStartPoint !== null) {
            const scale = width / height;
            const sourceEvent = d3.event.sourceEvent;
            const mouse = {
                x: sourceEvent.screenX,
                y: sourceEvent.screenY
            };
            if (mouse.x < 0) { mouse.x = 0; }
            if (mouse.y < 0) { mouse.y = 0; }
            let distance = mouse.y - this.brushStartPoint.mouse.y;
            let yPosition = this.brushStartPoint.y + distance;
            let xCorMulti = 1;

            if ((distance < 0 && mouse.x > this.brushStartPoint.mouse.x) || (distance > 0 && mouse.x < this.brushStartPoint.mouse.x)) {
                xCorMulti = -1;
            }

            if (yPosition > height) {
                distance = height - this.brushStartPoint.y;
                yPosition = height;
            } else if (yPosition < 0) {
                distance = -this.brushStartPoint.y;
                yPosition = 0;
            }

            let xPosition = this.brushStartPoint.x + distance * scale * xCorMulti;
            const oldDistance = distance;

            if (xPosition > width) {
                distance = (width - this.brushStartPoint.x) / scale;
                xPosition = width;
            } else if (xPosition < 0) {
                distance = this.brushStartPoint.x / scale;
                xPosition = 0;
            }

            if (oldDistance !== distance) {
                distance *= (oldDistance < 0) ? -1 : 1;
                yPosition = this.brushStartPoint.y + distance;
            }

            const selection = this.svgChart.select(".selection");

            const posValue = Math.abs(distance);
            selection.attr('width', posValue * scale).attr('height', posValue);

            if (xPosition < this.brushStartPoint.x) {
                selection.attr('x', xPosition);
            }
            if (yPosition < this.brushStartPoint.y) {
                selection.attr('y', yPosition);
            }

            const minX = Math.min(this.brushStartPoint.x, xPosition);
            const maxX = Math.max(this.brushStartPoint.x, xPosition);
            const minY = Math.min(this.brushStartPoint.y, yPosition);
            const maxY = Math.max(this.brushStartPoint.y, yPosition);

            this.lastSelection = { x1: minX, x2: maxX, y1: minY, y2: maxY };
        }
    }
    handleBrushEnd () {
        const s = d3.event.selection;
        if (!s) {
            if (this.lastSelection == null) return;
            // Re-scale axis for the last transformation
            let zx = this.lastTransform.rescaleX(this.x);
            let zy = this.lastTransform.rescaleY(this.y);

            // Calc distance on Axis-X to use in scale
            let totalX = Math.abs(this.lastSelection.x2 - this.lastSelection.x1);

            // Get current point [x,y] on canvas
            const originalPoint = [zx.invert(this.lastSelection.x1), zy.invert(this.lastSelection.y1)];
            // Calc scale mapping distance AxisX in width * k
            // Example: Scale 1, width: 830, totalX: 415
            // Result in a zoom of 2
            const t = d3.zoomIdentity.scale(((width * this.lastTransform.k) / totalX));
            // Re-scale axis for the new transformation
            zx = t.rescaleX(this.x);
            zy = t.rescaleY(this.y);
            // Call zoomFunction with a new transformation from the new scale and brush position.
            // To calculate the brush position we use the originalPoint in the new Axis Scale.
            // originalPoint it's always positive (because we're sure it's within the canvas).
            // We need to translate this originalPoint to [0,0]. So, we do (0 - position) or (position * -1)
            this.canvasChart
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .call(this.zoom_function.transform,
                    d3.zoomIdentity
                        .translate(zx(originalPoint[0]) * -1, zy(originalPoint[1]) * -1)
                        .scale(t.k));
            this.lastSelection = null;
        } else {
            this.brushSvg.call(this.brush.move, null);
        }
    }

}

