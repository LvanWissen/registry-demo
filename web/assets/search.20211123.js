var sparqlPrefixes = "PREFIX dcat: <http://www.w3.org/ns/dcat#>\nPREFIX dct: <http://purl.org/dc/terms/>\n\n";
var sparqlStart = "SELECT DISTINCT ?dataset ?title WHERE {\n  ?dataset a dcat:Dataset .\n  ?dataset dct:title ?title .\n  FILTER(LANG(?title) = \"\" || LANGMATCHES(LANG(?title), \"nl\")) \n";
var sparqlEnd = "}";
var sparqlUrl = 'https://triplestore.netwerkdigitaalerfgoed.nl/sparql?query=';
var sparqlQuery;

function updateSparql() {

  var sparqltxt = sparqlStart;
  var sparqlUnion = '';

  if (creator) {
    sparqltxt += "  ?dataset dct:creator <" + creator + "> .\n";
  }
  if (publisher) {
    sparqltxt += "  ?dataset dct:publisher <" + publisher + "> .\n";
  }

  if (formats.size > 0) {
    sparqltxt += "  ?dataset dcat:distribution ?distribution .\n";
    sparqltxt += "  ?distribution dct:format ?format .\n";
    sparqltxt += "  FILTER( ?format=\"";
    sparqltxt += Array.from(formats).join('" || ?format="');
    sparqltxt += '")\n';
  }


  searchTerm = document.getElementById("searchTerm").value.trim().toLowerCase();
  if (searchTerm) {
    if (searchIn.size > 1) {
      var sparqlUnion = "SELECT DISTINCT ?dataset ?title WHERE {{\n";
      var union = 0;
      if (searchIn.has("dct:title")) {
        sparqlUnion += sparqltxt;
        sparqlUnion += "  FILTER CONTAINS(LCASE(?title),\"" + searchTerm + "\") .\n }\n";
        union++;
      }
      if (searchIn.has("dct:description")) {
        if (union > 0) {
          sparqlUnion += "} UNION {\n";
        }
        sparqlUnion += sparqltxt
        sparqlUnion += "  ?dataset dct:description ?description .\n";
        sparqlUnion += "  FILTER CONTAINS(LCASE(?description),\"" + searchTerm + "\") .\n }\n";
        union++;
      }
      if (searchIn.has("dcat:keyword")) {
        if (union > 0) {
          sparqlUnion += "} UNION {\n";
        }
        sparqlUnion += sparqltxt
        sparqlUnion += "  ?dataset dcat:keyword ?keyword .\n";
        sparqlUnion += "  FILTER CONTAINS(LCASE(?keyword),\"" + searchTerm + "\") .\n }\n";
      }
      sparqlUnion += "}}";
      sparqltxt = '';

    } else {
      if (searchIn.has("dct:title")) {
        sparqltxt += "  FILTER CONTAINS(LCASE(?title),\"" + searchTerm + "\") .\n";
      }
      if (searchIn.has("dct:description")) {
        sparqltxt += "  ?dataset dct:description ?description .\n";
        sparqltxt += "  FILTER CONTAINS(LCASE(?description),\"" + searchTerm + "\") .\n";
      }
      if (searchIn.has("dcat:keyword")) {
        sparqltxt += "  ?dataset dcat:keyword ?keyword .\n";
        sparqltxt += "  FILTER CONTAINS(LCASE(?keyword),\"" + searchTerm + "\") .\n";
      }
      sparqltxt += sparqlEnd;
    }
  } else {
    sparqltxt += sparqlEnd;
  }

  sparqlQuery = sparqlPrefixes + sparqltxt + sparqlUnion;

  document.getElementById('sparql-query').innerHTML = sparqlQuery;

  toHash();
}

function set_creator(value) {
  creator = value;
  publisher = "";
  document.getElementById('publisher_list').options[0].selected = true;
}

function set_publisher(value) {
  creator = "";
  document.getElementById('creator_list').options[0].selected = true;
  publisher = value;
}

function set_choice(name, value, checked) {
  switch (name) {
    case 'format[]':
      if (checked) {
        formats.add(value);
      } else {
        formats.delete(value);
      }
      break;
    case 'searchIn[]':
      if (checked) {
        searchIn.add(value);
      } else {
        searchIn.delete(value);
      }
      break;
  }
  updateSparql();
}

