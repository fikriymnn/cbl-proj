import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import ModalXL from './ModalXL';
import JobOrderTable from './JobOrderTable';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import {
  DAY_NAMES,
  FilterChips,
  GridSkeleton,
  ICONS,
  Icon,
  JODetailContent,
  JobChip,
  JobDetailCard,
  LoadingBar,
  MachineFilter,
  SIDEBAR_W,
  Toggle,
  addDays,
  dayKey,
  formatIndonesianDate,
  groupByMachineDay,
  isWeekend,
  mergeMachines,
  parseYMD,
  toYMD,
  useJobTicket,
  useMachineList,
  useMasterKategori,
} from './Jadwalshared';

const DAY_MIN_W = 150;
const HEADER_H = 52;
const MAX_CHIPS_WEEK = 6;

function TampilanWeeklyJO() {
  const todayStr = useMemo(() => toYMD(new Date()), []);
  const [startDate, setStartDate] = useState(todayStr);
  const endDate = useMemo(() => addDays(startDate, 6), [startDate]);
  const [mapData, setMapData] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const { machineList, ready: machinesReady } = useMachineList();
  const {
    historyListJO,
    penjadwalanListJO,
    getmasterKategori,
    loading: listLoading,
  } = useMasterKategori();
  const {
    listJO1,
    get1Tiket,
    showDetail,
    toggleDetail,
    loading: detailLoading,
  } = useJobTicket();

  // View options
  const [machineFilter, setMachineFilter] = useState<Set<string> | null>(null);
  const [hideEmptyMachines, setHideEmptyMachines] = useState(false);
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

  // Detail card: hover shows it, click pins it
  const [hoveredJobOrder, setHoveredJobOrder] = useState<any>(null);
  const [pinnedJobOrder, setPinnedJobOrder] = useState<any>(null);

  // Job order list / calculation modal (kept from the original)
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedJO, setSelectedJO] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reqId = useRef(0);

  const getJadwalView = useCallback(
    async (tglAwal: string, tglAkhir: string) => {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/ppic/jadwalProduksiWeekView`;
      const id = ++reqId.current;
      try {
        setScheduleLoading(true);
        const response = await axios.get(url, {
          params: { start_date: tglAwal, end_date: tglAkhir },
          withCredentials: true,
        });
        if (id === reqId.current) setMapData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (id === reqId.current) setScheduleLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    getJadwalView(startDate, endDate);
  }, [startDate, endDate, getJadwalView]);

  /* ------------------------------ derived ------------------------------ */

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => parseYMD(addDays(startDate, i))),
    [startDate],
  );
  const todayKey = useMemo(() => dayKey(new Date()), []);

  const allMachines = useMemo(
    () => mergeMachines(machineList, mapData),
    [machineList, mapData],
  );
  const groupedData = useMemo(() => groupByMachineDay(mapData), [mapData]);

  const machineCounts = useMemo(() => {
    const c = new Map<string, number>();
    groupedData.forEach((byDay, m) => {
      let n = 0;
      days.forEach((d) => (n += byDay.get(dayKey(d))?.length ?? 0));
      c.set(m, n);
    });
    return c;
  }, [groupedData, days]);

  const visibleMachines = useMemo(
    () =>
      allMachines.filter(
        (m) =>
          (!machineFilter || machineFilter.has(m)) &&
          (!hideEmptyMachines || (machineCounts.get(m) || 0) > 0),
      ),
    [allMachines, machineFilter, hideEmptyMachines, machineCounts],
  );

  const stats = useMemo(() => {
    let entries = 0;
    const unique = new Set<string>();
    visibleMachines.forEach((m) =>
      days.forEach(
        (d) =>
          groupedData
            .get(m)
            ?.get(dayKey(d))
            ?.forEach((j) => {
              entries++;
              unique.add(j.no_jo);
            }),
      ),
    );
    return { entries, unique: unique.size };
  }, [visibleMachines, days, groupedData]);

  const toggleExpanded = (key: string) =>
    setExpandedCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const gridCols = `${SIDEBAR_W}px repeat(7, minmax(${DAY_MIN_W}px, 1fr))`;
  const shownDetail = pinnedJobOrder ?? hoveredJobOrder;

  /* ------------------------------ render ------------------------------ */

  return (
    <main className="min-w-0">
      {detailLoading && <Loading />}

      <div className="bg-white rounded-xl px-4 py-4">
        {/* Row 1: week navigation */}
        <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-[#D8EAFF]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Minggu sebelumnya"
              onClick={() => setStartDate((d) => addDays(d, -7))}
              className="h-9 w-9 grid place-items-center rounded-lg bg-primary text-white hover:opacity-90"
            >
              <Icon d={ICONS.left} />
            </button>
            <input
              type="date"
              value={startDate}
              onChange={(e) => e.target.value && setStartDate(e.target.value)}
              className="rounded-lg bg-[#D8EAFF] px-3 h-9 text-sm font-medium text-slate-800"
            />
            <button
              type="button"
              aria-label="Minggu berikutnya"
              onClick={() => setStartDate((d) => addDays(d, 7))}
              className="h-9 w-9 grid place-items-center rounded-lg bg-primary text-white hover:opacity-90"
            >
              <Icon d={ICONS.right} />
            </button>
            <button
              type="button"
              onClick={() => setStartDate(todayStr)}
              className="ml-1 h-9 px-3 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hari ini
            </button>
          </div>

          <h2 className="text-lg font-semibold text-blue-500">
            {formatIndonesianDate(startDate)}{' '}
            <span className="text-slate-400">sampai</span>{' '}
            {formatIndonesianDate(endDate)}
          </h2>

          <button
            type="button"
            onClick={() => getJadwalView(startDate, endDate)}
            className="ml-auto h-9 px-4 rounded-lg bg-primary text-sm font-medium text-white hover:opacity-90"
          >
            Tampilkan
          </button>
        </div>

        {/* Row 2: filters and stats */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <MachineFilter
            machines={allMachines}
            counts={machineCounts}
            value={machineFilter}
            onChange={setMachineFilter}
          />
          <Toggle
            checked={hideEmptyMachines}
            onChange={setHideEmptyMachines}
            label="Sembunyikan mesin kosong"
          />

          <p className="ml-auto text-sm text-slate-600 tabular-nums">
            <span className="font-semibold text-slate-800">
              {visibleMachines.length}
            </span>{' '}
            dari {allMachines.length} mesin,{' '}
            <span className="font-semibold text-slate-800">
              {stats.entries}
            </span>{' '}
            jadwal,{' '}
            <span className="font-semibold text-slate-800">{stats.unique}</span>{' '}
            JO
          </p>
        </div>

        <FilterChips value={machineFilter} onChange={setMachineFilter} />
        <LoadingBar active={scheduleLoading} />

        {/* Grid */}
        <div
          className={`relative mt-2 overflow-auto rounded-xl border border-[#D8EAFF] bg-white transition-opacity ${
            scheduleLoading ? 'opacity-60' : ''
          }`}
          style={{ maxHeight: 'calc(100vh - 270px)', minHeight: 320 }}
        >
          {!machinesReady ? (
            <GridSkeleton />
          ) : visibleMachines.length === 0 ? (
            <div className="grid place-items-center py-24 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Tidak ada mesin yang ditampilkan
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Ubah filter mesin atau matikan opsi sembunyikan mesin kosong.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMachineFilter(null);
                    setHideEmptyMachines(false);
                  }}
                  className="mt-3 h-9 px-4 rounded-lg bg-[#0065de] text-sm font-medium text-white hover:opacity-90"
                >
                  Tampilkan semua mesin
                </button>
              </div>
            </div>
          ) : (
            <div style={{ minWidth: SIDEBAR_W + 7 * DAY_MIN_W }}>
              {/* Header */}
              <div
                className="sticky top-0 z-30 grid border-b border-[#D8EAFF] bg-[#eaf4ff]"
                style={{ gridTemplateColumns: gridCols, height: HEADER_H }}
              >
                <div className="sticky left-0 z-40 grid place-items-center border-r border-[#D8EAFF] bg-[#eaf4ff] text-[11px] font-semibold text-[#0065de]">
                  Mesin
                </div>
                {days.map((d) => {
                  const today = dayKey(d) === todayKey;
                  return (
                    <div
                      key={dayKey(d)}
                      className={`flex flex-col items-center justify-center border-r border-[#D8EAFF] ${
                        isWeekend(d) ? 'text-rose-600' : 'text-[#0065de]'
                      }`}
                    >
                      <span className="text-[10px] font-medium opacity-80">
                        {DAY_NAMES[d.getDay()]}
                      </span>
                      <span
                        className={`mt-0.5 text-[12px] font-semibold leading-none ${
                          today
                            ? 'rounded-full bg-[#0065de] px-2 py-0.5 text-white'
                            : ''
                        }`}
                      >
                        {convertTimeStampToDate(d)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Machine rows */}
              {visibleMachines.map((machine, mi) => {
                const zebra = mi % 2 === 0 ? 'bg-[#F0F7FF]' : 'bg-white';
                return (
                  <div
                    key={machine}
                    className={`grid border-b border-[#E3EEFB] ${zebra}`}
                    style={{ gridTemplateColumns: gridCols }}
                  >
                    <div
                      className={`sticky left-0 z-10 flex flex-col justify-center gap-0.5 border-r border-[#D8EAFF] px-3 ${zebra}`}
                      style={{ minHeight: 60 }}
                    >
                      <span className="truncate text-[12px] font-semibold text-[#0065de]">
                        {machine}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {machineCounts.get(machine) || 0} jadwal
                      </span>
                    </div>

                    {days.map((d) => {
                      const dk = dayKey(d);
                      const cellKey = `${machine}|${dk}`;
                      const items = groupedData.get(machine)?.get(dk) ?? [];
                      const expanded = expandedCells.has(cellKey);
                      const shown = expanded
                        ? items
                        : items.slice(0, MAX_CHIPS_WEEK);
                      const hidden = items.length - shown.length;
                      const tint =
                        dk === todayKey
                          ? 'bg-amber-100/50'
                          : isWeekend(d)
                          ? 'bg-[#0065de]/[0.05]'
                          : '';
                      return (
                        <div
                          key={dk}
                          className={`flex flex-col gap-1 border-r border-[#E3EEFB] p-1 ${tint}`}
                          style={{ minHeight: 60 }}
                        >
                          {shown.map((job) => (
                            <JobChip
                              key={`${job.no_jo}-${job.no_booking ?? ''}`}
                              data={job}
                              onHover={setHoveredJobOrder}
                              onClick={(j) =>
                                setPinnedJobOrder((cur: any) =>
                                  cur === j ? null : j,
                                )
                              }
                            />
                          ))}
                          {hidden > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(cellKey)}
                              className="rounded bg-slate-100 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-200"
                            >
                              +{hidden} lagi
                            </button>
                          )}
                          {expanded && items.length > MAX_CHIPS_WEEK && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(cellKey)}
                              className="rounded py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100"
                            >
                              Ciutkan
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {shownDetail && (
          <JobDetailCard
            data={shownDetail}
            onClose={pinnedJobOrder ? () => setPinnedJobOrder(null) : undefined}
          />
        )}

        {isDetailVisible && (
          <JobOrderTable
            historyListJO={historyListJO}
            penjadwalanListJO={penjadwalanListJO}
            get1Tiket={get1Tiket}
            setSelectedJO={setSelectedJO}
            setSelectedIndex={setSelectedIndex}
            setIsModalOpen={setIsModalOpen}
            isDetailVisible={isDetailVisible}
            setIsDetailVisible={setIsDetailVisible}
            loading={detailLoading || listLoading || scheduleLoading}
            title="Job Order List"
            getmasterKategori={getmasterKategori}
            canceledListJO={{ data: [] }}
          />
        )}

        {isModalOpen && selectedJO && (
          <ModalXL
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            judul={'Rumus Kalkulasi'}
          >
            <JODetailContent
              selectedJO={selectedJO}
              listJO1={listJO1}
              expanded={!!showDetail[selectedIndex]}
              onToggleDetail={() => toggleDetail(selectedIndex)}
            />
          </ModalXL>
        )}
      </div>
    </main>
  );
}

export default TampilanWeeklyJO;
