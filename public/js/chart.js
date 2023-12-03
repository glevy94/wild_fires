// Load and process the data, then plot the graph
function loadDataAndPlot() {
    d3.json('/data/data_2020_2023.geojson').then(function(data) {
        // Process data to extract the required information
        let processedData = processData(data);

        // Plot the combined graph
        plotCombinedGraph(processedData);
    }).catch(error => console.error('Error loading data:', error));
}

function processData(data) {
    let monthlyData = {};

    // Iterate over each feature in the GeoJSON data
    data.features.forEach(feature => {
        let year = feature.properties.year;
        let month = feature.properties.month;
        let size = feature.properties.IncidentSize;

        // Create a unique key for each month and year
        let key = `${year}-${month}`;

        // Initialize the record if it doesn't exist
        if (!monthlyData[key]) {
            monthlyData[key] = { numberOfFires: 0, acresBurned: 0 };
        }

        // Aggregate the data
        monthlyData[key].numberOfFires += 1;
        monthlyData[key].acresBurned += size;
    });

    // Convert and sort the aggregated data
    let processedData = Object.keys(monthlyData).map(key => {
        let [year, month] = key.split('-').map(Number);
        return {
            month: `${month}/${year}`, // Format the month and year for display
            numberOfFires: monthlyData[key].numberOfFires,
            acresBurned: monthlyData[key].acresBurned
        };
    }).sort((a, b) => {
        let [monthA, yearA] = a.month.split('/').map(Number);
        let [monthB, yearB] = b.month.split('/').map(Number);
        return yearA - yearB || monthA - monthB;
    });

    return processedData;
}

// Function to plot the combined graph
function plotCombinedGraph(data) {
    // Time Series for Number of Fires
    var timeSeriesTrace = {
        x: data.map(item => item.month),
        y: data.map(item => item.numberOfFires),
        type: 'scatter',
        name: 'Number of Fires',
        yaxis: 'y1'
    };

    // Bar Chart for Acres Burned
    var barChartTrace = {
        x: data.map(item => item.month),
        y: data.map(item => item.acresBurned),
        type: 'bar',
        name: 'Acres Burned',
        yaxis: 'y2'
    };

    var layout = {
        //title: 'Fires and Acres Burned per Month',
        xaxis: { title: 'Month' },
        yaxis: { title: 'Number of Fires' },
        yaxis2: {
            title: 'Acres Burned',
            overlaying: 'y',
            side: 'right'
        },
        //paper_bgcolor: '#D3D3D3',
        shapes: [],
        autosize: true,
        margin: {
            l: 50,  // Left margin
            r: 50,  // Right margin
            b: 100,  // Bottom margin
            t: 50,  // Top margin
            pad: 10  // Padding between plot and margins
        }
    };

        // Define season colors
    const seasonColors = ['#85C1E9', '#76D7C4', '#FF5733', '#F39C12']; // Example colors

    // Add highlight shapes
    for (let i = 0; i < data.length; i += 3) {
        // Calculate the start and end indices for each period
        let startIndex = i;
        let endIndex = i + 3 < data.length ? i + 3 : data.length - 1;

        // Format the month/year for the shape boundaries
        let startMonth = data[startIndex].month;
        let endMonth = data[endIndex].month;

        i == 0 ? startIndex = 1 : startIndex = startIndex;
        i == 45 ? [startIndex = 45, endIndex = 47] : [startIndex = startIndex, endIndex = endIndex];

        layout.shapes.push({
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x0: startIndex - 1.5,
            y0: 0,
            x1: endIndex - 1.5,
            y1: 1,
            fillcolor: seasonColors[i / 3 % seasonColors.length],
            opacity: 0.15,
            line: {
                width: 0
            }
        });
    }

    Plotly.newPlot('timeSeriesPlot', [timeSeriesTrace, barChartTrace], layout);
}

// Update chart with filter value
document.getElementById('filter-form').addEventListener('change', function(event) {
    var selectedFilter = event.target.value;
    
    updateChartWithFilter(selectedFilter);
});

function updateChartWithFilter(filter) {
    // Implement the logic to update your graph and chart based on the filter
    // This might involve fetching new data, filtering the existing dataset, and re-rendering the graph/chart
}


// Call the function to load and plot the data
loadDataAndPlot();


