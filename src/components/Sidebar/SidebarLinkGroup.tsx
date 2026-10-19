import { ReactNode, useState } from 'react';

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, open: boolean) => ReactNode;
  activeCondition: boolean;
  forceOpen?: boolean; // baru: dipakai saat search aktif
}

const SidebarLinkGroup = ({
  children,
  activeCondition,
  forceOpen = false,
}: SidebarLinkGroupProps) => {
  const [open, setOpen] = useState<boolean>(activeCondition);

  const handleClick = () => {
    setOpen(!open);
  };

  return <li>{children(handleClick, forceOpen || open)}</li>;
};

export default SidebarLinkGroup;
