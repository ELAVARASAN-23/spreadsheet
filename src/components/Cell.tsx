import React, { useState, useEffect, useRef } from "react";

type Props= {
  value: string;
  isEditing: boolean;
  focused: boolean;
  selected?: boolean;
  onEdit: (value: string) => void;
  onStartEdit: () => void;
  onFocus: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
}

const Cell: React.FC<Props> = ({
  value,
  isEditing,
  focused,
  selected,
  onEdit,
  onStartEdit,
  onFocus,
  onMouseDown,
  onMouseEnter,
}) => {
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => setTempValue(value), [value]);
  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);
  useEffect(() => {
    if (focused && cellRef.current) cellRef.current.focus();
  }, [focused]);

  return (
    <td
      ref={cellRef}
      tabIndex={0}
      className={`cell ${focused ? "focused" : ""} ${selected ? "selected" : ""}`}
      onClick={onFocus}
      onDoubleClick={onStartEdit}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => onEdit(tempValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEdit(tempValue);
            if (e.key === "Escape") setTempValue(value);
          }}
        />
      ) : (
        value
      )}
    </td>
  );
};

export default React.memo(Cell);
