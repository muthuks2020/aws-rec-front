import { useState } from "react";
import "../assets/styles/tableDropdown.scss"

export const TableDropdown = ({onClick}) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className={`dropdown dropstart ${show && "show"}`}
      onClick={() => setShow(!show)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        fill="currentColor"
        className="bi bi-three-dots pointer dropdown-toggle"
        viewBox="0 0 16 16"
      >
        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
      </svg>
      <div
        className={`dropdown-menu ${show && "show"}`}
        aria-labelledby="dropdownMenuButton"
      >
        <a className="dropdown-item" onClick={() => onClick('view')}>
          View
        </a>
        <a className="dropdown-item" onClick={() => onClick('edit')}>
          Edit
        </a>
        <a className="dropdown-item" onClick={() => onClick('delete')}>
          Delete
        </a>
      </div>
    </div>
  );
};
