var vWidth = 300;
var vHeight = 200;

// Prepare our physical space
var g = d3.select('svg').attr('width', vWidth).attr('height', vHeight).select('g');

// Get the data from our CSV file
d3.csv('data.csv', function(error, vCsvData) {
    if (error) throw error;

    vData = d3.stratify()(vCsvData);
    drawViz(vData);
});

function drawViz(vData) {
    // Declare d3 layout
    var vLayout = d3.pack().size([vWidth, vHeight]);

    // Layout + Data
    var vRoot = d3.hierarchy(vData).sum(function (d) { return d.data.size; });
    var vNodes = vRoot.descendants();
    vLayout(vRoot);
    var vSlices = g.selectAll('circle').data(vNodes).enter().append('circle');

    // Draw on screen
    vSlices.attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', function (d) { return d.r; });
}
