let costData = {}; // To store cost data
let dataCache = {}; // Cache for storing loaded data

// Function to load cost data
function loadCostData() {
    d3.json('/data/supp_costs.json').then(function(data) {
        // Convert array to a key-value object
        data.forEach(item => {
            costData[item.Year] = item.Total;
        });
        // Initial update for cost display
        updateCostDisplay(document.getElementById('yearSlider').value);
    }).catch(error => console.error('Error loading cost data:', error));
}

// Function to update the cost display
function updateCostDisplay(year) {
    const cost = costData[year];
    const costElement = document.getElementById('costDisplay');

    if (cost) {
        costElement.textContent = `$${cost.toLocaleString()}`;
        costElement.style.fontSize = `${(cost / 20000000)}px`; // Adjust size relative to cost
    } else {
        costElement.textContent = 'No data';
    }
}

function getCategoryColor(category) {
    const colorMapping = {
        'Human': 'red',
        'Natural': 'green'
    };
    return colorMapping[category] || 'gray';
}

// Function to plot data using Plotly
function plotData(geojsonData, year) {

    // Process the GeoJSON data to extract coordinates and other properties
    var plotData = geojsonData.features.map(function(feature) {
        return {
            type: 'scattergeo',
            mode: 'markers',
            text: `Fire Size: ${feature.properties.IncidentSize} acres`, // Customize as per your data
            lon: [feature.geometry.coordinates[0]],
            lat: [feature.geometry.coordinates[1]],
            marker: {
                size: 2,
                color: getCategoryColor(feature.properties.FireCause)
            }
        };
    });

    var layout = {
        title: `Incident Data for ${year}`,
        geo: {
            scope: 'usa',
            projection: {
                type: 'albers usa'
            }
        },
        showlegend: false,
        autosize: true,
        height: 1000,

    };

    var config = {
        responsive: true,
    }

    Plotly.newPlot('graph', plotData, layout, config);
}

// Function to load data based on year and update the graph
function updateGraph(year) {
    // Update the slider value display
    document.getElementById('slider-value').textContent = year;

    // Use cached data if available
    if (dataCache[year]) {
        plotData(dataCache[year], year);
        return;
    }

    // Fetch the data using D3.js
    d3.json(`/data/data_${year}.geojson`).then(function(geojsonData) {
        dataCache[year] = geojsonData; // Cache the data
        plotData(geojsonData, year);
    }).catch(error => {
        console.error('Error loading the GeoJSON data:', error);
        // Handle the error appropriately in your application context
    });
}

// Event listener for the slider
document.getElementById('yearSlider').addEventListener('input', function() {
    updateGraph(this.value);
    document.getElementById('slider-value').textContent = this.value;
    updateCostDisplay(this.value);
});

document.getElementById('increase').addEventListener('click', function() {
    var slider = document.getElementById('yearSlider');
    var currentValue = parseInt(slider.value);
    var maxValue = parseInt(slider.max);

    if (currentValue < maxValue) {
        slider.value = currentValue + 1;
        updateGraph(slider.value);
        updateCostDisplay(slider.value); // If you have a function to update the cost display
        document.getElementById('slider-value').textContent = slider.value;
    }
});

document.getElementById('decrease').addEventListener('click', function() {
    var slider = document.getElementById('yearSlider');
    var currentValue = parseInt(slider.value);
    var minValue = parseInt(slider.min);

    if (currentValue > minValue) {
        slider.value = currentValue - 1;
        updateGraph(slider.value);
        updateCostDisplay(slider.value); // If you have a function to update the cost display
        document.getElementById('slider-value').textContent = slider.value;
    }
});

// Initial graph setup
const initialYear = document.getElementById('yearSlider').value;
updateGraph(initialYear);
document.getElementById('slider-value').textContent = initialYear;
loadCostData();

