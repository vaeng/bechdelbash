var bechdelchart;
var labeltext0 = "Movies with less than two [named] women";
var labeltext1 = "More than one [named] women";
var labeltext2 = "Who talk to each other";
var labeltext3 = "About something besides a man";
var url =""; // url to the image for sharing

/*
1. It has to have at least two [named] women in it
2. Who talk to each other
3. About something besides a man*/

function update_chart(method) {
    var category1 = document.getElementById('leftcategory').value;
    var filterterm1 = document.getElementById('leftfilterterm').value;
    var category2 = document.getElementById('rightcategory').value;
    var filterterm2 = document.getElementById('rightfilterterm').value;
    var data1 = null;
    var data2 = null;

    url1 = '/api/' + method + '?category=' + category1 + '&filterterm=' + filterterm1;
    url2 = '/api/' + method + '?category=' + category2 + '&filterterm=' + filterterm2;
    fetch(url1)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            data1 = data;
            return fetch(url2);
            })
        .then((resp) => resp.json())
        .then(function(data) {
            data2 = data;

            var scaleheight = 320;
            if(method === "getTotalScore") {

            } else if (method === "getDecadeScores") {
                scaleheight += Math.max(Object.keys(data1.decades).length, Object.keys(data2.decades).length )*100;
            } else if (method === "getYearlyScores") {
               scaleheight += Math.max(Object.keys(data1.years).length, Object.keys(data2.years).length )*100;
            }
            $('#graph-container').css("height", scaleheight + "px");


            var ctx = document.getElementById("graph");

            // destroy old chart
            bechdelchart && bechdelchart.destroy();

            // create new
            bechdelchart = new Chart(ctx, generateChart(data1, data2));
            });
}

// will give the cart options and data points
function generateChart(data1, data2) {
    var barOptions_stacked = {
        plugins: {
            stacked100: { enable: true, replaceTooltipLabel: false },

            datalabels: {
						color: 'white',
						display: function(context) {
							return context.dataset.data[context.dataIndex] > 0;},
						font: {
							weight: 'bold'
						},
						formatter: (_value, context) => {
                          const data = context.chart.data;
                          const { datasetIndex, dataIndex } = context;
                          return `${data.calculatedData[datasetIndex][dataIndex]}% (${data.originalData[datasetIndex][dataIndex]})`;
                        }
					}
        },
        scales: {
            yAxes: [{
                maxBarThickness: 100,
                    }]},

        responsive: true,
        maintainAspectRatio: false, // to be able to scale with scaleheight in update_chart()

        tooltips: false,

        legend: {
            display : true,
            position : 'top',
            onClick: function(event, legendItem) {}, // disables the onclick behaviour

            labels: {
                filter: function(legendItem, data) { // do not show labels without data
                    if(!legendItem.text){
                        return false;
                    }
                    return true;
                },
            },
        },
        animation : {
            onComplete: generateImage // calls function generateImage() {} at end to save the image
            },

        title: {
          display : true,
          text : [data1.filterTerm + " vs. " + data2.filterTerm, parseFloat(Math.round(data1.totalAverage * 100) / 100).toFixed(3) + " - " + parseFloat(Math.round(data2.totalAverage * 100) / 100).toFixed(3)],
          fontSize : 20,
        },
    };

    var dataObject = {
        type: 'horizontalBar',
        data: generateData(data1, data2),
        options: barOptions_stacked
    };
    return dataObject;
}

//will generate image code
function generateImage(){
   // url=bechdelchart.toBase64Image();
}



