var category1, category2, filterterm1, filterterm2

$('#form1').on('typeahead:selected', function(evt, item) {
    category1 = item.category;
    filterterm1 = item.value;
    if(category1 && category2 && filterterm1 && filterterm2) {
      $( "#totalbutton" ).prop( "disabled", false );
      $( "#yearlybutton" ).prop( "disabled", false );
      $( "#decadesbutton" ).prop( "disabled", false );
    } else {
      $( "#totalbutton" ).prop( "disabled", true );
      $( "#yearlybutton" ).prop( "disabled", true );
      $( "#decadesbutton" ).prop( "disabled", true );
    }
});

$('#form2').on('typeahead:selected', function(evt, item) {
    category2 = item.category;
    filterterm2 = item.value;
    if(category1 && category2 && filterterm1 && filterterm2) {
      $( "#totalbutton" ).prop( "disabled", false );
      $( "#yearlybutton" ).prop( "disabled", false );
      $( "#decadesbutton" ).prop( "disabled", false );
    } else {
      $( "#totalbutton" ).prop( "disabled", true );
      $( "#yearlybutton" ).prop( "disabled", true );
      $( "#decadesbutton" ).prop( "disabled", true );
    }
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
    filter: function(data){
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
    filter: function(data){
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
    filter: function(data){
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
    filter: function(data){
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
    filter: function(data){
      return bloodhoundfilter(data);
    }
  }
});

// Instantiate the Typeahead UI on form 1
$('#form1').typeahead({
  hint: true,
  minLength: 2,
},
{
  name: "genres",
  source: genres,
  displayKey: 'value',
  limit: suggestionlimit,
  templates: {
    header: function(data){
      return typeaheadHeader(data);
      },
    pending: function(data) {
      return typeaheadPending(data);
      },
    notFound: function () {return "";}
  }
},{
  name: "country",
  source: country,
  displayKey: 'value',
  templates: {
    header: function(data){
      return typeaheadHeader(data);
      },
    pending: function(data) {
      return typeaheadPending(data);
      },
    notFound: function () {return "";}
  }
},{
  name: "castmember",
  source: castmember,
  displayKey: 'value',
  templates: {
    header: function(data){
      return typeaheadHeader(data);
      },
    pending: function(data) {
      return typeaheadPending(data);
      },
    notFound: function () {return "";}
  }
  },{
  name: "writers",
  source: writers,
  displayKey: 'value',
  templates: {
    header: function(data){
      return typeaheadHeader(data);
      },
    pending: function(data) {
      return typeaheadPending(data);
      },
    notFound: function () {return "";}
  }
},{
  name: "directors",
  source: directors,
  displayKey: 'value',
  templates: {
    header: function(data){
      return typeaheadHeader(data);
      },
    pending: function(data) {
      return typeaheadPending(data);
      },
    notFound: function () {return "";}
  }
});

$('#form2').typeahead({
  minLength: 2,
},
{
  name: "genres",
  source: genres,
  displayKey: 'value',
  limit: suggestionlimit,
  templates: {
    header: function(data){
      return typeaheadHeader(data);
      },
    pending: function(data) {
      return typeaheadPending(data);
      },
    notFound: function () {return "";}
  }
},{
  name: "country",
  source: country,
  displayKey: 'value',
  templates: {
    header: function(data){
      return typeaheadHeader(data);
      },
    pending: function(data) {
      return typeaheadPending(data);
      },
    notFound: function () {return "";}
  }
},{
  name: "castmember",
  source: castmember,
  displayKey: 'value',
  templates: {
    header: function(data){
      return typeaheadHeader(data);
      },
    pending: function(data) {
      return typeaheadPending(data);
      },
    notFound: function () {return "";}
  }
  },{
  name: "writers",
  source: writers,
  displayKey: 'value',
  templates: {
    header: function(data){
      return typeaheadHeader(data);
      },
    pending: function(data) {
      return typeaheadPending(data);
      },
    notFound: function () {return "";}
  }
},{
  name: "directors",
  source: directors,
  displayKey: 'value',
  templates: {
    header: function(data){
      return typeaheadHeader(data);
      },
    pending: function(data) {
      return typeaheadPending(data);
      },
    notFound: function () {return "";}
  }
});


function typeaheadHeader(data){
  var headline;
  if (data.suggestions[0].category == "castmember"){
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


function typeaheadPending(data){
  return '<div class="tt-suggestion">Searching for <em>' + data.query + '</em> in ' + data.dataset + '&hellip;</div>';
}


function bloodhoundfilter(data){
  return $.map(data.results, function(item){
    return {'value' : item, 'category' : data.category, 'totalresults' : data.totalresults};
  });
}


// from https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}