import React, { useState, useMemo } from 'react';

const normalizeString = (input: string): string => {
  if (!input) return '';

  // Convert to lowercase
  let normalized = input
    .toLowerCase()
    // Remove extra spaces
    .trim()
    // Replace various separators with a single standard separator
    .replace(/[-_\s]+/g, '-')
    // Remove special characters except hyphen
    .replace(/[^a-z0-9-]/g, '');

  return normalized;
};

const compareStrings = (
  str1: string | null | undefined,
  str2: string | null | undefined,
  field?: string,
): boolean => {
  if (
    str1 === null ||
    str1 === undefined ||
    str2 === null ||
    str2 === undefined
  )
    return false;

  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);

  // Special handling for status_karyawan to keep specific variations distinct
  if (field === 'status_karyawan') {
    // Require exact match for probation statuses
    if (
      normalized1.includes('probation') ||
      normalized2.includes('probation')
    ) {
      return normalized1 === normalized2;
    }
  }

  // Additional matching rules
  const specialMatches: Record<string, string[]> = {
    'laki-laki': ['laki', 'laki-laki', 'male', 'pria'],
    perempuan: ['perempuan', 'female', 'wanita'],
    tetap: ['tetap', 'permanent', 'fixed'],
    kontrak: ['kontrak', 'contract'],
  };

  // Check for exact match first
  if (normalized1 === normalized2) return true;

  // Check special matches
  for (const [key, variations] of Object.entries(specialMatches)) {
    if (
      variations.some(
        (v) =>
          normalizeString(v) === normalized1 &&
          normalizeString(v) === normalized2,
      )
    )
      return true;
  }

  return false;
};