// will generate the data for the chart from the sql call
function generateData(jsondata1, jsondata2) {

    labels = ["all time"];
    name1 = jsondata1.filterTerm;
    name2 = jsondata2.filterTerm;
    data1_0 = [jsondata1.totalRatingOf0];
    data1_1 = [jsondata1.totalRatingOf1];
    data1_2 = [jsondata1.totalRatingOf2];
    data1_3 = [jsondata1.totalRatingOf3];
    data2_0 = [jsondata2.totalRatingOf0];
    data2_1 = [jsondata2.totalRatingOf1];
    data2_2 = [jsondata2.totalRatingOf2];
    data2_3 = [jsondata2.totalRatingOf3];

    if (jsondata1.method != "getTotalScore") {
        if (jsondata1.method === "getDecadeScores") {
            sorter = "decades";
        } else if (jsondata1.method === "getYearlyScores") {
            sorter = "years";
        }

        var combinedDataPoints = {};

        Object.keys(jsondata1[sorter]).forEach(function(key, index) {
            combinedDataPoints[key] = {};
            combinedDataPoints[key]["data1_score0"] = jsondata1[sorter][key]["totalRatingOf0"];
            combinedDataPoints[key]["data1_score1"] = jsondata1[sorter][key]["totalRatingOf1"];
            combinedDataPoints[key]["data1_score2"] = jsondata1[sorter][key]["totalRatingOf2"];
            combinedDataPoints[key]["data1_score3"] = jsondata1[sorter][key]["totalRatingOf3"];
        });

        Object.keys(jsondata2[sorter]).forEach(function(key, index) {
            if(!combinedDataPoints[key]) {
                combinedDataPoints[key] = {};
            }
            combinedDataPoints[key]["data2_score0"] = jsondata2[sorter][key]["totalRatingOf0"];
            combinedDataPoints[key]["data2_score1"] = jsondata2[sorter][key]["totalRatingOf1"];
            combinedDataPoints[key]["data2_score2"] = jsondata2[sorter][key]["totalRatingOf2"];
            combinedDataPoints[key]["data2_score3"] = jsondata2[sorter][key]["totalRatingOf3"];
        });

        Object.keys(combinedDataPoints).forEach(function(key, index) {
            labels.push(key);
            if(! combinedDataPoints[key]["data1_score0"]) {
                data1_0.push(0);
            } else {
                data1_0.push(combinedDataPoints[key]["data1_score0"]);
            }

            if(! combinedDataPoints[key]["data1_score1"]) {
                data1_1.push(0);
            } else {
                data1_1.push(combinedDataPoints[key]["data1_score1"]);
            }

            if(! combinedDataPoints[key]["data1_score2"]) {
                data1_2.push(0);
            } else {
                data1_2.push(combinedDataPoints[key]["data1_score2"]);
            }

            if(! combinedDataPoints[key]["data1_score3"]) {
                data1_3.push(0);
            } else {
                data1_3.push(combinedDataPoints[key]["data1_score3"]);
            }
            if(! combinedDataPoints[key]["data2_score0"]) {
                data2_0.push(0);
            } else {
                data2_0.push(combinedDataPoints[key]["data2_score0"]);
            }

            if(! combinedDataPoints[key]["data2_score1"]) {
                data2_1.push(0);
            } else {
                data2_1.push(combinedDataPoints[key]["data2_score1"]);
            }

            if(! combinedDataPoints[key]["data2_score2"]) {
                data2_2.push(0);
            } else {
                data2_2.push(combinedDataPoints[key]["data2_score2"]);
            }

            if(! combinedDataPoints[key]["data2_score3"]) {
                data2_3.push(0);
            } else {
                data2_3.push(combinedDataPoints[key]["data2_score3"]);
            }
        });

    }


    var datasets = [{
        label: labeltext0,
        data: data1_0,
        stack: "Stack 0",
        backgroundColor: "rgb(255, 99, 71)",
        hoverBackgroundColor: "rgb(255, 99, 71)"
    }, {
        label: labeltext1,
        data: data1_1,
        stack: "Stack 0",
        backgroundColor: "rgb(255, 165, 0)",
        hoverBackgroundColor: "rgb(255, 165, 0)"
    }, {
        label: labeltext2,
        data: data1_2,
        stack: "Stack 0",
        backgroundColor: "rgb(30, 144, 255)",
        hoverBackgroundColor: "rgb(30, 144, 255)"
    }, {
        label: labeltext3,
        data: data1_3,
        stack: "Stack 0",
        backgroundColor: "rgb(60, 179, 113)",
        hoverBackgroundColor: "rgb(60, 179, 113)"
    }, {
        data: data2_0,
        stack: "Stack 1",
        backgroundColor: "rgb(255, 147, 128)",
        hoverBackgroundColor: "rgb(255, 147, 128)"
    }, {
        data: data2_1,
        stack: "Stack 1",
        backgroundColor: "rgb(255, 193, 77)",
        hoverBackgroundColor: "rgb(255, 193, 77)"
    }, {
        data: data2_2,
        stack: "Stack 1",
        backgroundColor: "rgb(77, 166, 255)",
        hoverBackgroundColor: "rgb(77, 166, 255)"
    }, {
        data: data2_3,
        stack: "Stack 1",
        backgroundColor: "rgb(102, 204, 148)",
        hoverBackgroundColor: "rgb(102, 204, 148)"
    }];

    generatedData = {
        labels: labels,
        datasets: datasets
    };

    return generatedData;
}