import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  bgColor?: string;
  align?: 'left' | 'right';
}

interface MaterialTableProps<T> {
  title: string;
  titleColor: string;
  headerColor: string;
  columns: Column<T>[];
  data: T[];
  renderExpandedRow?: (item: T, index: number) => React.ReactNode;
}

export const MaterialTable = React.forwardRef<
  HTMLDivElement,
  MaterialTableProps<any>
>(
  (
    { title, titleColor, headerColor, columns, data, renderExpandedRow },
    ref,
  ) => (
    <div
      ref={ref}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className={`${titleColor} px-4 py-3 border-b`}>
        <h3 className={`text-sm font-bold flex items-center`}>
          <span className={`${headerColor} px-2 py-1 rounded mr-2`}>
            {data.length}
          </span>
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase ${
                    col.bgColor || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <React.Fragment key={index}>
                <tr className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-3 text-sm ${
                        col.align === 'right' ? '' : ''
                      } ${col.bgColor || ''}`}
                    >
                      {col.render
                        ? col.render(item[col.accessor as any], item, index)
                        : item[col.accessor as any]}
                    </td>
                  ))}
                </tr>
                {renderExpandedRow && renderExpandedRow(item, index)}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
);

MaterialTable.displayName = 'MaterialTable';