const BarChartKaryawan = ({
  value,
  employeeData,
  groupField = 'department',
  fieldMapping = {
    department: 'nama_department',
    divisi: 'nama_divisi',
    grade: 'kategori',
    jabatan: 'nama_jabatan',
    jenis_kelamin: null,
    status_karyawan: 'nama_status',
    tipe_karyawan: null,
    tipe_penggajian: null,
  },
}: {
  value: any[];
  employeeData: any[];
  groupField?: string;
  fieldMapping?: Record<string, string | null>;
}) => {
  const data = value;
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const debugMatching = useMemo(() => {
    console.log('Debugging Matching:');
    console.log('Group Field:', groupField);
    console.log('Value Data:', value);

    if (groupField === 'status_karyawan') {
      const matchingDetails = employeeData?.map((employee: any) => {
        const statusFromBiodata =
          employee.biodata_karyawan[0]?.status?.nama_status;
        const statusDirectly = employee.status_karyawan;

        return {
          name: employee.name,
          statusFromBiodata,
          statusDirectly,
          normalizedBiodata: normalizeString(statusFromBiodata),
          normalizedDirectly: normalizeString(statusDirectly),
        };
      });

      console.log('Matching Details:', matchingDetails);
    }

    return null;
  }, [employeeData, groupField]);

  // Calculate total for percentages
  const total =
    data?.reduce((sum: number, item: any) => sum + item.jumlah, 0) || 0;

  // Generate an array of colors based on the data length
  const generateColors = (length: number) => {
    const colors = [];
    for (let i = 0; i < length; i++) {
      const hue = (i * 360) / length;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  };

  const colors = generateColors(data?.length || 0);

  // Calculate the segments for the pie chart
  const calculateSegments = () => {
    let cumulativePercent = 0;
    return data?.map((item: any, index: number) => {
      const percent = total > 0 ? (item.jumlah / total) * 100 : 0;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;

      return {
        ...item,
        percent,
        startAngle: (startPercent / 100) * 360,
        endAngle: (cumulativePercent / 100) * 360,
        color: colors[index % colors.length],
      };
    });
  };

  const segments = calculateSegments();

  // Create SVG arc path
  const createArc = (startAngle: number, endAngle: number, radius: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = radius * Math.cos(startRad);
    const y1 = radius * Math.sin(startRad);
    const x2 = radius * Math.cos(endRad);
    const y2 = radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Size constants
  const radius = 120;
  const chartSize = radius * 2;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;

  // Dynamic filter for employees
  const filterEmployees = (groupValue: string) => {
    return (
      employeeData?.filter((employee: any) => {
        // Handle special cases like jenis_kelamin, tipe_karyawan, tipe_penggajian
        if (
          ['jenis_kelamin', 'tipe_karyawan', 'tipe_penggajian'].includes(
            groupField,
          )
        ) {
          const fieldValue =
            employee.biodata_karyawan[0]?.[groupField] || employee[groupField];
          const matchGroup = compareStrings(fieldValue, groupValue);
          const matchSearch = searchTerm
            ? employee.name.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
          return matchGroup && matchSearch;
        }

        // For nested fields like department, divisi, grade, jabatan, status_karyawan
        const mappedField =
          fieldMapping[groupField as keyof typeof fieldMapping];
        if (!mappedField) return false;

        // Special handling for status_karyawan
        if (groupField === 'status_karyawan') {
          const statusFromBiodata =
            employee.biodata_karyawan[0]?.status?.[mappedField];
          const statusDirectly = employee[groupField];

          const matchGroup =
            compareStrings(statusFromBiodata, groupValue, groupField) ||
            compareStrings(statusDirectly, groupValue, groupField);

          const matchSearch = searchTerm
            ? employee.name.toLowerCase().includes(searchTerm.toLowerCase())
            : true;

          return matchGroup && matchSearch;
        }

        const fieldValue =
          employee.biodata_karyawan[0]?.[groupField]?.[mappedField] ||
          employee[groupField]?.[mappedField];

        const matchGroup = compareStrings(fieldValue, groupValue);
        const matchSearch = searchTerm
          ? employee.name.toLowerCase().includes(searchTerm.toLowerCase())
          : true;

        return matchGroup && matchSearch;
      }) || []
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        {/* Tooltip */}
        {hoveredSegment !== null && segments && segments[hoveredSegment] && (
          <div
            className="bg-white shadow-lg border border-gray-200 rounded-lg p-3 text-sm mr-4"
            style={{
              minWidth: '150px',
              maxWidth: '200px',
              position: 'absolute',
              left: '-170px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
            }}
          >
            <div className="font-bold mb-1">
              {segments[hoveredSegment].nama}
            </div>
            <div className="flex justify-between items-center">
              <div>Jumlah:</div>
              <div className="font-semibold">
                {segments[hoveredSegment].jumlah}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>Persentase:</div>
              <div className="font-semibold">
                {segments[hoveredSegment].percent.toFixed(1)}%
              </div>
            </div>
            <div
              className="w-full h-1 mt-2"
              style={{ backgroundColor: segments[hoveredSegment].color }}
            ></div>
          </div>
        )}

        {/* Pie Chart */}
        <div
          className="relative"
          style={{ width: chartSize, height: chartSize }}
        >
          <svg
            viewBox={`0 0 ${chartSize} ${chartSize}`}
            width="100%"
            height="100%"
          >
            <g transform={`translate(${centerX}, ${centerY})`}>
              {segments?.map((segment: any, index: number) => (
                <g key={index}>
                  <path
                    d={createArc(segment.startAngle, segment.endAngle, radius)}
                    fill={segment.color}
                    stroke="#fff"
                    strokeWidth="1"
                    onMouseEnter={() => setHoveredSegment(index)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    onClick={() => setSelectedGroup(segment.nama)}
                    style={{
                      cursor: 'pointer',
                      transform:
                        hoveredSegment === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto w-full">
        {segments?.map((segment: any, index: number) => (
          <div
            key={index}
            className="flex items-center text-xs"
            onMouseEnter={() => setHoveredSegment(index)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => setSelectedGroup(segment.nama)}
            style={{
              cursor: 'pointer',
              backgroundColor:
                hoveredSegment === index ? segment.color + '33' : 'transparent',
              padding: '2px 4px',
              borderRadius: '4px',
            }}
          >
            <div
              className="w-3 h-3 mr-1 flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            ></div>
            <div className="flex-1 truncate">{segment.nama}</div>
            <div className="ml-1 font-medium">
              {segment.jumlah} ({segment.percent.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      {selectedGroup && (
        <div className="mt-6 w-full">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {groupField.replace('_', ' ').toUpperCase()}: {selectedGroup}
            </h3>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 py-1 border rounded-md"
            />
            <button
              onClick={() => {
                setSelectedGroup(null);
                setSearchTerm('');
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Clear
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-1 py-2">No</th>
                  <th className="border border-gray-300 px-4 py-2">NIK</th>
                  <th className="border border-gray-300 px-4 py-2">Nama</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Status Karyawan
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Tipe Penggajian
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Tipe Karyawan
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Bagian</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Department
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Divisi</th>
                  <th className="border border-gray-300 px-4 py-2">Jabatan</th>
                  <th className="border border-gray-300 px-4 py-2">Grade</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Jenis Kelamin
                  </th>
                </tr>
              </thead>
              <tbody>
                {filterEmployees(selectedGroup).map(
                  (employee: any, index: number) => (
                    <tr key={index} className="text-center">
                      <td className="border border-gray-300 px-1 py-2">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.biodata_karyawan[0]?.nik || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.name || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.biodata_karyawan[0]?.status?.nama_status ||
                          employee.status_karyawan ||
                          '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.biodata_karyawan[0]?.tipe_penggajian ||
                          employee.tipe_penggajian ||
                          '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.biodata_karyawan[0]?.tipe_karyawan ||
                          employee.tipe_karyawan ||
                          '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.biodata_karyawan[0]?.bagian?.nama_bagian ||
                          '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.biodata_karyawan[0]?.department
                          ?.nama_department || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.biodata_karyawan[0]?.divisi?.nama_divisi ||
                          '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.biodata_karyawan[0]?.jabatan?.nama_jabatan ||
                          '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.biodata_karyawan[0]?.grade?.kategori || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.biodata_karyawan[0]?.jenis_kelamin ||
                          employee.jenis_kelamin ||
                          '-'}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarChartKaryawan;
