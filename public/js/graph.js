//let costData = {}; // To store cost data
let dataCache = {}; // Cache for storing loaded data


/*initial graph setup*/ 

// Initial graph setup
const initialYear = document.getElementById('dateSlider').value;
let { year, month } = sliderValueToDate(parseInt(initialYear));
const radioCause = document.getElementById('filter-form').value;
updateFilters(year, month, radioCause);




// Function to load data based on year and month and update the graph
function updateFilters(year, month, causeFilter) {
    let formattedMonth = month.toString();

    const fileName = `/data/year_month/data_${year}_${formattedMonth}.geojson`;

    let cacheKey = year + '_' + formattedMonth;
    if (dataCache[cacheKey]) {
        const filteredData = updateGraphCause(dataCache[cacheKey], causeFilter);
        initPlot(filteredData, year, month);
        return;
    }

    d3.json(fileName).then(function(geojsonData) {
        dataCache[cacheKey] = geojsonData;
        initPlot(geojsonData, year, month);
    }).catch(error => console.error('Error loading the GeoJSON data:', error));
}


// helper Function to load data based on cause and update the graph
function updateGraphCause(causeFilter) {
    return {
        type: 'FeatureCollection',
        features: geojsonData.features.filter(feature => feature.properties.FireCause === causeFilter)
    };
}

// Function for initial plot data using Plotly
function initPlot(geojsonData, year, month) {

    // Process the GeoJSON data to extract coordinates and other properties
    var plotData = geojsonData.features.map(function(feature) {
        return {
            type: 'scattergeo',
            mode: 'markers',
            text: `Fire Size: ${feature.properties.IncidentSize} acres`, 
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

    Plotly.react('graph', plotData, layout, config);
}

// function to color points on graph
function getCategoryColor(category) {
    const colorMapping = {
        'Human': 'red',
        'Natural': 'green'
    };
    return colorMapping[category] || 'gray';
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

// Add a function to set the slider value when changing with sidebar
function setSliderValue(year, month) {
    // Calculate the slider value based on the year and month
    let sliderValue = dateToSliderValue(year, month);

    // Set the slider value
    document.getElementById('dateSlider').value = sliderValue;

    // Update the displayed value
    document.getElementById('slider-value').textContent = `${month}/${year}`;
}


/*EVENT LISTENERS*/

// Event listener for the date slider
document.getElementById('dateSlider').addEventListener('input', function() {
    let { year, month } = sliderValueToDate(parseInt(this.value));
    document.getElementById('slider-value').textContent = `${month}/${year}`;
    updateFilters(year, month, radioCause);
    //updateCostDisplay(year);
});

// Event listener for increasing the date with button
document.getElementById('increase').addEventListener('click', function() {
    var slider = document.getElementById('dateSlider');
    var currentValue = parseInt(slider.value);
    var maxValue = parseInt(slider.max);

    if (currentValue < maxValue) {
        slider.value = currentValue + 1;
        let { year, month } = sliderValueToDate(parseInt(slider.value));
        updateFilters(year, month, radioCause);
        //updateCostDisplay(year); // If you have a function to update the cost display
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
        updateFilters(year, month, radioCause);
        //updateCostDisplay(year); // If you have a function to update the cost display
        document.getElementById('slider-value').textContent = `${month}/${year}`;
    }
});

//event listener for apply date button
document.getElementById('apply-date').addEventListener('click', function() {
    var selectedYear = document.getElementById('year-select').value;
    var selectedMonth = document.getElementById('month-select').value;

    // Combine the year and month to a date string or as needed
    //var selectedDate = `${selectedYear}-${selectedMonth}`;

    // Now you can use selectedDate to filter your data or update your graph/chart
    updateFilters(selectedYear, selectedMonth, radioCause);
    setSliderValue(selectedYear, selectedMonth)
});

//event listener for radio buttons
document.getElementById('filter-form').addEventListener('change', function() {
    var selectedOption = getElementById('filter-form').value;

    var update = {
        transforms: [{
            type: 'filter',
            target: 'y',
            operation: '=',
            value: selectedOption
          }]
    }; 
    // Now you can use selectedDate to filter your data or update your graph/chart
    updateFilters(selectedOption);
});



function updateGraphAndChart(date) {
    // Implement the logic to update your graph and chart based on the selected date

}