function getDatasetDescription(uri) {

  var table = document.getElementById("props-" + uri);

  if (table.innerHTML == "") {

    var sparlDataset = "SELECT * FROM <" + uri + "> WHERE { ?s ?p ?o }";

    var url = 'https://triplestore.netwerkdigitaalerfgoed.nl/repositories/registry?query=' + encodeURIComponent(sparlDataset);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Accept", "application/json");

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          showDataset(uri, JSON.parse(xhr.responseText));
        } else {
          console.log("Call to triplestore got HTTP code " + xhr.status);
        }
      }
    };

    xhr.send();
  } else {
    table.className = "";
    table.innerHTML = "";
  }
}


function showDataset(uri, sparqlresult) {

  var table = document.getElementById("props-" + uri);
  table.className = "props";

  var strTable = "<tr><th>URI</th><td colspan=2><a target=\"_blank\" href=\"" + uri + "\">" + uri + "</a></td></tr>";

  for (var prop in sparqlresult.results.bindings) {
    subject_value = sparqlresult.results.bindings[prop].s.value;
    property_value = sparqlresult.results.bindings[prop].p.value;
    object_value = sparqlresult.results.bindings[prop].o.value;

    if (subject_value == uri && property_value != "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {

      if (isValidHttpUrl(object_value)) {
        strTable += "<tr><th>" + prefix(property_value) + "</th><td colspan=2><a target=\"_blank\" href=\"" + object_value + "\">" + object_value + "</a></td></tr>";
      } else {
        strTable += "<tr><th>" + prefix(property_value) + "</th><td colspan=2>" + object_value + "</td></tr>";
      }
      if ((property_value == "http://www.w3.org/ns/dcat#distribution") ||
        (property_value == "http://purl.org/dc/terms/creator") ||
        (property_value == "http://purl.org/dc/terms/publisher")) {
        for (var prop in sparqlresult.results.bindings) {
          sub_subject_value = sparqlresult.results.bindings[prop].s.value;
          sub_property_value = sparqlresult.results.bindings[prop].p.value;
          sub_object_value = sparqlresult.results.bindings[prop].o.value;

          if (sub_subject_value == object_value && sub_property_value != "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
            if (isValidHttpUrl(sub_object_value)) {
              strTable += "<tr><td></td><th>" + prefix(sub_property_value) + "</th><td><a target=\"_blank\" href=\"" + sub_object_value + "\">" + sub_object_value + "</a></td></tr>";
            } else {
              strTable += "<tr><td></td><th>" + prefix(sub_property_value) + "</th><td>" + sub_object_value + "</td></tr>";
            }
          }
        }
      }
    }
  }

  table.innerHTML = strTable;
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function prefix(str) {
  pre = str.replace("http://schema.org/", "");
  pre = pre.replace("https://schema.org/", "");
  pre = pre.replace("http://www.w3.org/1999/02/22-rdf-syntax-ns#", "");
  pre = pre.replace("http://www.w3.org/ns/dcat#", "");
  pre = pre.replace("http://purl.org/dc/terms/", "");
  pre = pre.replace("http://xmlns.com/foaf/0.1/", "");

  alt = str.replace("http://schema.org/", "schema:");
  alt = alt.replace("https://schema.org/", "schema:");
  alt = alt.replace("http://www.w3.org/1999/02/22-rdf-syntax-ns#", "rdf:");
  alt = alt.replace("http://www.w3.org/ns/dcat#", "dcat:");
  alt = alt.replace("http://purl.org/dc/terms/", "dct:");
  alt = alt.replace("http://xmlns.com/foaf/0.1/", "foaf:");

  return "<strong title=\"" + alt + "\">" + pre.charAt(0).toUpperCase() + pre.slice(1) + "</strong>";
}

function searchTriplestore() {
  updateSparql();
  var url = sparqlUrl + encodeURIComponent(sparqlQuery);
  window.open(url, 'triplestore').focus();
  return false;
}

function searchDatasets() {
  updateSparql();

  document.getElementById("searchresults").style.display = "none";

  var url = 'https://triplestore.netwerkdigitaalerfgoed.nl/repositories/registry?query=' + encodeURIComponent(sparqlQuery);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.setRequestHeader("Accept", "application/json");

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        showDatasets(JSON.parse(xhr.responseText));
      } else {
        console.log("Call to triplestore got HTTP code " + xhr.status);
      }
    }
  };

  xhr.send();
}

