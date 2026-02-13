import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import Logo from '../../images/logo/logo-cbl 2.svg';
const WelcomePage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="w-full h-full">
          {/* Main Welcome Card */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-[20px] shadow-xl p-12 mb-8 border border-blue-100">
            <div className="text-center mb-8">
              <div className="inline-block mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <img src={Logo} alt="Logo" />
                </div>
              </div>
              <h1 className="text-7xl font-bold text-primary mb-4 animate-fade-in">
                Welcome
              </h1>
              <p className="text-2xl text-gray-700 font-medium mb-2">
                to CBL ERP SYSTEM
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </DefaultLayout>
  );
};

export default WelcomePage;
