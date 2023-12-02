let dataCache = {}; // Cache for storing loaded data

// Initial graph setup
let year = "2020";
let month  = "1";
updateGraph(year, month);
updateHeading(year, month);

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
                size: 5,
                color: getCategoryColor(feature.properties.FireCause)
            }
        };
    });

    var layout = {
        // title: `Incident Data for ${month}/${year}`,
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
        margin: {
            l: 0,  // Left margin
            r: 0,  // Right margin
            b: 0,  // Bottom margin
            t: 0,  // Top margin
            pad: 0  // Padding between plot and margins
        },
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
    console.log(fileName)
    let cacheKey = year + '_' + formattedMonth;
    if (dataCache[cacheKey]) {
        plotData(dataCache[cacheKey], year, month);
        return;
    }

    d3.json(fileName).then(function(geojsonData) {
        dataCache[cacheKey] = geojsonData;
        let filteredGeojsonData = applyFilter(geojsonData);
        plotData(filteredGeojsonData, year, month);
    }).catch(error => console.error('Error loading the GeoJSON data:', error));
}

// Event listener for date selection
document.getElementById('apply-date').addEventListener('click', function() {
    var selectedYear = document.getElementById('year-select').value;
    var selectedMonth = document.getElementById('month-select').value;

    // Now you can use selectedDate to filter your data or update your graph/chart
    updateGraph(selectedYear, selectedMonth);
    updateHeading(selectedYear, selectedMonth)
});

function updateHeading(year, month) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    var MonthName = monthNames[month - 1];
    var headingText = `Wildfires in ${MonthName}, ${year}`;
    document.getElementById('dynamic-heading').innerText = headingText;
}

document.querySelectorAll('input[name="fire-filter"]').forEach(radio => {
    radio.addEventListener('change', function() {
        var selectedYear = document.getElementById('year-select').value;
        var selectedMonth = document.getElementById('month-select').value;

        updateGraph(selectedYear, selectedMonth);
    });
});

function applyFilter(geojsonData) {
    let selectedFilter = document.querySelector('input[name="fire-filter"]:checked').value;

    if (selectedFilter === 'both') {
        return geojsonData; // Return all data if 'Both' is selected
    }

    // Filter the data based on the selected filter ('Human' or 'Natural')
    let filteredData = geojsonData.features.filter(feature => feature.properties.FireCause === selectedFilter);

    // Create a new GeoJSON object with filtered features
    return {
        ...geojsonData,
        features: filteredData
    };
}
