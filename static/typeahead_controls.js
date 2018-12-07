var category1, category2, filterterm1, filterterm2


// category select dropdown marking, button text and variable change:
function change_cat(newcategory, position) {
    var buttontext = "";
    // deactivate all dropdown menue items
    $("#top_select_genres").removeClass("active");
    $("#top_select_country").removeClass("active");
    $("#top_select_castmember").removeClass("active");
    $("#top_select_writers").removeClass("active");
    $("#top_select_directors").removeClass("active");
    $("#top_select_title").removeClass("active");
    $("#bottom_select_genres").removeClass("active");
    $("#bottom_select_country").removeClass("active");
    $("#bottom_select_castmember").removeClass("active");
    $("#bottom_select_writers").removeClass("active");
    $("#bottom_select_directors").removeClass("active");
    $("#bottom_select_title").removeClass("active");

    if (newcategory == "country") {
        buttontext = "as country";
    } else if (newcategory == "genres") {
        buttontext = "as genre";
    } else if (newcategory == "writers") {
        buttontext = "as writer";
    } else if (newcategory == "castmember") {
        buttontext = "as cast";
    } else if (newcategory == "directors") {
        buttontext = "as director";
    } else if (newcategory == "title") {
        buttontext = "as title";
    }
    // make the corresponding button active
    var button_id = '#' + position + "_select_" + newcategory;
    $(button_id).addClass("active");
    if (position == "top") {
        category1 = newcategory;
        $("#top_cat_selector").html(buttontext);
    } else if (position == "bottom") {
        category2 = newcategory;
        $("#bottom_cat_selector").html(buttontext);
    }
}



// changes the internal terms after selection
$('#form1').on('typeahead:select', function(evt, item) {
    // console.log("selected form 1 new filterterm1: " + item.value);
    change_cat(item.category, "top");
    filterterm1 = item.value;
});

$('#form2').on('typeahead:select', function(evt, item) {
    // console.log("selected form 2 new filterterm2: " + item.value);
    change_cat(item.category, "bottom");
    filterterm2 = item.value;
});


// changes the internal variables after losing focus
$('#form1').on('typeahead:change ', function(evt, item) {
    // console.log("changed form 1 new filterterm1: " + item);
    filterterm1 = item;
});

$('#form2').on('typeahead:change ', function(evt, item) {
    // console.log("changed form 2 new filterterm2: " + item);
    filterterm2 = item;
});

// is used in the bloodhound objects to reduce amounts of items loaded. 5 is standard for display amount in typeahead
var suggestionlimit = 5;

// Instantiate the Bloodhound suggestion engine
var genres = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        wildcard: '%QUERY',
        url: '../search/genres/%QUERY/' + suggestionlimit,
        filter: function(data) {
            return bloodhoundfilter(data);
        }
    }
});

var country = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        wildcard: '%QUERY',
        url: '../search/country/%QUERY/' + suggestionlimit,
        filter: function(data) {
            return bloodhoundfilter(data);
        }
    }
});
var castmember = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        wildcard: '%QUERY',
        url: '../search/castmember/%QUERY/' + suggestionlimit,
        filter: function(data) {
            return bloodhoundfilter(data);
        }
    }
});
var writers = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        wildcard: '%QUERY',
        url: '../search/writers/%QUERY/' + suggestionlimit,
        filter: function(data) {
            return bloodhoundfilter(data);
        }
    }
});
var directors = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        wildcard: '%QUERY',
        url: '../search/directors/%QUERY/' + suggestionlimit,
        filter: function(data) {
            return bloodhoundfilter(data);
        }
    }
});

// Instantiate the Typeahead UI on form 1
$('#form1').typeahead({
    autoselect: true,
    autocomplete: true,
    minLength: 2,
}, {
    name: "genres",
    source: genres,
    displayKey: 'value',
    limit: suggestionlimit,
    templates: {
        header: function(data) {
            return typeaheadHeader(data);
        },
        pending: function(data) {
            return typeaheadPending(data);
        },
        notFound: function() {
            return "";
        }
    }
}, {
    name: "country",
    source: country,
    displayKey: 'value',
    templates: {
        header: function(data) {
            return typeaheadHeader(data);
        },
        pending: function(data) {
            return typeaheadPending(data);
        },
        notFound: function() {
            return "";
        }
    }
}, {
    name: "castmember",
    source: castmember,
    displayKey: 'value',
    templates: {
        header: function(data) {
            return typeaheadHeader(data);
        },
        pending: function(data) {
            return typeaheadPending(data);
        },
        notFound: function() {
            return "";
        }
    }
}, {
    name: "writers",
    source: writers,
    displayKey: 'value',
    templates: {
        header: function(data) {
            return typeaheadHeader(data);
        },
        pending: function(data) {
            return typeaheadPending(data);
        },
        notFound: function() {
            return "";
        }
    }
}, {
    name: "directors",
    source: directors,
    displayKey: 'value',
    templates: {
        header: function(data) {
            return typeaheadHeader(data);
        },
        pending: function(data) {
            return typeaheadPending(data);
        },
        notFound: function() {
            return "";
        }
    }
});

$('#form2').typeahead({
    minLength: 2,
    autoselect: true,
    autocomplete: true,
}, {
    name: "genres",
    source: genres,
    displayKey: 'value',
    limit: suggestionlimit,
    templates: {
        header: function(data) {
            return typeaheadHeader(data);
        },
        pending: function(data) {
            return typeaheadPending(data);
        },
        notFound: function() {
            return "";
        }
    }
}, {
    name: "country",
    source: country,
    displayKey: 'value',
    templates: {
        header: function(data) {
            return typeaheadHeader(data);
        },
        pending: function(data) {
            return typeaheadPending(data);
        },
        notFound: function() {
            return "";
        }
    }
}, {
    name: "castmember",
    source: castmember,
    displayKey: 'value',
    templates: {
        header: function(data) {
            return typeaheadHeader(data);
        },
        pending: function(data) {
            return typeaheadPending(data);
        },
        notFound: function() {
            return "";
        }
    }
}, {
    name: "writers",
    source: writers,
    displayKey: 'value',
    templates: {
        header: function(data) {
            return typeaheadHeader(data);
        },
        pending: function(data) {
            return typeaheadPending(data);
        },
        notFound: function() {
            return "";
        }
    }
}, {
    name: "directors",
    source: directors,
    displayKey: 'value',
    templates: {
        header: function(data) {
            return typeaheadHeader(data);
        },
        pending: function(data) {
            return typeaheadPending(data);
        },
        notFound: function() {
            return "";
        }
    }
});


function typeaheadHeader(data) {
    var headline;
    if (data.suggestions[0].category == "castmember") {
        headline = "Cast";
    } else {
        headline = capitalizeFirstLetter(data.suggestions[0].category);
    }
    htmlstring = ['<div class="cat-header d-flex justify-content-end">',
        '<div class="mr-auto">',
        '<h5>',
        headline,
        '</h5>',
        '</div>',
        '<div>(',
        data.suggestions.length,
        ' of ',
        data.suggestions[0].totalresults,
        ')</div>',
        '</div>'
    ].join('\n');
    return htmlstring;
}


function typeaheadPending(data) {
    return '<div class="tt-suggestion">Searching for <em>' + data.query + '</em> in ' + data.dataset + '&hellip;</div>';
}


function bloodhoundfilter(data) {
    return $.map(data.results, function(item) {
        return {
            'value': item,
            'category': data.category,
            'totalresults': data.totalresults
        };
    });
}


// from https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}