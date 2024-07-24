import React, { ReactNode } from 'react';

const Layout2: React.FC<{ children: ReactNode }> = ({ children }) => {

    return (

        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden md:px-12 py-2 bg-[#D8EAFF]">
            <main>
                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout2;
