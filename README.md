# Tableparser

## About

Tableparser is a simple tool for converting flat JSON objects into trees and rendering those as simple HTML tables.

It can also convert flat JSON objects into [jqTree](https://mbraak.github.io/jqTree/) compatible objects. 

Tableparser will automatically calculate the `colspan` and `width` values of the `<th>` tags to produce a rectangular array.

## Instructions
### Basic Example

First download this repository with `git clone` and include *tableparser.js* in your HTML file.

Let's suppose the JSON object looks like this:
```
data = {
        "1/1.1/1.1.1": "1/1.1/1.1.1 value",
        "1/1.2": "1/1.2 value",
        "1/1.3/1.3.1": "1/1.3/1.3.1 value",
        "1/1.3/1.3.2": "1/1.3/1.3.2 value",
        "1/1.3/1.3.3": "1/1.3/1.3.3 value",
        "1/1.3/1.3.4": "1/1.3/1.3.1 value",
        "1/1.4/1.4.1": "1/1.4/1.4.1 value",
        "1/1.4/1.4.2/1.4.2.1/1.4.2.1.1": "1/1.4/1.4.2/1.4.2.1/1.4.2.1.1 value",
        "1/1.4/1.4.2/1.4.2.1/1.4.2.1.2": "1/1.4/1.4.2/1.4.2.1/1.4.2.1.2 value",
        "1/1.4/1.4.2/1.4.2.1/1.4.2.1.3": "1/1.4/1.4.2/1.4.2.1/1.4.2.1.3 value",
        "1/1.4/1.4.2/1.4.2.1/1.4.2.1.4": "1/1.4/1.4.2/1.4.2.1/1.4.2.1.4 value",
        "1/1.5": "1/1.5 value"
      }
```
This can represent a tree with values as leaves. We would like to render this tree as a HTML table. 
To do this, we have to first create a table (using Boostrap for better looks) in our HTML file:
```
<div id="tableHolder">
    <table id="myTable" class="table table-striped table-bordered" style="text-align: center;font-size: 10px;" ></table>
</div>
```
Next we call *createTableFromJSON* method. This method returns a string we will append to our existing table.
```
tableString = createTableFromJSON(data,"/","",[]);
$("#myTable").append(tableString);
```
With some additional css:
```
.value {
    background: rgba(0,255,0,0.2);
}
.empty {
    border: 1px solid Transparent!important;
    background: white;
}
```
this will generate the following table:
![](images/full.png?raw=true "Generated table")

### Additional information

#### Methods
##### createTableFromJSON
Returns data as a HTML table in the form of a string. 
###### Parameters
- data (JSON object): *Data as a flat JSON.*
- delimiter: (string): *Delimiter which separates nodes in the keys of data.*
- additional delimiter (string): *Second delimiter. If there are none, one should pass an empty string.*
- categories (array of strings): *Names of nodes to be removed. All children nodes of the selected are removed as well. If there are none, one should pass an empty array.*

##### parseTree
Returns the data in a form of a tree. This tree is compatible with the [jqTree](https://mbraak.github.io/jqTree/).
###### Parameters
- data (JSON object): *Data as a flat JSON.*

##### createTableFromJSON
Returns tree as a HTML table in the form of a string.
###### Parameters
- tree (jqTree compatible object): *Data as a jqTree compatible Javascript object.*

#### Structure of the HTML table
Returned HTML table consists of `<tr>` and `<th>` tags. It is of rectangular shape and thus also inludes empty fields, which have a class `empty`. The leaves, i.e. the values of the branches, have a class `value`.

#### Example of Removing Nodes/Branches
Passing node names into the categories parameter will remove the named node and all its children. Taking the previous example, we will remove the nodes `1.3` and `"1.4.2.1.2"`.
```
tableString = createTableFromJSON(data,"/","",["1.3","1.4.2.1.2"]);
$("#myTable").append(tableString);
```
This will produce the following table:
![](images/not-full.png?raw=true "Table with removed branches")
