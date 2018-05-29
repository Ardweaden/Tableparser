function setupNode(key_chain,value) {
   var newChild;
   for (var i = key_chain.length - 1; i >= 0; i--) {
        if (i == key_chain.length - 1) {
             newChild = {};
             newChild['name'] = key_chain[i];
             values = [];
             values.push({"name": value});
             newChild['children'] = values;
        }
        else {
             var newChildCopy = newChild;
             newChild = {};

             newChild['name'] = key_chain[i];
             newChild['children'] = [newChildCopy];
        }
   }

   return newChild
}


function addToNode(key_chain,node,node_path,value) {
   var newChild = setupNode(key_chain,value);

   var exec_str = "node";

   for (var i = 0; i < node_path.length; i++) {
        exec_str += "[" + node_path[i] + "]['children']";
   }

   try {
        eval(exec_str + ".push(newChild)");
   }
   catch(err) {
        new_exec_str = exec_str;
        new_exec_str += "=[];"
        eval(new_exec_str);
        exec_str += ".push(newChild)";
        eval(exec_str);
   }

   return node
}

function createNodePath(i,key_chain,result) {
   var node_path = [i];
   var node = result[i]['children'];
   var key_chain = key_chain.slice(1);

   var check = 0;

   for (var j = 0; j < key_chain.length; j++) {
        check = 0;
        for (var k = 0; k < node.length; k++) {
             if (key_chain[j] == node[k]['name']) {
                  node_path.push(k);
                  if (!!node[k]['children']) {
                       node = node[k]['children'];
                       check = 1;
                       break;
                  }
                  else {
                       node[k]['children'] = [];
                       check = 1;
                       break;
                  }
             }
        }
        if (!check) {
            break;
        }
   }

   return node_path
}

function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
};

function insertIntoKeychains(key_chain,key_chains,values) {
  for (var i = 0; i < key_chains.length; i++) {
    for (var j = 0; j < key_chains[i].length; j++) {
      if (j == key_chain.length) {
        key_chains.splice(i,0,key_chain);
        array_move(values,key_chains.length-1,i);

        return key_chains
      }
      if (key_chains[i][j] == key_chain[j]) {
        continue
      }
      else {
        break
      }
    }
  }
  key_chains.push(key_chain);
  return key_chains
}

function orderKeychains(keys,values,delimiter,additional_delimiter) {
  var key_chains = [];

  for (var i = 0; i < keys.length; i++) {
    if (!!additional_delimiter) {
      key_chain = keys[i].replace(additional_delimiter,delimiter).split(delimiter);
    }
    else {
      key_chain = keys[i].split(delimiter);
    }
    key_chains = insertIntoKeychains(key_chain,key_chains,values)
  }

  return key_chains
}

function removeFromData(key_chains,values,categories,subcategories) {
  for (var i = 0; i < key_chains.length; i++) {
    if (categories.includes(key_chains[i][1])) {
      key_chains.splice(i,1);
      values.splice(i,1);
      i -= 1;
    }
    else {
      for (var j = 0; j < subcategories.length; j++) {
        if (key_chains[i].includes(subcategories[j])) {
          key_chains.splice(i,1);
          values.splice(i,1);
          i -= 1;
          break
        }
      }
    }
  }
}


function parseTree(data,delimiter,additional_delimiter,categories,subcategories) {
  var result = [];

  var keys = Object.keys(data);
  var values = Object.values(data);

  var key_chains = orderKeychains(keys,values,delimiter,additional_delimiter);

  removeFromData(key_chains,values,categories,subcategories);

  // if (categories.length > 0 && subcategories.length > 0) {
  //   removeFromData(key_chains,values,categories,subcategories);
  // }

  removeFromData(key_chains,values,categories,subcategories);


  for (var i = 0; i < key_chains.length; i++) {
      key_chain = key_chains[i];
      value = values[i];

      for (var j = 0; j < result.length; j++) {
           if (result[j]['name'] == key_chain[0]){
                node_path = createNodePath(j,key_chain,result);
                result = addToNode(key_chain.slice(node_path.length),result,node_path,value);
                break;
           }
           else {
                if (j == result.length - 1) {
                     result.push(setupNode(key_chain,value));
                     break;
                }
           }
      }

      if (result.length == 0) {
           result.push(setupNode(key_chain,value));
      }
  }

  return result
}


///////tabelparser

//Generates an array from the tree (Use tableFromTreeWithColspan)
function tableFromTree(tree) {
  var tableArray = [];

  while(true){
    var row = [];
    var offspring = []

    if (tree.length == 0) {
      break
    }

    for (var i = 0; i < tree.length; i++) {
      branch = [];

      for (var j = 0; j < tree[i].length; j++) {
        branch.push(tree[i][j]['name']);

        if (!!tree[i][j]['children']){
          offspring.push(tree[i][j]['children']);
        }
        else {
          offspring.push([]);
        }
      }
      row.push(branch);
    }
    tableArray.push(row);
    tree = offspring;
  }

  return tableArray
}

//Calculates the length of a row
function rowLength(row) {
  var rowLen = 0;

  for (var i = 0; i < row.length; i++) {
    rowLen += row[i].length
  }

  return rowLen
}

