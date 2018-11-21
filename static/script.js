var bechdelchart;

function update_chart(method){
	var category1 = document.getElementById('leftcategory').value;
	var filterterm1 = document.getElementById('leftfilterterm').value;
	var category2 = document.getElementById('rightcategory').value;
	var filterterm2 = document.getElementById('rightfilterterm').value;
	var data1 = null;
	var data2 = null;
	$.ajax({
        url : '/api/' + method + '?category=' + category1 + '&filterterm=' + filterterm1,
        type : "get",
        async: false,
        success : function(data) {
           data1 = data;
        },
        error: function() {
           connectionError();
        }
    });
    $.ajax({
        url : '/api/' + method + '?category=' + category2 + '&filterterm=' + filterterm2,
        type : "get",
        async: false,
        success : function(data) {
           data2 = data;
        },
        error: function() {
           connectionError();
        }
    });
    var ctx = document.getElementById("graph");

    // destroy old chart
    bechdelchart && bechdelchart.destroy();

    // create new
        bechdelchart = new Chart(ctx, {
        type: 'horizontalBar',
        data: generateData(data1, data2),
        options: barOptions_stacked
    });
}

var barOptions_stacked = {
    plugins: {
      stacked100: { enable: true }
    },
    scales: {
                xAxes: [{
                    maxBarThickness: 100
                }]
    }
};

function generateData(jsondata1, jsondata2){

labels = ["all"];
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

    Object.keys(jsondata1[sorter]).forEach(function(key,index) {
        labels.push(key);
        data1_0.push(jsondata1[sorter][key]["totalRatingOf0"]);
        data1_1.push(jsondata1[sorter][key]["totalRatingOf1"]);
        data1_2.push(jsondata1[sorter][key]["totalRatingOf2"]);
        data1_3.push(jsondata1[sorter][key]["totalRatingOf3"]);
    });

    Object.keys(jsondata2[sorter]).forEach(function(key,index) {
        if (labels.indexOf(key) === -1){
            labels.push(key);
        }
        data2_0.push(jsondata2[sorter][key]["totalRatingOf0"]);
        data2_1.push(jsondata2[sorter][key]["totalRatingOf1"]);
        data2_2.push(jsondata2[sorter][key]["totalRatingOf2"]);
        data2_3.push(jsondata2[sorter][key]["totalRatingOf3"]);
    });
}

var datasets = [{
        label: name1 + ": 0",
        data: data1_0,
        stack: "Stack 0",
        backgroundColor: "rgb(255, 99, 71)",
        hoverBackgroundColor: "rgb(255, 99, 71)"
    },{
        label: name1 + ": 1",
        data: data1_1,
        stack: "Stack 0",
        backgroundColor: "rgb(255, 165, 0)",
        hoverBackgroundColor: "rgb(255, 165, 0)"
    },{
        label: name1 + ": 2",
        data: data1_2,
        stack: "Stack 0",
        backgroundColor: "rgb(30, 144, 255)",
        hoverBackgroundColor: "rgb(30, 144, 255)"
    },{
        label: name1 + ": 3",
        data: data1_3,
        stack: "Stack 0",
        backgroundColor: "rgb(60, 179, 113)",
        hoverBackgroundColor: "rgb(60, 179, 113)"
    },{
        label: name2 + ": 0",
        data: data2_0,
        stack: "Stack 1",
        backgroundColor: "rgb(255, 147, 128)",
        hoverBackgroundColor: "rgb(255, 147, 128)"
    },{
        label: name2 + ": 1",
        data: data2_1,
        stack: "Stack 1",
        backgroundColor: "rgb(255, 193, 77)",
        hoverBackgroundColor: "rgb(255, 193, 77)"
    },{
        label: name2 + ": 2",
        data: data2_2,
        stack: "Stack 1",
        backgroundColor: "rgb(77, 166, 255)",
        hoverBackgroundColor: "rgb(77, 166, 255)"
    },{
        label: name2 + ": 3",
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