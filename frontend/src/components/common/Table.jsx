export function TableContainer({ children, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-border bg-surface shadow-subtle ${className}`}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({ children, className = "" }) {
  return (
    <table className={`w-full border-collapse text-left text-sm ${className}`}>
      {children}
    </table>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <thead
      className={`border-b border-border bg-surface-subtle text-[12px] font-semibold tracking-wider text-text-secondary uppercase ${className}`}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }) {
  return (
    <tbody className={`divide-y divide-border/60 ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", onClick, ...props }) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-surface-subtle/50 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children, className = "", ...props }) {
  return (
    <th scope="col" className={`px-4 py-3 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", ...props }) {
  return (
    <td className={`px-4 py-3.5 text-text-primary ${className}`} {...props}>
      {children}
    </td>
  );
}

export default Table;

