import React, { useEffect, useState } from 'react'
import DefaultLayout from '../layout/DefaultLayout'
import Loading from '../components/Loading';
import axios from 'axios';

function ProfilSetting() {
    useEffect(() => {

        getuser();
    }, []);
    const [user, setUser] = useState<any>();
    async function getuser() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });
    
            setUser(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState<any>();
  const [bagian, setBagian] = useState<any>();
  const [nama, setNama] = useState<any>();
  const [no, setNo] = useState<any>();
 const [nik, setNik] = useState<any>();
  const [password1, setPassword1] = useState<any>('');
  const [confpassword1, setConfPassword1] = useState<any>('');

  async function submitEditUser(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/users/${id}`;

    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          email: email,
          nama: nama,
          no: no,
          nik:nik,
          password: password1,
          confPassword: confpassword1,
        },
        {
          withCredentials: true,
        },
      );
      console.log(res.data);
      setIsLoading(false);
      alert(res.data.msg);
      
    } catch (error: any) {
      console.log(error);
      //alert(error.data.msg);
      setIsLoading(false);
    }
  }
  
  return (
    <DefaultLayout>
    <div>
    <div className="flex flex-col pt-4  bg-white p-3 ">
       
            <>
            
              <label className="text-black text-xs font-bold">EMAIL</label>
              <input
                defaultValue={user?.email}
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
              />
              <label className="text-black text-xs font-bold pt-4">NAMA</label>
              <input
                 defaultValue={user?.nama}
                onChange={(e) => setNama(e.target.value)}
                type="text"
                className="w-full h-10  self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
              />
              <label className="text-black text-xs font-bold pt-4">NIK</label>
              <input
               defaultValue={user?.nik}
               onChange={(e) => setNik(e.target.value)}
                type="text"
                className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
              />

              <label className="text-black text-xs font-bold pt-4">
                NOMOR TELEPON
              </label>
              <input
                defaultValue={user?.no}
                onChange={(e) => setNo(e.target.value)}
                type="text"
                className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
              />

            
              
              
              <label className="text-black text-xs font-bold pt-4">
                PASSWORD BARU
              </label>
              <input
                id="newpassword"
                placeholder="Masukkan Password "
                required
                type="password"
                onChange={(e) => setPassword1(e.target.value)}
                className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
              />
              <div className="flex flex-row justify-between w-full">
                <label className="text-black text-xs font-bold pt-4">
                  KONFIRMASI PASSWORD BARU
                </label>
                {/* {!passwordMatch && <label className=' text-red-600 text-xs font-bold pt-4 '> PASSWORD TIDAK COCOK </label>} */}
              </div>
              <input
                // className={`... ${!passwordMatch ? 'w-full h-10 self-stretch p-4 bg-white rounded-md  justify-start items-center gap-4 inline-flex border border-red-500' : 'w-full h-10 self-stretch p-4 bg-white rounded-md border border-stroke  justify-start items-center gap-4 inline-flex'} ...`}
                id="confirmoldpassword"
                placeholder="Masukkan Password Konfirmasi"
                type="password"
                // onChange={(e) => setConfPassword1(e.target.value)}
                className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
              />

              <div className="pt-4">
                <button
                  disabled={isLoading}
                   onClick={() => submitEditUser(user?.uuid)}
                  className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                >
                  {isLoading ? 'Loading...' : 'SIMPAN'}
                </button>
                {isLoading && <Loading />}
              </div>
            </>
        
            </div>
    </div>

    </DefaultLayout>
  )
}

export default ProfilSetting
