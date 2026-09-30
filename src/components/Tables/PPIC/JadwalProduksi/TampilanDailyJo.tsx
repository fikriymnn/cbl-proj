import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import ModalXL from './ModalXL';
import ModalFull from './ModalFull';
import PopUpTable2 from './PopUpTable2';
import JobOrderTable from './JobOrderTable';
import Loading from '../../../Loading';
import {
  FilterChips,
  GridSkeleton,
  ICONS,
  Icon,
  JODetailContent,
  JobChip,
  JobDetailCard,
  LoadingBar,
  MachineFilter,
  Toggle,
  addDays,
  formatIndonesianDate,
  groupJobsForCell,
  mergeMachines,
  pad,
  toYMD,
  useJobTicket,
  useMachineList,
  useMasterKategori,
} from './Jadwalshared';

const HOURS = Array.from({ length: 24 }, (_, i) => `${pad(i)}:00:00`);
const TIME_W = 84;
const COL_W = 148;
const HEADER_H = 52;

function TampilanDailyJO() {
  const todayStr = useMemo(() => toYMD(new Date()), []);
  const [startDate, setStartDate] = useState(todayStr);
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
  const [hideEmptyHours, setHideEmptyHours] = useState(false);

  // Interaction
  const [openJobId, setOpenJobId] = useState<number | null>(null);
  const [hoveredJobOrder, setHoveredJobOrder] = useState<any>(null);

  // Job order list / calculation modal (kept from the original)
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedJO, setSelectedJO] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reqId = useRef(0);

  const getJadwalView = useCallback(
    async (tglAwal: string, tglAkhir: string) => {
      const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksiView`;
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
    getJadwalView(startDate, startDate);
  }, [startDate, getJadwalView]);

  /* ------------------------------ derived ------------------------------ */

  const allMachines = useMemo(
    () => mergeMachines(machineList, mapData),
    [machineList, mapData],
  );

  // "hour|machine" -> ordered, merged jobs + conflict info
  const cells = useMemo(() => {
    const raw = new Map<string, any[]>();
    mapData.forEach((item) => {
      const k = `${item.jam}|${item.mesin}`;
      if (!raw.has(k)) raw.set(k, []);
      raw.get(k)!.push(item);
    });
    const out = new Map<
      string,
      { jobs: any[]; conflict: boolean; conflictCount: number }
    >();
    raw.forEach((items, k) => {
      const uniqueJO = new Set(items.map((j) => j.no_jo));
      out.set(k, {
        jobs: groupJobsForCell(items),
        conflict: uniqueJO.size > 1,
        conflictCount: uniqueJO.size,
      });
    });
    return out;
  }, [mapData]);

  const machineCounts = useMemo(() => {
    const c = new Map<string, number>();
    cells.forEach((cell, k) => {
      const m = k.slice(k.indexOf('|') + 1);
      c.set(m, (c.get(m) || 0) + cell.jobs.length);
    });
    return c;
  }, [cells]);

  const visibleMachines = useMemo(
    () =>
      allMachines.filter(
        (m) =>
          (!machineFilter || machineFilter.has(m)) &&
          (!hideEmptyMachines || (machineCounts.get(m) || 0) > 0),
      ),
    [allMachines, machineFilter, hideEmptyMachines, machineCounts],
  );

  const visibleHours = useMemo(
    () =>
      hideEmptyHours
        ? HOURS.filter((h) =>
            visibleMachines.some((m) => cells.has(`${h}|${m}`)),
          )
        : HOURS,
    [hideEmptyHours, visibleMachines, cells],
  );

  const stats = useMemo(() => {
    let entries = 0;
    let conflicts = 0;
    const unique = new Set<string>();
    cells.forEach((cell, k) => {
      const m = k.slice(k.indexOf('|') + 1);
      if (!visibleMachines.includes(m)) return;
      entries += cell.jobs.length;
      if (cell.conflict) conflicts++;
      cell.jobs.forEach((j) => unique.add(j.no_jo));
    });
    return { entries, conflicts, unique: unique.size };
  }, [cells, visibleMachines]);

  const currentHour =
    startDate === todayStr ? `${pad(new Date().getHours())}:00:00` : '';
  const jobToOpen =
    openJobId != null ? mapData.find((d: any) => d.id === openJobId) : null;

  /* ------------------------------ render ------------------------------ */

  return (
    <main className="min-w-0">
      {detailLoading && <Loading />}

      <div className="bg-white rounded-xl px-4 py-4">
        {/* Row 1: date navigation */}
        <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-[#D8EAFF]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Hari sebelumnya"
              onClick={() => setStartDate((d) => addDays(d, -1))}
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
              aria-label="Hari berikutnya"
              onClick={() => setStartDate((d) => addDays(d, 1))}
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
            {formatIndonesianDate(startDate)}
          </h2>

          <button
            type="button"
            onClick={() => getJadwalView(startDate, startDate)}
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
          <Toggle
            checked={hideEmptyHours}
            onChange={setHideEmptyHours}
            label="Sembunyikan jam kosong"
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
            {stats.conflicts > 0 && (
              <>
                ,{' '}
                <span className="font-semibold text-rose-600">
                  {stats.conflicts} konflik
                </span>
              </>
            )}
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
            <div className="min-w-max">
              {/* Header */}
              <div
                className="sticky top-0 z-30 flex border-b border-[#D8EAFF] bg-[#eaf4ff]"
                style={{ height: HEADER_H }}
              >
                <div
                  className="sticky left-0 z-40 shrink-0 grid place-items-center border-r border-[#D8EAFF] bg-[#eaf4ff] text-[11px] font-semibold text-[#0065de]"
                  style={{ width: TIME_W }}
                >
                  Jam
                </div>
                {visibleMachines.map((machine) => (
                  <div
                    key={machine}
                    className="shrink-0 flex flex-col items-center justify-center border-r border-[#D8EAFF] px-2 text-center"
                    style={{ width: COL_W }}
                  >
                    <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-[#0065de]">
                      {machine}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {machineCounts.get(machine) || 0} jadwal
                    </span>
                  </div>
                ))}
              </div>

              {/* Hour rows */}
              {visibleHours.length === 0 && (
                <p className="py-16 text-center text-sm text-slate-500">
                  Tidak ada jadwal pada tanggal ini.
                </p>
              )}
              {visibleHours.map((hour, rowIndex) => {
                const zebra = rowIndex % 2 === 0 ? 'bg-[#F0F7FF]' : 'bg-white';
                const isNow = hour === currentHour;
                return (
                  <div
                    key={hour}
                    className={`flex border-b border-[#E3EEFB] ${zebra}`}
                  >
                    <div
                      className={`sticky left-0 z-10 shrink-0 flex items-center justify-center border-r border-[#D8EAFF] text-[11px] font-semibold tabular-nums ${zebra} ${
                        isNow ? 'text-white' : 'text-[#0065de]'
                      }`}
                      style={{ width: TIME_W, minHeight: 44 }}
                    >
                      <span
                        className={
                          isNow ? 'rounded-full bg-[#0065de] px-2 py-0.5' : ''
                        }
                      >
                        {hour.slice(0, 5)}
                      </span>
                    </div>

                    {visibleMachines.map((machine) => {
                      const cell = cells.get(`${hour}|${machine}`);
                      const jobs = cell?.jobs ?? [];
                      return (
                        <div
                          key={machine}
                          className={`shrink-0 flex flex-col gap-1 border-r border-[#E3EEFB] p-1 ${
                            cell?.conflict
                              ? 'bg-rose-100 ring-2 ring-inset ring-rose-300'
                              : ''
                          } ${
                            isNow && !cell?.conflict ? 'bg-amber-100/50' : ''
                          }`}
                          style={{
                            width: COL_W,
                            minHeight: jobs.length ? 60 : 44,
                          }}
                        >
                          {cell?.conflict && (
                            <span className="text-center text-[10px] font-bold text-rose-700">
                              CONFLICT ({cell.conflictCount})
                            </span>
                          )}
                          {jobs.map((job) => (
                            <JobChip
                              key={`${job.no_jo}-${job.no_booking ?? ''}`}
                              data={job}
                              showTime={false}
                              onClick={(d) => setOpenJobId(d.id)}
                              onHover={setHoveredJobOrder}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hoveredJobOrder && <JobDetailCard data={hoveredJobOrder} />}

        {/* Drag and drop edit popup */}
        {jobToOpen && (
          <ModalFull
            isOpen
            onClose={() => setOpenJobId(null)}
            judul={'Drag And Drop Edit'}
          >
            <PopUpTable2
              dataMap={jobToOpen}
              onClose={() => setOpenJobId(null)}
              onFinish={() => getJadwalView(startDate, startDate)}
              tgl={startDate}
            />
          </ModalFull>
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

export default TampilanDailyJO;
