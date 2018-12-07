var bechdelchart;
var labeltext0 = "Movies with less than two [named] women";
var labeltext1 = "More than one [named] woman";
var labeltext2 = "Who talk to each other";
var labeltext3 = "About something besides a man";
var imgurl =""; // url to the image for sharing
var methodused = "";

function checkParams() {
    // randomizeForms();
    var url_string = window.location.href;
    var url = new URL(url_string);
    category1 = url.searchParams.get("c1");
    category2 = url.searchParams.get("c2");
    filterterm1 = url.searchParams.get("f1");
    filterterm2 = url.searchParams.get("f2");
    var m = url.searchParams.get("m");
    var validMethods = ["getTotalScore", "getDecadeScores", "getYearlyScores"];
    if (validMethods.includes(m)) {
        if(!category1 || !category2  || !filterterm1  || !filterterm2) {
          //not enought input variables
        } else {
            var validCats = ["title", "genres", "country", "writers", "castmember", "directors"];
            if (validCats.includes(category1) && validCats.includes(category2)) {
                change_cat(category1, "top")
                change_cat(category2, "bottom")
                $('#form1').val(filterterm1);
                $('#form2').val(filterterm2);
                $( "#totalbutton" ).prop( "disabled", false );
                $( "#yearlybutton" ).prop( "disabled", false );
                $( "#decadesbutton" ).prop( "disabled", false );
                update_chart(m);
            }
        }
    }
}
// https://stackoverflow.com/questions/52603754/get-bootstraps-current-theme-colors-in-javascript
var style = getComputedStyle(document.body);
var theme = {};

theme.primary = style.getPropertyValue('--primary');
theme.secondary = style.getPropertyValue('--secondary');
theme.success = style.getPropertyValue('--success');
theme.info = style.getPropertyValue('--info');
theme.warning = style.getPropertyValue('--warning');
theme.danger = style.getPropertyValue('--danger');
theme.light = style.getPropertyValue('--light');
theme.dark = style.getPropertyValue('--dark');

var chartColor0top = theme.danger;
var chartColor1top = theme.warning;
var chartColor2top = theme.secondary;
var chartColor3top = theme.info;
var chartColor0bottom = (theme.danger).replace(')', ', 0.8)').replace('rgb', 'rgba'); //opacity 0.65  .btn.disabled, .btn:disabled {     opacity: 0.65;}
var chartColor1bottom = (theme.warning).replace(')', ', 0.8)').replace('rgb', 'rgba');
var chartColor2bottom = (theme.secondary).replace(')', ', 0.8)').replace('rgb', 'rgba');
var chartColor3bottom = (theme.info).replace(')', ', 0.8)').replace('rgb', 'rgba');


function update_chart(method) {
    // category1, category2, filterterm1, filterterm2
    if(category1 && category2 && filterterm1 && filterterm2){
        // all fine
            $('#top_cat_selector').removeClass("btn-danger");
            $('#bottom_cat_selector').removeClass("btn-danger");
            $('#form1').removeClass("is-invalid");
            $('#form2').removeClass("is-invalid");
            $('#alert_placeholder').html("");
    } else {
        $('#alert_placeholder').html('<div class="alert alert-warning alert-dismissible"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Missing data!</strong> Please check red field(s) above.</div>');
        if (!category1) {
            $('#top_cat_selector').addClass("btn-danger");
        }
        if (!category2) {
            $('#bottom_cat_selector').addClass("btn-danger");
        }
        if (!filterterm1) {
            $('#form1').addClass("is-invalid");
        }
        if (!filterterm2) {
            $('#form2').addClass("is-invalid");
        }

        return "";
    }



    var data1 = null;
    var data2 = null;
    methodused = method;

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
            chartJsPluginSubtitle: {
                display: true,
                text:	parseFloat(Math.round(data1.totalAverage * 100) / 100).toFixed(3) + " - " + parseFloat(Math.round(data2.totalAverage * 100) / 100).toFixed(3),
                fontSize: 16,

            },

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
                          return [`${data.calculatedData[datasetIndex][dataIndex]}%`,`(${data.originalData[datasetIndex][dataIndex]})`];
                        },
                        textAlign: 'center'
					}
        },
        layout: {
            padding: {
                left: 0,
                right: 0, //60 to align the 50% mark with the middle of the site, but then the title is not centered any more
                top: 0,
                bottom: 0
            },
        },
        scales: {
            yAxes: [{
                maxBarThickness: 100,
                ticks: {
                  autoSkip: false,
                  maxRotation: 45,
                  minRotation: 45
                }
                    }],
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "%",
                },
            }]
        },


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
            onComplete: generateImage, // calls function generateImage() {} at end to save the image
            },

        title: {
          display : true,
          text : data1.filterTerm + " vs. " + data2.filterTerm,
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

//will generate image code and link and refresh link
function generateImage(){
    $("#shares").removeClass('d-none'); // To show it
    imgurl=bechdelchart.toBase64Image();
    var pathname = window.location.pathname;
    var hostnamepart = "https://" + window.location.hostname + window.location.pathname;
    var parameterpart = "?m=" + methodused + "&c1=" + category1 + "&f1=" + filterterm1 + "&c2=" + category2 + "&f2=" + filterterm2;
    var linkurl = encodeURI( hostnamepart + parameterpart);
    $('#shareURL').attr("href", imgurl); // Set herf value for image and link:
    $('#shareLink').attr("href", linkurl);
    // window.history.pushState("object or string", "Title", "/new-url");
    // history.pushState(null, null, e.attr('href'));
    if(!history.pushState){
        //url update not supported
    } else {
        history.pushState(null, null, parameterpart);
    }
}



// will generate the data for the chart from the sql call
function generateData(jsondata1, jsondata2) {

    labels = ["all time: "];
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
        backgroundColor: chartColor0top,
        hoverBackgroundColor: chartColor0top
    }, {
        label: labeltext1,
        data: data1_1,
        stack: "Stack 0",
        backgroundColor: chartColor1top,
        hoverBackgroundColor: chartColor1top
    }, {
        label: labeltext2,
        data: data1_2,
        stack: "Stack 0",
        backgroundColor: chartColor2top,
        hoverBackgroundColor:chartColor2top
    }, {
        label: labeltext3,
        data: data1_3,
        stack: "Stack 0",
        backgroundColor: chartColor3top,
        hoverBackgroundColor:chartColor3top
    }, {
        data: data2_0,
        stack: "Stack 1",
        backgroundColor: chartColor0bottom,
        hoverBackgroundColor: chartColor0bottom
    }, {
        data: data2_1,
        stack: "Stack 1",
        backgroundColor: chartColor1bottom,
        hoverBackgroundColor: chartColor1bottom
    }, {
        data: data2_2,
        stack: "Stack 1",
        backgroundColor: chartColor2bottom,
        hoverBackgroundColor: chartColor2bottom
    }, {
        data: data2_3,
        stack: "Stack 1",
        backgroundColor: chartColor3bottom,
        hoverBackgroundColor: chartColor3bottom
    }];

    generatedData = {
        labels: labels,
        datasets: datasets
    };

    return generatedData;
}