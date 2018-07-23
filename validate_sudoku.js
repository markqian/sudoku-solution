var fs = require('fs')
    , filename = process.argv[2];


if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + ' FILENAME');
    process.exit(1);
}


function readLines(input, func) {
    var remaining = '';

    input.on('data', function (data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        var last = 0;
        while (index > -1) {
            var line = remaining.substring(last, index);
            last = index + 1;
            func(line);
            index = remaining.indexOf('\n', last);
        }

        remaining = remaining.substring(last);
    });

    input.on('end', function () {
        if (remaining.length > 0) {
            func(remaining);
        } 
    });
}

var puzzle = []

function func(data) {
    data = data.replace(/(\n|\r)+$/, '')
    puzzle.push(data.split('').map(item => {
        return parseInt(item)
    }))
    if (puzzle.length == 9) {
        console.log(validateSolution(puzzle))
    }
}

function validateSolution(board) {
    return validateEntity(board) && validateEntity(board, 'column') && validateEntity(board, 'region');
  }
  
  function validateEntity(board, entity) {
    if (!entity) {
      return board.every(function(row) { return validateSum(row) && validateMembers(row); });
    } else {
      for (var i = 0; i < board.length; i++) {
        var set = entity === 'column' ? transposeCol(board, i) : transposeRegion(board, i);
        if (!(validateSum(set) && validateMembers(set))) return false;
      }
      return true;
    }
  }
  
  // Validators
  function validateSum(set) {
    var reduction = set.reduce(function(sum, member) { return sum + member; });
    return reduction === 45 ? true : false;
  }
  
  function validateMembers(set) {
    return allIncluded(set) ? validateFrequency(buildHistogram(set)) : false;
  }
  
  // Validation Helpers
  function allIncluded(set) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].every(function(member) {
      return set.indexOf(member) >= 0;
    });
  }
  
  function validateFrequency(histo) {
    for (var key in histo) {
      if (histo.hasOwnProperty(key)) if (histo[key] > 1) return false;
    }
    return true;
  }
  
  // Representation and Manipulation Helpers
  function buildHistogram(set) {
    var histo = {};
    set.forEach(function(member) { histo[member] = histo[member] ? histo[member]++ : 1; });
    return histo;
  }
  
  function transposeRegion(board, regionIdx) {
    var fromToTuple = setFromTo(regionIdx);
    return createRegion(board, setStartIdx(regionIdx), fromToTuple[0], fromToTuple[1]);
  }
  
  function transposeCol(board, colIdx) {
    var transposed = [];
    for (var i = 0; i < board.length; i++) transposed.push(board[colIdx][i]);
    return transposed;
  }
  
  function createRegion(board, startIdx, from, to) {
    var region = [];
    for (var i = 0; i < 3; i++) {
      region = region.concat(sliceRegion(board, startIdx + i, from, to));
    }
    return region;
  }
  
  function sliceRegion(board, colIdx, from, to) {
    return board[colIdx].slice(from, to);
  }
  
  function setFromTo(regionIdx) {
    var from = 0;
    var to = 3;
    if (regionIdx === 1 || regionIdx === 4 || regionIdx === 7) {
      from = 3; to = 6;
    } else if (regionIdx === 2 || regionIdx === 5 || regionIdx === 8) {
      from = 6; to = 9;
    }
    return [from, to];
  }
  
  function setStartIdx(regionIdx) {
    var startIdx = 0;
    if (regionIdx > 2 && regionIdx < 6) startIdx = 3;
    else if (regionIdx > 5 && regionIdx < 9) startIdx = 6;
    return startIdx;
  }
  

var input = fs.createReadStream(filename);
readLines(input, func);
