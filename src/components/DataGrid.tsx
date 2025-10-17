import React, { useState, useEffect, useRef } from "react";
import Cell from "./Cell";
import "../styles.css";

const createInitialGrid = (rows = 5, cols = 5) => {
  const headers = Array.from({ length: cols }, (_, i) => `C${i + 1}`);
  const data = Array.from({ length: rows }, (_, i) => [
    `R${i + 1}`,
    ...Array(cols).fill(""),
  ]);
  return { headers, data };
};

const DataGrid = () => {
  const saved = localStorage.getItem("gridData");
  const initial = saved ? JSON.parse(saved) : createInitialGrid();

  const [headers, setHeaders] = useState<string[]>(initial.headers);
  const [data, setData] = useState<string[][]>(initial.data);
  const [editing, setEditing] = useState<{ r: number; c: number } | null>(null);
  const [focused, setFocused] = useState<{ r: number; c: number }>({ r: 0, c: 0 });

  // Selection states
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ r: number; c: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ r: number; c: number } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("gridData", JSON.stringify({ headers, data }));
  }, [headers, data]);

  const handleEdit = (r: number, c: number, value: string) => {
    const newData = data.map((row) => [...row]);
    newData[r][c] = value;
    setData(newData);
  };
// Add Single Rows
  const addRow = () => {
    const newLabel = `R${data.length + 1}`;
    const newRow = [newLabel, ...Array(headers.length).fill("")];
    setData([...data, newRow]);
  };
// Add Single Column
  const addColumn = () => {
    const newHeader = `C${headers.length + 1}`;
    setHeaders([...headers, newHeader]);
    const newData = data.map((row) => [...row, ""]);
    setData(newData);
  };

  // Keyboard navigation
  const moveFocus = (r: number, c: number) => {
    const maxR = data.length - 1;
    const maxC = headers.length;
    if (r < 0 || c < 1 || r > maxR || c > maxC) return;
    setFocused({ r, c });
    setEditing(null);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (editing) return;
    const { r, c } = focused;
    if (e.key === "ArrowUp") moveFocus(r - 1, c);
    if (e.key === "ArrowDown") moveFocus(r + 1, c);
    if (e.key === "ArrowLeft") moveFocus(r, c - 1);
    if (e.key === "ArrowRight") moveFocus(r, c + 1);
    if (e.key === "Enter") {
      e.preventDefault();
      setEditing({ r, c });
    }
    if (e.key === "Tab") {
      e.preventDefault();
      moveFocus(r, c + 1);
    }
  };

  // Drag + Shift selection
  const handleMouseDown = (r: number, c: number, e?: React.MouseEvent) => {
    if (c === 0) return;
    if (e?.shiftKey && selectionStart) {
      setSelectionEnd({ r, c });
      setIsSelecting(false);
    } else {
      setIsSelecting(true);
      setSelectionStart({ r, c });
      setSelectionEnd({ r, c });
    }
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (isSelecting && selectionStart) setSelectionEnd({ r, c });
  };

  const handleMouseUp = () => setIsSelecting(false);

  // Determine if cell is inside selected range
  const isCellSelected = (r: number, c: number): boolean => {
    if (!selectionStart || !selectionEnd) return false;
    const rMin = Math.min(selectionStart.r, selectionEnd.r);
    const rMax = Math.max(selectionStart.r, selectionEnd.r);
    const cMin = Math.min(selectionStart.c, selectionEnd.c);
    const cMax = Math.max(selectionStart.c, selectionEnd.c);
    return r >= rMin && r <= rMax && c >= cMin && c <= cMax;
  };

  // Copy / Cut / Paste
  const getSelectedRange = () => {
    if (!selectionStart || !selectionEnd) return null;
    const rMin = Math.min(selectionStart.r, selectionEnd.r);
    const rMax = Math.max(selectionStart.r, selectionEnd.r);
    const cMin = Math.min(selectionStart.c, selectionEnd.c);
    const cMax = Math.max(selectionStart.c, selectionEnd.c);
    return { rMin, rMax, cMin, cMax };
  };

  const copySelection = async () => {
    const range = getSelectedRange();
    if (!range) return;
    const { rMin, rMax, cMin, cMax } = range;
    const copied = data
      .slice(rMin, rMax + 1)
      .map((row) => row.slice(cMin, cMax + 1).join("\t"))
      .join("\n");
    await navigator.clipboard.writeText(copied);
  };

  const cutSelection = async () => {
    const range = getSelectedRange();
    if (!range) return;
    await copySelection();
    const { rMin, rMax, cMin, cMax } = range;
    const newData = data.map((r, ri) =>
      r.map((v, ci) => (ri >= rMin && ri <= rMax && ci >= cMin && ci <= cMax ? "" : v))
    );
    setData(newData);
  };

  const pasteData = async () => {
    const text = await navigator.clipboard.readText();
    const parsed = text
      .split("\n")
      .map((r) => r.split("\t"))
      .filter((r) => r.length > 0);

    const start = selectionStart || { r: focused.r, c: focused.c };
    let newData = [...data];

    const requiredRows = start.r + parsed.length - newData.length;
    const requiredCols = start.c + parsed[0].length - newData[0].length;
    for (let i = 0; i < requiredRows; i++) addRow();
    if (requiredCols > 0) for (let i = 0; i < requiredCols; i++) addColumn();

    newData = newData.map((row, ri) =>
      row.map((val, ci) => {
        const rOffset = ri - start.r;
        const cOffset = ci - start.c;
        if (parsed[rOffset] && parsed[rOffset][cOffset] !== undefined)
          return parsed[rOffset][cOffset];
        return val;
      })
    );
    setData(newData);
  };

  const handleShortcut = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      copySelection();
    }
    if (e.ctrlKey && e.key === "x") {
      e.preventDefault();
      cutSelection();
    }
    if (e.ctrlKey && e.key === "v") {
      e.preventDefault();
      pasteData();
    }
  };

  return (
    <div
      className="datagrid"
      tabIndex={0}
      ref={gridRef}
      onKeyDown={(e) => {
        handleKey(e);
        handleShortcut(e);
      }}
      onMouseUp={handleMouseUp}
    >
      <h2>DataGrid (Spreadsheet)</h2>
      
      <div className="controls">
        <button title="Add Row" onClick={addRow}>Add Row</button>
        <button title="Add Column" onClick={addColumn}>Add Column</button>
      </div>

      <table>
        <thead>
          <tr>
            <th className="corner"></th>
            {headers.map((header, c) => (
              <th key={c} className="header">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, r) => (
            <tr key={r}>
              {row.map((val, c) =>
                c === 0 ? (
                  <td key={c} className="label">
                    {val}
                  </td>
                ) : (
                  <Cell
                    key={c}
                    value={val}
                    isEditing={editing?.r === r && editing?.c === c && focused.r === r && focused.c === c}
                    focused={focused.r === r && focused.c === c}
                    selected={isCellSelected(r, c)}
                    onEdit={(v) => handleEdit(r, c, v)}
                    onStartEdit={() => setEditing({ r, c })}
                    onFocus={() => setFocused({ r, c })}
                    onMouseDown={(e) => handleMouseDown(r, c, e)}
                    onMouseEnter={() => handleMouseEnter(r, c)}
                  />
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataGrid;