//Generates a HTML string for the table from the array
function tableFromArray(array,colspanMatrix,widthMatrix){
  var tableString = "";

  var previousWidth = 100;

  for (var i = 0; i < (array.length - 1); i++) {
    var row = "";

    for (var j = 0; j < array[i].length; j++) {

      if (array[i][j].length == 0) {
        row += "<th class='empty' colspan='1' width='" + widthMatrix[i][j][0] + "%'>&nbsp;</td>";
      }

      for (var k = 0; k < array[i][j].length; k++) {

        try {
          if (!!colspanMatrix[i][j][k]) {
            colspan = colspanMatrix[i][j][k];
          }
          else {
            colspan = 1;
          }
        }
        catch (err) {
          colspan = 1;
        }

        elementIndex = j + calculateShift(array[i],j);

        if (array[i+1][elementIndex].length == 0) {
          row += "<th class='value' colspan='" + colspan + "' width='" + widthMatrix[i][j][k] + "%'>" + array[i][j][k] + "</td>";
        }
        else {
          row += "<th colspan='" + colspan + "' width='" + widthMatrix[i][j][k] + "%'>" + array[i][j][k] + "</td>";
        }
      } 

    }
    row = "<tr>" + row + "</tr>";
    tableString += row;
  }

  return tableString;
}

//Calculates how many more than 1 elements are there in all branches of a row
function calculateShift(row,j) {
  var shift = 0;
  for (var i = 0; i < j; i++) {
    if (row[i].length > 1) {
      shift += (row[i].length - 1)
    }
  }

  return shift
}

//Adds in empty elements in missing places
function rectangulateArray(array) {
  for (var i = 0; i < (array.length - 1); i++){ 

    for (var j = 0; j < array[i].length; j++) {

      if (array[i][j].length == 0) {
        shift = calculateShift(array[i],j);
        array[i+1].splice(j + shift,0,[]);
      }
    }
  }
  return array
}

//Calculates the number of leaves of a tree, which is colspan
function calculateColspan(tree,colspan){
  for (var i = 0; i < tree.length; i++) {
    if (!!tree[i]['children']) {
      colspan += calculateColspan(tree[i]['children'],0);
    }
    else {
      colspan += 1;
    }
  }
  return colspan;
}

//Converts tree to an array and generates the colspan matrix for <th> tags.
//colspanMatrix needs to be rectangulated before usage 
function tableFromTreeWithColspan(tree) {
  var tableArray = [];
  var colspanMatrix = [];

  while(true){
    var row = [];
    var colspanRow = [];
    var offspring = [];

    if (tree.length == 0) {
      break
    }

    for (var i = 0; i < tree.length; i++) {
      branch = [];
      colspanBranch = [];

      for (var j = 0; j < tree[i].length; j++) {
        branch.push(tree[i][j]['name']);
        colspanBranch.push(calculateColspan([tree[i][j]],0));

        if (!!tree[i][j]['children']){
          offspring.push(tree[i][j]['children']);
        }
        else {
          offspring.push([]);
        }
      }
      row.push(branch);
      colspanRow.push(colspanBranch);
    }
    tableArray.push(row);
    colspanMatrix.push(colspanRow);
    tree = offspring;
  }

  return [tableArray,colspanMatrix]
}


//Gets the width of index-th <th> tag
function getElementWidth(row,index) {
  var counter = 0;
  for (var i = 0; i < row.length; i++) {
    for (var j = 0; j < row[i].length; j++) {
      if (counter == index) {
        return row[i][j]
      }
      counter += 1;
    }
  }
}

//Method for creating a clone of an array
Array.prototype.clone = function() {
  var arr = this.slice(0);
  for( var i = 0; i < this.length; i++ ) {
      if( this[i].clone ) {
          arr[i] = this[i].clone();
      }
  }
  return arr;
}

//Creates a width matrix for <th> tags in the table.
//Width of a child is the width of the parent divided by the number of children
function calculateWidth(array) {
  var widthMatrix = array.clone();
  widthMatrix[0][0][0] = 100;

  for (var i = 1; i < array.length; i++) {
    for (var j = 0; j < array[i].length; j++) {
      parentElementWidth = getElementWidth(widthMatrix[i-1],j);
      newLength = parentElementWidth/array[i][j].length;

      if (array[i][j].length == 0) {
        widthMatrix[i][j].push(parentElementWidth);
      }
      else {
        for (var k = 0; k < array[i][j].length; k++) {
          widthMatrix[i][j][k] = newLength;
        }
      }
    }
  }

  return widthMatrix
}

function sortWithIndices(toSort) {
  for (var i = 0; i < toSort.length; i++) {
    toSort[i] = [toSort[i], i];
  }
  toSort.sort(function(left, right) {
    return left[0] < right[0] ? -1 : 1;
  });
  toSort.sortIndices = [];
  for (var j = 0; j < toSort.length; j++) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort;
}


function createTableFromJSON(data,delimiter,additional_delimiter,categories,subcategories) {
  var tree = parseTree(data,delimiter,additional_delimiter,categories,subcategories);
  console.log(tree);
  var e = tableFromTreeWithColspan([tree]);
  console.log(tableFromTreeWithColspan([tree]));
  var ta = rectangulateArray(e[0]);
  console.log(ta);
  var cm = rectangulateArray(e[1]);
  var wm = calculateWidth(ta);
  return tableFromArray(ta,cm,wm)
}