function showDatasets(sparqlresult) {

  document.getElementById("countdatasets").innerHTML = sparqlresult.results.bindings.length;
  document.getElementById("searchresults").style.display = "block";
//location.href = "#searchresults";
  document.getElementById("sparql").scrollIntoView();

  var ul = document.getElementById("datasets");
  ul.innerHTML = "";

  for (var prop in sparqlresult.results.bindings) {
    dataset = sparqlresult.results.bindings[prop].dataset.value;
    title = sparqlresult.results.bindings[prop].title.value;

    var li = document.createElement("li");
    li.setAttribute("id", dataset);
    li.setAttribute("class", "linkprop");

    var span = document.createElement("span");
    span.appendChild(document.createTextNode(title));
    li.appendChild(span);

    var div = document.createElement("div");
    div.setAttribute("class", "scroll");
	li.appendChild(div);
 
    var eul = document.createElement("table");
    eul.setAttribute("id", "props-" + dataset);
    div.appendChild(eul);

    li.addEventListener('click', function() {
      getDatasetDescription(this.id);
    });

    ul.appendChild(li);
  }
}

function set_lod_choices() {
  choices = document.getElementsByClassName('choice');
  for (i = 0; i < choices.length; i++) {
    if (choices[i].name == "format[]") {
      if (["application/ld+json", "application/n-quads", "application/n-triples", "application/rdf+xml", "application/sparql-query", "application/trig", "application/turtle", "application/vnd.hdt", "text/turtle", "text/n3"].includes(choices[i].value)) {
        choices[i].checked = true;
        formats.add(choices[i].value);
      } else {
        choices[i].checked = false;
        formats.delete(choices[i].value);
      }
    }
  }
  updateSparql();
  return false;
}

function clear_formats() {
  choices = document.getElementsByClassName('choice');
  for (i = 0; i < choices.length; i++) {
    if (choices[i].name == "format[]") {
      choices[i].checked = false;
      formats.delete(choices[i].value);
    }
  }
  return false;
}

function toHash() {
	var searchData={};

	if (creator) {
		searchData.c=creator;
	}
	if (publisher) {
		searchData.p=publisher;
	}
	if (formats.size > 0) {
		searchData.f=Array.from(formats);
	}
	searchData.t=document.getElementById("searchTerm").value.trim().toLowerCase();
    searchData.i=Array.from(searchIn);

	history.pushState({}, "", "#"+btoa(JSON.stringify(searchData)));
}

function fromHash() {

	var hash = new URL(document.URL).hash.substring(1);

	if (hash.length>0) {
		try {
			var searchData=JSON.parse(atob(hash));
			if (searchData.c) {
				creator=searchData.c;
				document.getElementById("creator_list").value=creator;
			}
			if (searchData.p) {
				publisher=searchData.p;
				document.getElementById("publisher_list").value=publisher;
			}
			
			searchIn=new Set(searchData.i);
			document.getElementById("dct_title").checked=searchData.i.includes("dct:title");
			document.getElementById("dct_description").checked=searchData.i.includes("dct:description");
			document.getElementById("dcat_keyword").checked=searchData.i.includes("dcat:keyword");		  
			document.getElementById("searchTerm").value=searchData.t;

			if (searchData.f) {
				formats=new Set(searchData.f);		
				formatChoices=document.getElementsByClassName("choice");
				Array.prototype.forEach.call(formatChoices, function(el) {
					el.checked=searchData.f.includes(el.value);
				});
			}
			searchDatasets();
		} catch (e) {
			console.log(e);
			return false;
		}
	} else {
		updateSparql();		
	}
}

var bSearch=0;
var creator = '';
if (document.getElementById('creator_list').selectedIndex>0) { 
	creator=document.getElementById('creator_list').options[document.getElementById('creator_list').selectedIndex].value; 
	bSearch=1;
}
var publisher = '';
if (document.getElementById('publisher_list').selectedIndex>0) { 
	publisher=document.getElementById('publisher_list').options[document.getElementById('publisher_list').selectedIndex].value; 
	bSearch=1;
}
var formats = new Set();
var searchIn = new Set(["dct:title"]);

if (bSearch) {
	 searchDatasets();
} else {
	fromHash();
}

document.getElementById('creator_list').addEventListener('change', function() {
  set_creator(this.value);
  updateSparql();
});

document.getElementById('publisher_list').addEventListener('change', function() {
  set_publisher(this.value);
  updateSparql();
});

document.getElementById('sparql-query').addEventListener(
  "click",
  function(event) {

    if (!navigator.clipboard) {
      // Clipboard API not available
      return;
    }
    const text = document.getElementById('sparql-query').innerHTML;
    try {
      navigator.clipboard.writeText(text);
      document.getElementById("copy-status").innerText = "De SPARQL is gekopieerd.";
      setTimeout(function() {
        document.getElementById("copy-status").innerText = "Klik de SPARQL om deze te kopieren.";
      }, 1200);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  },
  false
);

choices = document.getElementsByClassName('choice');
for (i = 0; i < choices.length; i++) {
  choices[i].addEventListener('click', function(a) {
    set_choice(this.name, this.value, this.checked);
    updateSparql();
  });
}
