import { useRef } from "react";

interface PaginationProps {
  filteredItems: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
}

export function Pagination({ filteredItems, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage }: PaginationProps) {
  // quiero que inicialItemsPerPage sea el valor inicial de itemsPerPage, pero no quiero que cambie cuando itemsPerPage cambie
  // para eso uso useRef
  const initialItemsPerPage = useRef(itemsPerPage).current;
  return (
    <div className="card-footer d-flex justify-content-between align-items-center flex-wrap py-3 gap-4">
      <span className="text-muted" style={{textWrap: 'nowrap'}}>{filteredItems.length} registros encontrados</span>
      <ul className="pagination pagination-paginate">
        {Array.from({ length: Math.ceil(filteredItems.length / itemsPerPage) }, (_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
          </li>
        ))}
      </ul>
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted">Mostrar</span>
        <select className="form-select form-select-sm" value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}}>
          {Math.floor(initialItemsPerPage / 2) >= 5 && <option value={Math.floor(initialItemsPerPage / 2)}>{Math.floor(initialItemsPerPage / 2)}</option>}
          <option value={initialItemsPerPage}>{initialItemsPerPage}</option>
          <option value={initialItemsPerPage * 2}>{initialItemsPerPage * 2}</option>
          <option value={initialItemsPerPage * 3}>{initialItemsPerPage * 3}</option>
        </select>
        <span className="text-muted" style={{textWrap: 'nowrap'}}>registros</span>
      </div>
    </div>
  )
}