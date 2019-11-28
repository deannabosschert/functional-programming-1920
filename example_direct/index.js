  // Prepare our physical space for d3
  // prepare_HTML_space()
  // function prepare_HTML_space() {
    let Width = 600
    let Height = 400
    let g = d3.select('svg').attr('width', Width).attr('height', Height).select('g')
  // }
  // import data from api and return values
  sparQL_queries()
  function sparQL_queries() {
       const endpoint = 'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-19/sparql';
       const query_IDs = `
         PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
         PREFIX dc: <http://purl.org/dc/elements/1.1/>
         PREFIX dct: <http://purl.org/dc/terms/>
         PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
         PREFIX edm: <http://www.europeana.eu/schemas/edm/>
         PREFIX foaf: <http://xmlns.com/foaf/0.1/>
         SELECT ?id ?parentId
         WHERE {
               # er wordt van boven naar beneden gewerkt in de hiërarchie
               # geef de categorieën onder wapens en munitie; dit zijn alle parentlabels
               <https://hdl.handle.net/20.500.11840/termmaster12435> skos:narrower* ?cat .
               ?cat skos:prefLabel ?id .
               # geef de term (de "broader term") die daarboven staat in de thesaurus; dit is je 'hoofdterm' nu
               ?cat skos:broader ?catParent .
               ?catParent skos:prefLabel ?parentId .
             }
             GROUP BY ?id ?parentId
             ORDER BY ASC(?id)     `
        const query_aantallen = `
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX dc: <http://purl.org/dc/elements/1.1/>
          PREFIX dct: <http://purl.org/dc/terms/>
          PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
          PREFIX edm: <http://www.europeana.eu/schemas/edm/>
          PREFIX foaf: <http://xmlns.com/foaf/0.1/>
          SELECT ?catid (COUNT(?cho) AS ?size)
          WHERE {
           # er wordt van boven naar beneden gewerkt in de hiërarchie
           # geef de categorieën onder wapens en munitie; dit zijn alle parentlabels
           <https://hdl.handle.net/20.500.11840/termmaster12435> skos:narrower* ?cat .
           ?cat skos:prefLabel ?catid .
          # geef de term (de "narrower term") die daaronder staat in de thesaurus; dit is je 'hoofdterm' nu
           ?cat skos:broader ?catParent .
           ?catParent skos:prefLabel ?parentId .
          # geef het aantal daadwerkelijke [fysieke] objecten met dit label
          # probleem; rekent niet ook alle objecten in zijn sublabels mee
           OPTIONAL {
            ?cho edm:object ?cat .
           }
          }
          GROUP BY ?catid
          ORDER BY ASC(?catid)
          `
    let promise1 = loadData1(endpoint, query_IDs)
    let promise2 = loadData2(endpoint, query_aantallen)
    Promise.all([promise1, promise2]).then(function(bothArrays){
      dataToArray(bothArrays)
    })
  }

// https://beta.vizhub.com/Razpudding/2b231e4f093b411bbb259115019e02ea?edit=files&file=index.js
// parse api data of id+parentid columns as json, then convert in own array with d3.json
function loadData1(endpoint, query_IDs){
  const querySource_ID = endpoint + '?query=' + encodeURIComponent(query_IDs) + '&format=json'
  return d3.json(querySource_ID).then(function(data){
    return data.results.bindings
    // loadData2(data1)
  })
}
// parse api data of id+size columns as json, then convert in own array with d3.json
function loadData2(endpoint, query_aantallen){
  const querySource_size = endpoint + '?query=' + encodeURIComponent(query_aantallen) + '&format=json'
  return d3.json(querySource_size).then(function(data){
    return data.results.bindings
  })
}



// merge data of all columns in one array
function dataToArray(bothArrays){
  // data1.forEach(id => console.log(id));
  const firstArray_v1 = bothArrays.slice(0,1)
  const secondArray_v1 = bothArrays.slice(1)

  const firstArray_v2 = (flattenArray(firstArray_v1))
  const secondArray_v2 = (flattenArray(secondArray_v1))

  const firstArray_v3 = flattenArray(firstArray_v2)
  const secondArray_v3 = flattenArray(secondArray_v2)

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
  function flattenArray(array) {
    const result = array.flat()
    return result
  }

  const eersteArray = (prettifyArray(firstArray_v3))
  const tweedeArray = (prettifyArray(secondArray_v3))

// https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Global_Objects/Array/map
  function prettifyArray(array) {
    return array.map(item => {
      return {
        id: item.id && item.id.value,
        parentId: item.parentId && item.parentId.value,
        catid: item.catid && item.catid.value,
        size: item.size && item.size.value
      }
    })
  }



// https://stackoverflow.com/questions/17500312/is-there-some-way-i-can-join-the-contents-of-two-javascript-arrays-much-like-i/17500836#17500836
  const innerJoin = (xs, ys, sel) =>
      xs.reduce((zs, x) =>
      ys.reduce((zs, y) =>        // cartesian product - all combinations
      zs.concat(sel(x, y) || []), // filter out the rows and columns you want
      zs), [])

  const finalResult = innerJoin(eersteArray, tweedeArray,
          ({id, parentId}, {catid, size}) =>
              id === catid && {id, parentId, size})
  // console.table(finalResult)
// drawViz(finalResult)  stuur data door naar drawViz






  console.log(finalResult)
  countSizes(finalResult)
}

function countSizes(finalResult){
  // if (id == "artilleriemunitie"){
  //   console.log(finalResult)
  // }
  // node.descendants iets mee doen?
  // of nieuwe arrays 'if xx als parent, add id.size to dieparentId.size'. Werken met promises

// https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  function zoekId(array) {
      return array.id === "artilleriemunitie";
    }
  console.log(finalResult.find(zoekId)) // { id: 'artilleriemunitie', aantal: 0 }


}


// Teken visualisatie
  function drawViz(finalResult) {
    // root: 167: {id: "wapens en munitie", parentId: "Objecttrefwoord", size: "2"}
        // Declare d3 layout
        var Layout = d3.pack().size([Width, Height])
        // Layout + Data
        // hieronder pakt ie de opperste parentnode
        var Root = d3.hierarchy(finalResult).sum(function (d) {console.log(d[167]); return d[167].size})
        var Nodes = Root.descendants()
        Layout(Root)
        var Slices = g.selectAll('circle').data(Nodes).enter().append('circle')
        // Draw on screen
        Slices.attr('cx', function (d) { return d.x })
            .attr('cy', function (d) { return d.y })
            .attr('r', function (d) { return d.r })
    }
