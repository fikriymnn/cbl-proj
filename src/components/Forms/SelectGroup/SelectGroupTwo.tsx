import React, { useState } from 'react';
import Logo from '../../../images/icon/ceklis.svg'
import Polygon from '../../../images/icon/Polygon.svg'
import X from '../../../images/icon/x.svg'
import Strip from '../../../images/icon/strip.svg'
import None from '../../../images/icon/none.svg'

const SelectGroupTwo: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  return (
    <div className=''>


      <div className="relative z-20   w-full dark:bg-form-input">

        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
          <div className='w-6'>
            {selectedOption == 'Baik' ? <img src={Logo} alt="" /> : selectedOption == 'Catatan' ? <img src={Polygon} alt="" /> : selectedOption == 'Jelek' ? <img src={X} alt="" /> : selectedOption == 'Tidak terpasang' ? <img src={Strip} alt="" /> : ""}
          </div>

        </span>
        <select

          value={selectedOption}
          onChange={(e) => {
            setSelectedOption(e.target.value);
            changeTextColor();
          }}
          className={`relative z-20 w-full appearance-none rounded-[10px]  border-2 border-[#D9D9D9] bg-transparent py-3 px-12 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? 'text-black dark:text-white' : ''
            }`}
        >
          <option value="" disabled className="text-body dark:text-bodydark ">
            Select Result
          </option>
          <option value="Baik" className="text-body dark:text-bodydark">

            Good
          </option>
          <option value="Catatan" className="text-body dark:text-bodydark">

            Warning
          </option>
          <option value="Jelek" className="text-body dark:text-bodydark">
            Bad
          </option>
          <option value="Tidak terpasang" className="text-body dark:text-bodydark">
            Not Installed
          </option>
        </select>

        <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill="#637381"
              ></path>
            </g>
          </svg>
        </span>
      </div>
    </div>
  );
};

export default SelectGroupTwo;
