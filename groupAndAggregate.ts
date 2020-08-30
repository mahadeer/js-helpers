export default function (dataset, fields) {
  var config = {
    rows: [],
    cols: []
  };
  Object.keys(dataset[0]).forEach(function (d) {
    if (fields.rows.indexOf(d) !== -1) {
      config.rows.push(d);
    } else {
      config.cols.push(d);
    }
  });
  var grouped = [];
  var groupedKeys = [];
  dataset.forEach(function (_row) {
    var matches = dataset.filter(function (_mRow) {
      var matched = config.rows.filter(function (rKey) {
        return _mRow[rKey] === _row[rKey];
      });
      return matched.length === config.rows.length;
    });
    var group = config.rows
      .map(function (_key) {
        return _row[_key];
      })
      .join(":");
    if (groupedKeys.indexOf(group) === -1) {
      groupedKeys.push(group);
      grouped.push(matches);
    }
  });
  var result = [];
  grouped.forEach(function (group) {
    var record = group.reduce(function (obj, val) {
      if (Object.keys(obj).length === 0) {
        obj = JSON.parse(JSON.stringify(val));
      } else {
        config.cols.forEach(function (d) {
          if (typeof val[d] === "number") {
            obj[d] += val[d];
          }
        });
      }
      return obj;
    }, {});
    result.push(record);
  });
  return result;
}
