let currentBarChartFilter = 'both'


// Load and process the data, then plot the graph
function loadDataAndPlot() {
    d3.json('/data/data_2020_2023.geojson').then(function(data) {
        // Process data to extract the required information
        let filteredData = filterChartData(data, currentBarChartFilter); 
        let processedData = processData(filteredData);

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

    // Define season colors
    const seasonColors = ['#85C1E9', '#76D7C4', '#FF5733', '#F39C12']; 

    const seasonLegendTraces = [
        {
            x: [null],  
            y: [null],  
            type: 'bar',
            mode: 'lines',
            name: 'Winter',
            marker: { color: seasonColors[0] },
            showlegend: true,
            hoverinfo: 'none'
        },
        {
            x: [null],  
            y: [null],  
            type: 'bar',
            mode: 'lines',
            name: 'Spring',
            marker: { color: seasonColors[1] },
            showlegend: true,
            hoverinfo: 'none' 
        },
        {
            x: [null], 
            y: [null],  
            type: 'bar',
            mode: 'lines',
            name: 'Summer',
            marker: { color: seasonColors[2]},
            showlegend: true,
            hoverinfo: 'none' 
        },
        {
            x: [null],  
            y: [null],  
            type: 'bar',
            mode: 'lines',
            name: 'Fall',
            marker: { color: seasonColors[3] },
            showlegend: true,
            hoverinfo: 'none'
        },
    ];

    var layout = {
        
        xaxis: { title: 'Month' },
        yaxis: { title: 'Number of Fires' },
        yaxis2: {
            title: 'Acres Burned',
            overlaying: 'y',
            side: 'right'
        },
        
        shapes: [],
        autosize: true,
        margin: {
            l: 80, 
            r: 60,  
            b: 100,  
            t: 20,  
        }
    };

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

    var combinedData = [timeSeriesTrace, barChartTrace].concat(seasonLegendTraces);

    Plotly.newPlot('timeSeriesPlot', combinedData, layout);
}

// Function to filter the chart data based on the selected filter
function filterChartData(data, filter) {
    if (filter === 'both') {
        return data; // Return all data if 'Both' is selected
    }

    // Filter data based on the selected filter ('Human' or 'Natural')
    return {
        ...data,
        features: data.features.filter(feature => feature.properties.FireCause === filter)
    };
}

// Event listener for filter changes
document.getElementById('filter-form').addEventListener('change', function(event) {
    var selectedFilter = event.target.value;
    updateChartWithFilter(selectedFilter); // Update the chart when the filter changes
});

// Function to update the chart based on the selected filter
function updateChartWithFilter(filter) {
    currentBarChartFilter = filter; // Update the current filter
    loadDataAndPlot(); // Reload and replot the data with the new filter
}


// Call the function to load and plot the data
loadDataAndPlot();


