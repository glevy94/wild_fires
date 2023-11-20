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
        const initialYear = document.getElementById('dateSlider').value;
        let { year, month } = sliderValueToDate(parseInt(initialYear));
        updateCostDisplay(year);
    }).catch(error => console.error('Error loading cost data:', error));
}

// Function to update the cost display
function updateCostDisplay(year) {
    const cost = costData[year];
    const costElement = document.getElementById('costDisplay');

    if (cost) {
        costElement.textContent = `$${cost.toLocaleString()} in ${year}`;
        // costElement.style.fontSize = `${(cost / 20000000)}px`; // Adjust size relative to cost
        costElement.style.fontSize = `100px`;
    } else {
        costElement.textContent = 'No data';
    }
}

// function to color points on graph
function getCategoryColor(category) {
    const colorMapping = {
        'Human': 'red',
        'Natural': 'green'
    };
    return colorMapping[category] || 'gray';
}

// Function to plot data using Plotly
function plotData(geojsonData, year, month) {

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
        title: `Incident Data for ${month}/${year}`,
        geo: {
            scope: 'usa',
            projection: {
                type: 'albers usa'
            },
            showland: true,
            landcolor: 'rgb(255, 249, 240)',
        },
        showlegend: false,
        autosize: true,
        //height: 1000,
        
    };

    var config = {
        responsive: true,
    }

    Plotly.newPlot('graph', plotData, layout, config);
}


// Function to load data based on year and month and update the graph
function updateGraph(year, month) {
    let formattedMonth = month.toString();

    const fileName = `/data/year_month/data_${year}_${formattedMonth}.geojson`;

    let cacheKey = year + '_' + formattedMonth;
    if (dataCache[cacheKey]) {
        plotData(dataCache[cacheKey], year, month);
        return;
    }

    d3.json(fileName).then(function(geojsonData) {
        dataCache[cacheKey] = geojsonData;
        plotData(geojsonData, year, month);
    }).catch(error => console.error('Error loading the GeoJSON data:', error));
}

// Function to translate slider value to year and month
function sliderValueToDate(value) {
    const startYear = 2020;
    let year = Math.floor(value / 12) + startYear;
    let month = (value % 12) + 1;
    return { year, month };
}

// Function to translate year and month to slider value
function dateToSliderValue(year, month) {
    const startYear = 2020;
    let yearDiff = year - startYear;
    let sliderValue = (yearDiff * 12) + (month - 1);
    return sliderValue;
}


// Event listener for the date slider
document.getElementById('dateSlider').addEventListener('input', function() {
    let { year, month } = sliderValueToDate(parseInt(this.value));
    document.getElementById('slider-value').textContent = `${month}/${year}`;
    updateGraph(year, month);
    updateCostDisplay(year);
});

// Event listener for increasing the date with button
document.getElementById('increase').addEventListener('click', function() {
    var slider = document.getElementById('dateSlider');
    var currentValue = parseInt(slider.value);
    var maxValue = parseInt(slider.max);

    if (currentValue < maxValue) {
        slider.value = currentValue + 1;
        let { year, month } = sliderValueToDate(parseInt(slider.value));
        updateGraph(year, month);
        updateCostDisplay(year); // If you have a function to update the cost display
        document.getElementById('slider-value').textContent = `${month}/${year}`;
    }
});

// Event listener for decreasing the date with button
document.getElementById('decrease').addEventListener('click', function() {
    var slider = document.getElementById('dateSlider');
    var currentValue = parseInt(slider.value);
    var minValue = parseInt(slider.min);

    if (currentValue > minValue) {
        slider.value = currentValue - 1;
        let { year, month } = sliderValueToDate(parseInt(slider.value));
        updateGraph(year, month);
        updateCostDisplay(year); // If you have a function to update the cost display
        document.getElementById('slider-value').textContent = `${month}/${year}`;
    }
});

document.getElementById('apply-date').addEventListener('click', function() {
    var selectedYear = document.getElementById('year-select').value;
    var selectedMonth = document.getElementById('month-select').value;

    // Combine the year and month to a date string or as needed
    var selectedDate = `${selectedYear}-${selectedMonth}`;

    // Now you can use selectedDate to filter your data or update your graph/chart
    updateGraphAndChart(selectedDate);
});

function updateGraphAndChart(date) {
    // Implement the logic to update your graph and chart based on the selected date
}



// Initial graph setup
const initialYear = document.getElementById('dateSlider').value;
let { year, month } = sliderValueToDate(parseInt(initialYear));
updateGraph(year, month);
loadCostData();

