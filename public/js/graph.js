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
        var hoverText = `Incident Name: ${feature.properties.IncidentName}<br>` + 
        `Fire Size: ${feature.properties.IncidentSize} acres<br>` +
        `Fire Cause: ${feature.properties.FireCause}<br>` +
        `Fire Cause (General): ${feature.properties.FireCauseGeneral}`;

        return {
            type: 'scattergeo',
            mode: 'markers',
            text: hoverText,
            lon: [feature.geometry.coordinates[0]],
            lat: [feature.geometry.coordinates[1]],
            marker: {
                size: 5,
                color: getCategoryColor(feature.properties.FireCause)
            },
            hoverinfo: 'text',
            showlegend: false,
        };
    });

    // Dummy traces for custom legend entries
    var customLegendTraces = [
        {
            type: 'scattergeo',
            mode: 'markers',
            name: 'Human Cause',
            lon: [-180],
            lat: [90],
            marker: { size: 15, color: 'red' },
            showlegend: true
        },
        {
            type: 'scattergeo',
            mode: 'markers',
            name: 'Natural Cause',
            lon: [-180],
            lat: [90],
            marker: { size: 15, color: 'green' },
            showlegend: true,
        },
        {
            type: 'scattergeo',
            mode: 'markers',
            name: 'Unknown',
            lon: [-180],
            lat: [90],
            marker: { size: 15, color: 'grey' },
            showlegend: true,
        }
    ];

    var layout = {
        
        geo: {
            scope: 'usa',
            projection: {
                type: 'albers usa'
            },
            showland: true,
            landcolor: 'rgb(255, 249, 240)',
            bgcolor: '#899499',
        },
        showlegend: true,
        autosize: true,
        margin: {
            l: 0,
            r: 0, 
            b: 0, 
            t: 0,  
            pad: 0  
        },
        paper_bgcolor: "#899499", 
        legend: {
            font: {
                size: 18, 
                family: 'Arial, sans-serif', 
                color: 'black' 
            },
            x: .98, 
            y: 0.5, 
            xanchor: 'right', 
            yanchor: 'middle' 
        
        },
    };

    var config = {
        responsive: true,
    }

    var plotDataCombined = plotData.concat(customLegendTraces);


    Plotly.newPlot('graph', plotDataCombined, layout, config);
}


function updateGraph(year, month) {
    let formattedMonth = month.toString();
    const fileName = `/data/year_month/data_${year}_${formattedMonth}.geojson`;
    
    let cacheKey = year + '_' + formattedMonth;
    if (dataCache[cacheKey]) {
        let filteredGeojsonData = applyFilter(dataCache[cacheKey]);
        plotData(filteredGeojsonData, year, month);
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
        var selectedFilter = this.value;
        updateGraph(selectedYear, selectedMonth, selectedFilter); // Update the map
        setBarChartFilter(selectedFilter); // Update the bar chart
    });
});

document.getElementById('apply-date').addEventListener('click', function() {
    var selectedYear = document.getElementById('year-select').value;
    var selectedMonth = document.getElementById('month-select').value;
    updateGraph(selectedYear, selectedMonth);
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