import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import Logo from '../../images/logo/logo-cbl 2.svg';
import Dashboard from '../../images/icon/dashboard.svg';
import QC from '../../images/icon/qcc.svg';
import MaintenanceIcon from '../../images/icon/dashboard.svg';
import HRIcon from '../../images/icon/history2.svg';
import PPICIcon from '../../images/icon/qcc.svg';
import ProductionIcon from '../../images/icon/inspect.svg';
import MasterDataIcon from '../../images/icon/master.svg';
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  role: any;
  bagian: any;
  nama: any;
}

interface MenuItem {
  name: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

interface MenuCategory {
  name: string;
  icon: string;
  items: MenuItem[];
}

// Icon component for inline SVG icons
const IconComponent = ({
  name,
  size = 16,
}: {
  name: string;
  size?: number;
}) => {
  const icons: { [key: string]: JSX.Element } = {
    dashboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.44,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
      </svg>
    ),
    maintenance: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
      </svg>
    ),
    sparepart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    stock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </svg>
    ),
    monitoring: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3v18h18v-2H5V3H3zm19 5h-2V4h-4V2h6v6zM9 17l3.5-4.5 2.5 3.01L19 11V5h-6l4.5 4.5-2.5-3.01L11 11 9 17z" />
      </svg>
    ),
    machine: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    project: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
    recap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
      </svg>
    ),
    preventive: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
      </svg>
    ),
    kpi: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
      </svg>
    ),
    preparation: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    report: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
    ncr: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    capa: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H18V1h-2v1H8V1H6v1H4.5C3.11 2 2 3.11 2 4.5v15C2 20.89 3.11 22 4.5 22h15c1.39 0 2.5-1.11 2.5-2.5v-15C22 3.11 20.89 2 19.5 2zm0 17h-15v-12h15v12z" />
      </svg>
    ),
    outstanding: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
      </svg>
    ),
    attendance: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    quality: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    validation: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    inspection: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    ),
    qms: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
      </svg>
    ),
    defect: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    document: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2 2 0 0 0 17.5 7h-1A2 2 0 0 0 14.5 8.37l-2.54 7.63H14v6h6zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zm1.5 1h-4A2 2 0 0 0 8 14.5v6.5h8v-6.5A2 2 0 0 0 14 12.5z" />
      </svg>
    ),
    role: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    analysis: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
      </svg>
    ),
    grade: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
    access: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>
    ),
    hr: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    personnel: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2 2 0 0 0 17.5 7h-1A2 2 0 0 0 14.5 8.37l-2.54 7.63H14v6h6z" />
      </svg>
    ),
    company: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
      </svg>
    ),
    employee: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
      </svg>
    ),
    payroll: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
      </svg>
    ),
    submission: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
    response: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
      </svg>
    ),
    shift: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
      </svg>
    ),
    warning: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    department: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
      </svg>
    ),
    leave: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
      </svg>
    ),
    ppic: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
      </svg>
    ),
    schedule: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
      </svg>
    ),
    production: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    breakdown: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    waste: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
      </svg>
    ),
    history: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
      </svg>
    ),
    form: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
    input: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
      </svg>
    ),
    service: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
      </svg>
    ),
    lifetime: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
      </svg>
    ),
    opname: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
    ),
    submit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    ),
    adjustment: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.44,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
      </svg>
    ),
    outsourcing: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    approval: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    ),
    position: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  };

  return icons[name] || icons.dashboard;
};

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  role,
  bagian,
  nama,
}: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );

  // Menu configuration with English names
  const menuCategories: MenuCategory[] = [
    {
      name: 'Dashboard',
      icon: Dashboard,
      items: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: 'dashboard',
        },
        {
          name: 'Maintenance Dashboard',
          path: '/maintenance/DashboardMaintenance',
          icon: 'dashboard',
        },
      ],
    },
    {
      name: 'Maintenance',
      icon: MaintenanceIcon,
      items: [
        {
          name: 'Corrective (CM)',
          path: '/maintenance/machine',
          icon: 'machine',
        },
        {
          name: 'Preventive Maintenance (PM)',
          path: '/maintenance/inspection',
          icon: 'preventive',
          children: [
            {
              name: 'PM1',
              path: '/maintenance/inspection/pm_1',
              icon: 'preventive',
            },
            {
              name: 'PM2',
              path: '/maintenance/inspection/pm_2',
              icon: 'preventive',
            },
            {
              name: 'PM3',
              path: '/maintenance/inspection/pm_3',
              icon: 'preventive',
            },
            {
              name: 'OS3',
              path: '/maintenance/inspection/OS_3',
              icon: 'preventive',
            },
            {
              name: 'Inspection History',
              path: '/maintenance/inspection/histori',
              icon: 'history',
            },
          ],
        },
        {
          name: 'Outstanding',
          path: '/maintenance/outstanding',
          icon: 'outstanding',
        },
        {
          name: 'Maintenance Absensi',
          path: '/maintenance/absensi',
          icon: 'attendance',
        },
        {
          name: 'Sparepart',
          path: '/maintenance/sparepart',
          icon: 'sparepart',
          children: [
            {
              name: 'Opname Adjustment',
              path: '/maintenance/sparepart/opname/adjustment',
              icon: 'adjustment',
            },
            {
              name: 'Stock Master',
              path: '/maintenance/sparepart/stockmaster_sparepart',
              icon: 'stock',
            },
            {
              name: 'Monitoring Sparepart',
              path: '/maintenance/sparepart/monitoringSparepart',
              icon: 'monitoring',
            },
            {
              name: ' Monitoring Service',
              path: '/maintenance/sparepart/monitoringService',
              icon: 'monitoring',
            },
          ],
        },
        {
          name: 'Project MTC',
          path: '/maintenance/projectMtc',
          icon: 'project',
        },
        { name: 'Rekap', path: '/maintenance/recap', icon: 'recap' },
        {
          name: 'KPI',
          path: '/maintenance/KPI',
          icon: 'kpi',
          children: [
            {
              name: 'KPI Dashboard',
              path: '/maintenance/KPI',
              icon: 'dashboard',
            },
            { name: 'KPI Form', path: '/maintenance/KPIForm', icon: 'form' },
            {
              name: 'KPI Input',
              path: '/maintenance/KPI/Form/Input',
              icon: 'input',
            },
          ],
        },
        {
          name: 'Lapor',
          path: '/maintenance/lapor/ncr',
          icon: 'ncr',
          children: [
            { name: 'NCR ', path: '/maintenance/lapor/ncr', icon: 'ncr' },
            {
              name: 'CAPA ',
              path: '/maintenance/lapor/capa',
              icon: 'capa',
            },
          ],
        },
        { name: 'SPB', path: '/maintenance/spb', icon: 'service' },
        {
          name: 'Pengajuan Ke HR',
          path: '/pengajuanallkehr',
          icon: 'document',
          children: [
            {
              name: 'Pengajuan ',
              path: '/pengajuanallkehr',
              icon: 'submition',
            },
            {
              name: 'History ',
              path: '/pengajuanallkehrhistory',
              icon: 'history',
            },
          ],
        },
      ],
    },
    {
      name: 'Quality Control',
      icon: QC,
      items: [
        {
          name: 'Validate & Verify',
          path: '/qc/validatenverify',
          icon: 'validation',
        },
        {
          name: 'Quality Inspection',
          path: '/qc/qualityinspection',
          icon: 'inspection',
        },
        {
          name: 'QC Outstanding',
          path: '/qc/outstanding',
          icon: 'outstanding',
        },
        { name: 'QC Recap', path: '/qc/rekap', icon: 'recap' },
        {
          name: 'QMS',
          path: '/qc/qms',
          icon: 'qms',
          children: [
            { name: 'QMS NCR', path: '/qc/qms/ncr', icon: 'ncr' },
            { name: 'QMS CAPA', path: '/qc/qms/capa', icon: 'capa' },
          ],
        },
        {
          name: 'Lapor',
          path: '/qc/lapor',
          icon: 'qms',
          children: [
            { name: 'QC NCR Report', path: '/qc/lapor/ncr', icon: 'ncr' },
            { name: 'QC CAPA Report', path: '/qc/lapor/capa', icon: 'capa' },
          ],
        },
        { name: 'QC Absensi', path: '/qc/absensi', icon: 'attendance' },
        {
          name: 'Pengajuan Ke HR',
          path: '/pengajuanallkehr',
          icon: 'document',
          children: [
            {
              name: 'Pengajuan ',
              path: '/pengajuanallkehr',
              icon: 'submition',
            },
            {
              name: 'History ',
              path: '/pengajuanallkehrhistory',
              icon: 'history',
            },
          ],
        },
      ],
    },
    {
      name: 'QC Master Data',
      icon: MasterDataIcon,
      items: [
        {
          name: 'Document Master',
          path: '/masterdataqc/nodoc',
          icon: 'document',
        },
        {
          name: 'Final Inspection Master',
          path: '/masterdataqc/finalinspection',
          icon: 'inspection',
        },
        { name: 'QC User Master', path: '/masterdataqc/users', icon: 'users' },
        {
          name: 'Outsourcing Barang Jadi Master',
          path: '/masterdataqc/outsourcing_bj',
          icon: 'outsourcing',
        },
      ],
    },
    {
      name: 'Master Data',
      icon: MasterDataIcon,
      items: [
        {
          name: 'Machine Master',
          path: '/masterdata/machine',
          icon: 'machine',
        },
        { name: 'User Master', path: '/masterdata/masterUsers', icon: 'users' },
        { name: 'Role Master', path: '/masterdata/masterRole', icon: 'role' },
        {
          name: 'Sparepart Master',
          path: '/masterdata/mastersparepart',
          icon: 'sparepart',
        },
        {
          name: 'Analysis Master',
          path: '/masterdata/masteranalisis',
          icon: 'analysis',
        },
        {
          name: 'Monitoring Master',
          path: '/masterdata/mastermonitoring',
          icon: 'monitoring',
        },
        {
          name: 'PM1 Master',
          path: '/masterdata/masterpm1',
          icon: 'preventive',
        },
        {
          name: 'PM2 Master',
          path: '/masterdata/masterpm2',
          icon: 'preventive',
        },
        {
          name: 'PM3 Master',
          path: '/masterdata/masterpm3',
          icon: 'preventive',
        },
        { name: 'KPI Master', path: '/masterdata/masterkpi', icon: 'kpi' },
        { name: 'Grade Master', path: '/masterdata/grade', icon: 'grade' },
        {
          name: 'KPI Form Master',
          path: '/masterdata/masterkpi/form',
          icon: 'form',
        },
        { name: 'Access Master', path: '/masterHakAkses', icon: 'access' },
        { name: 'All User Master', path: '/masteruserall', icon: 'users' },
      ],
    },
    {
      name: 'Human Resources',
      icon: HRIcon,
      items: [
        {
          name: 'Personnel Management',
          path: '/hr/pm',
          icon: 'personnel',
          children: [
            {
              name: 'Master Perusahaan',
              path: '/hr/pm/masterperusahaan',
              icon: 'company',
            },
            {
              name: 'Master Karyawan',
              path: '/hr/pm/masterkaryawan',
              icon: 'employee',
            },
            {
              name: 'Kalender Kerja',
              path: '/hr/pm/kalenderKerja',
              icon: 'calendar',
            },
            { name: 'Absensi', path: '/hr/pm/absensi', icon: 'attendance' },
          ],
        },
        {
          name: 'Payroll',
          path: '/hr/payroll',
          icon: 'payroll',
          children: [
            { name: 'Payroll', path: '/hr/payroll', icon: 'payroll' },
            {
              name: 'Monthly Payroll',
              path: '/hr/payrollbulan',
              icon: 'payroll',
            },
            {
              name: 'Payroll Approval',
              path: '/hr/accpayroll',
              icon: 'approval',
            },
          ],
        },
        {
          name: 'Pengajuan',
          path: '/hr/pengajuan',
          icon: 'submission',
          children: [
            {
              name: 'Pengajuan',
              path: '/hr/pengajuan',
              icon: 'submission',
            },
            {
              name: 'Pengajuan Jabatan',
              path: '/hr/pengajuanJabatan',
              icon: 'position',
            },
            {
              name: 'Pengajuan History',
              path: '/hr/pengajuanhistory',
              icon: 'history',
            },
            {
              name: 'Pengajuan Jabatan History',
              path: '/hr/pengajuanJabatanHistory',
              icon: 'history',
            },
          ],
        },
        {
          name: 'Respon Pengajuan',
          path: '/hr/rp',
          icon: 'response',
          children: [
            {
              name: ' Pengajuan',
              path: '/hr/rp/respon',
              icon: 'response',
            },
            {
              name: ' Pengajuan History',
              path: '/hr/rp/history',
              icon: 'history',
            },
            {
              name: ' Pengajuan Jabatan',
              path: '/hr/rp/jabatan',
              icon: 'position',
            },
            {
              name: ' Pengajuan Jabatan History',
              path: '/hr/rp/jabatanHistory',
              icon: 'history',
            },
          ],
        },
        { name: 'Rekap HR', path: '/hr/rekap', icon: 'recap' },
        {
          name: 'HR Outstanding',
          path: '/hr/outstanding',
          icon: 'outstanding',
        },
        {
          name: 'Lapor',
          path: '/hr/lapor',
          icon: 'qms',
          children: [
            { name: 'HR NCR Report', path: '/hr/lapor/ncr', icon: 'ncr' },
            { name: 'HR CAPA Report', path: '/hr/lapor/capa', icon: 'capa' },
          ],
        },
      ],
    },
    {
      name: 'HR Master',
      icon: HRIcon,
      items: [
        { name: 'Shift Master', path: '/hr/master/shift', icon: 'shift' },
        {
          name: 'SP & Teguran Master',
          path: '/hr/master/spteguran',
          icon: 'warning',
        },
        {
          name: 'HR Settings Master',
          path: '/hr/master/setting',
          icon: 'settings',
        },
        { name: 'HR User Master', path: '/hr/master/users', icon: 'users' },
        {
          name: 'Department Master',
          path: '/hr/master/department',
          icon: 'department',
        },
        {
          name: 'Cuti Khusus Master',
          path: '/hr/master/cutikhusus',
          icon: 'leave',
        },
        { name: 'HR Grade Master', path: '/hr/master/grade', icon: 'grade' },
        {
          name: 'HR Payroll Master',
          path: '/hr/master/payroll',
          icon: 'payroll',
        },
      ],
    },
    {
      name: 'PPIC',
      icon: PPICIcon,
      items: [
        {
          name: 'Jadwal Produksi',
          path: '/ppic/jadwalProduksi',
          icon: 'schedule',
        },
        {
          name: 'Jadwal Kirim',
          path: '/ppic/jadwalKirim',
          icon: 'schedule',
        },
        {
          name: 'Master Kalkulasi',
          path: '/ppic/master/jadwal',
          icon: 'schedule',
        },
        {
          name: 'PPIC Outstanding',
          path: '/ppic/outstanding',
          icon: 'outstanding',
        },
        { name: 'Rekap PPIC', path: '/ppic/rekap', icon: 'recap' },
        { name: 'Laporan Waste', path: '/produksi/waste', icon: 'waste' },
        {
          name: 'Pengajuan Ke HR',
          path: '/pengajuanallkehr',
          icon: 'document',
          children: [
            {
              name: 'Pengajuan ',
              path: '/pengajuanallkehr',
              icon: 'submition',
            },
            {
              name: 'History ',
              path: '/pengajuanallkehrhistory',
              icon: 'history',
            },
          ],
        },
      ],
    },
    {
      name: 'Production',
      icon: ProductionIcon,
      items: [
        {
          name: 'Rekap Breakdown',
          path: '/produksi/breakdown',
          icon: 'breakdown',
        },
        { name: 'Laporan Waste', path: '/produksi/waste', icon: 'waste' },
        { name: 'OS2', path: '/produksi/os2', icon: 'machine' },
      ],
    },
  ];
  // NEW FUNCTION: Check if user can access department-specific master data
  const canAccessDepartmentMasterData = () => {
    const departmentMasterDataRoles = [
      'section head',
      'supervisor',
      'admin',
      'super admin',
    ];
    return departmentMasterDataRoles.includes(role?.toLowerCase());
  };

  const filterMasterDataItems = (items: MenuItem[]) => {
    if (role !== 'super admin') {
      return items.filter(
        (item) =>
          item.name !== 'Role Master' &&
          item.name !== 'All User Master' &&
          item.name !== 'Access Master',
      );
    }
    return items;
  };

  const isMaintenanceDashboard = () => {
    return (
      bagian?.toLowerCase() === 'maintenance' ||
      bagian?.toLowerCase() === 'pemeliharaan' ||
      role?.toLowerCase() === 'super admin'
    );
  };

  const isPayrollRole = () => {
    return role?.toLowerCase() === 'payroll';
  };

  const filterDashboardItems = (items: MenuItem[]) => {
    return items.filter((item) => {
      if (item.name === 'Dashboard') {
        // Only show main dashboard for maintenance bagian
        return (
          bagian?.toLowerCase() === 'maintenance' ||
          role?.toLowerCase() === 'super admin' ||
          bagian?.toLowerCase() === 'pemeliharaan'
        );
      }
      if (item.name === 'Maintenance Dashboard') {
        return isMaintenanceDashboard(); // Only show for maintenance bagian
      }
      return true;
    });
  };

  // Filter HR Master items for Payroll role
  const filterHRMasterItems = (items: MenuItem[]) => {
    if (isPayrollRole()) {
      return items.filter(
        (item) =>
          item.name === 'HR Payroll Master' || item.name === 'HR Grade Master',
      );
    }
    return items;
  };

  // Filter HR items for Payroll role
  const filterHRItems = (items: MenuItem[]) => {
    if (isPayrollRole()) {
      return items.filter(
        (item) =>
          item.name === 'Personnel Management' || item.name === 'Payroll',
      );
    }
    return items;
  };

  // Render menu items recursively
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = pathname === item.path || pathname.includes(item.path);

    if (hasChildren) {
      return (
        <SidebarLinkGroup key={item.path} activeCondition={isActive}>
          {(handleClick, open) => (
            <React.Fragment>
              <NavLink
                to="#"
                className={`group relative flex items-center mb-4 gap-5 rounded-sm py-2 px-4 font-medium !text-white duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                  isActive &&
                  '!text-[#0065DE] bg-white text-primary py-3 px-1 text-[16px]'
                } ${level > 0 ? 'ml-4' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                }}
              >
                {level === 0 && item.icon ? (
                  <IconComponent name={item.icon} size={20} />
                ) : level > 0 && item.icon ? (
                  <IconComponent name={item.icon} size={16} />
                ) : null}
                {item.name}
                <svg
                  className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                    open && 'rotate-180'
                  }`}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                    fill=""
                  />
                </svg>
              </NavLink>
              <div
                className={`translate transform overflow-hidden ${
                  !open && 'hidden'
                }`}
              >
                <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                  {item.children?.map((child) =>
                    renderMenuItem(child, level + 1),
                  )}
                </ul>
              </div>
            </React.Fragment>
          )}
        </SidebarLinkGroup>
      );
    }

    return (
      <li key={item.path}>
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `group relative flex items-center mb-4 gap-5 rounded-sm py-2 px-4 font-medium !text-white duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
              isActive &&
              '!text-[#0065DE] bg-white text-primary py-3 px-1 text-[16px]'
            } ${level > 0 ? 'ml-4' : ''}`
          }
          onClick={(e) => {
            e.preventDefault();
            navigate(item.path);
            setSidebarExpanded(true);
          }}
        >
          {item.icon && (
            <IconComponent name={item.icon} size={level === 0 ? 20 : 16} />
          )}
          {item.name}
        </NavLink>
      </li>
    );
  };

  // Render category section
  const renderCategory = (category: MenuCategory) => {
    const categoryActive = category.items.some(
      (item) =>
        pathname.includes(item.path) ||
        (item.children &&
          item.children.some((child) => pathname.includes(child.path))),
    );

    // Filter items based on role and category
    let filteredItems = category.items;

    if (category.name === 'Dashboard') {
      filteredItems = filterDashboardItems(category.items);
    } else if (category.name === 'HR Master') {
      filteredItems = filterHRMasterItems(category.items);
    } else if (category.name === 'Human Resources') {
      filteredItems = filterHRItems(category.items);
    }

    return (
      <SidebarLinkGroup key={category.name} activeCondition={categoryActive}>
        {(handleClick, open) => (
          <React.Fragment>
            <NavLink
              to="#"
              className={`group relative flex items-center mb-4 gap-5 rounded-sm py-2 px-4 font-medium !text-white duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                categoryActive &&
                '!text-[#0065DE] bg-white text-primary py-3 px-1 text-[16px]'
              }`}
              onClick={(e) => {
                e.preventDefault();
                sidebarExpanded ? handleClick() : setSidebarExpanded(true);
              }}
            >
              <img src={category.icon} alt="Icon" />
              {category.name}
              <svg
                className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                  open && 'rotate-180'
                }`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                  fill=""
                />
              </svg>
            </NavLink>
            <div
              className={`translate transform overflow-hidden ${
                !open && 'hidden'
              }`}
            >
              <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                {filteredItems.map((item) => renderMenuItem(item))}
              </ul>
            </div>
          </React.Fragment>
        )}
      </SidebarLinkGroup>
    );
  };

  // Role and bagian-based menu rendering
  const renderMenuByRoleAndBagian = () => {
    // Super admin can access everything
    if (role?.toLowerCase() === 'super admin') {
      return menuCategories.map((category) => renderCategory(category));
    }

    // Payroll role - special case for HR
    if (isPayrollRole()) {
      const hrCategories = menuCategories.filter(
        (category) =>
          category.name === 'Human Resources' || category.name === 'HR Master',
      );
      return hrCategories.map((category) => renderCategory(category));
    }

    const technicianRoles = [
      'senior technician',
      'junior technician',
      'shift technician',
    ];
    if (technicianRoles.includes(role?.toLowerCase())) {
      const filteredCategories = menuCategories
        .filter(
          (category) =>
            category.name === 'Dashboard' || category.name === 'Maintenance',
        )
        .map((category) => {
          if (category.name === 'Master Data') {
            return {
              ...category,
              items: filterMasterDataItems(category.items),
            };
          }

          if (category.name === 'Dashboard') {
            // Only show maintenance dashboard for technicians
            return {
              ...category,
              items: category.items.filter(
                (item) => item.name === 'Maintenance Dashboard',
              ),
            };
          }

          if (category.name === 'Maintenance') {
            // Only show CM and PM for technicians
            return {
              ...category,
              items: category.items.filter(
                (item) =>
                  item.name === 'Corrective (CM)' ||
                  item.name === 'Preventive Maintenance (PM)' ||
                  item.name === 'SPB',
              ),
            };
          }
          return category;
        });
      return filteredCategories.map((category) => renderCategory(category));
    }

    // Filter categories based on role and bagian
    const filteredCategories = menuCategories
      .filter((category) => {
        // Always show Dashboard
        if (category.name === 'Dashboard') {
          return true;
        }

        // Master Data access control - UPDATED LOGIC
        if (
          category.name === 'Master Data' ||
          category.name === 'QC Master Data' ||
          category.name === 'HR Master'
        ) {
          // Super admin can access all master data
          if (role === 'super admin') {
            return true;
          }

          // Check if user has department-specific master data access
          if (!canAccessDepartmentMasterData()) {
            return false;
          }

          // Department-specific master data access
          if (category.name === 'Master Data') {
            return (
              bagian?.toLowerCase() === 'maintenance' ||
              bagian?.toLowerCase() === 'pemeliharaan'
            );
          }
          if (category.name === 'QC Master Data') {
            return (
              bagian?.toLowerCase() === 'qc' ||
              bagian?.toLowerCase() === 'quality control'
            );
          }
          if (category.name === 'HR Master') {
            return (
              bagian?.toLowerCase() === 'hr' || bagian?.toLowerCase() === 'sdm'
            );
          }
        }

        // Bagian-based access for regular menus
        switch (bagian?.toLowerCase()) {
          case 'maintenance':
          case 'pemeliharaan':
            return category.name === 'Maintenance';

          case 'qc':
          case 'quality control':
            return category.name === 'Quality Control';

          case 'hr':
          case 'sdm':
            return category.name === 'Human Resources';

          case 'ppic':
            return category.name === 'PPIC';

          case 'production':
          case 'produksi':
            return category.name === 'Production';

          default:
            return false;
        }
      })
      .map((category) => {
        // Apply the super admin filtering for specific Master Data items
        if (category.name === 'Master Data') {
          return {
            ...category,
            items: filterMasterDataItems(category.items),
          };
        }
        return category;
      });

    return filteredCategories.map((category) => renderCategory(category));
  };

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-40 xl:z-40 flex h-screen flex-col overflow-y-hidden w-[270px] bg-gradient-to-b from-[#016AE6] to-[#014BA2] duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center md:justify-center gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <img src={Logo} alt="Logo" />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <ul className="mb-6 flex flex-col gap-1.5">
              {renderMenuByRoleAndBagian()}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
