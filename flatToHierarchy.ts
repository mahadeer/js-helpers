const getRowId = (row: any, rowKey: string, level: number, rows: any[]) => {
  let rowId: string[] = [];
  let parent: any = null;
  let parentRowId: string = "root";
  if (level > 0) {
    parent = {};
    parentRowId = "";
    for (let rI = 0; rI < level; rI++) {
      parent[rows[rI]] = row[rows[rI]];
      parentRowId =
        parentRowId === ""
          ? row[rows[rI]]
          : `${parentRowId}~/~${row[rows[rI]]}`;
      rowId.push(row[rows[rI]]);
    }
  }
  rowId.push(row[rowKey]);
  return { rowId: rowId.join("~/~"), parent, parentRowId };
};

const computeChildren = (
  data: any,
  parentRowId: string,
  rowId: string,
  parent: any,
  parentRowReference: any,
  records: any[]
) => {
  parentRowReference[parentRowId] = parentRowReference[parentRowId] || [];
  const rowRefIdnex = parentRowReference[parentRowId].indexOf(rowId);
  if (rowRefIdnex === -1) {
    parentRowReference[parentRowId].push(rowId);
    if (parent === null) {
      records.push(data);
    } else {
      let refObject: any = records;
      let refParentRowId = "";
      const parentKeys = Object.keys(parent);
      parentKeys.forEach((key, index) => {
        refParentRowId =
          refParentRowId === ""
            ? parent[key]
            : `${refParentRowId}~/~${parent[key]}`;
        if (index === 0) {
          refObject =
            refObject[
              parentRowReference["root"].indexOf(parent[parentKeys[index]])
            ];
        } else {
          const parentRefId = refParentRowId.replace(/(~\/~)[^(~/~)]*$/g, "");
          refObject =
            refObject.children[
              parentRowReference[parentRefId].indexOf(refParentRowId)
            ];
        }
      });
      refObject.children.push(data);
    }
  }
};

export default function (dataset: any[], rows: string[]) {
  let records: any[] = [];
  let parentRowReference: any = {};
  for (var dI = 0; dI < dataset.length; dI++) {
    const row: any = dataset[dI];
    for (let level = 0; level < rows.length; level++) {
      let data: any = {};
      const rowKey = rows[level];
      const { rowId, parent, parentRowId } = getRowId(row, rowKey, level, rows);
      data.nodeData = row;
      data.level = level;
      data.rowId = rowId;
      data.rowKey = rowKey;
      data.label = row[rowKey];
      data.children = [];
      data.parent = parent;
      computeChildren(
        data,
        parentRowId,
        rowId,
        parent,
        parentRowReference,
        records
      );
    }
  }
  return records;
}
