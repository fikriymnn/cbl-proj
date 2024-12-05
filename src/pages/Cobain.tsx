import { useState } from 'react';
import UserItem from './user-item';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import ModalKosongan from '../components/Modals/Qc/NCR/NCRResponQC';

type User = {
  id: number;
  name: string;
  email: string;
  hour: string;
};

const dummyData: User[] = [
  {
    id: 1,
    name: 'JO-24-0001',
    email: 'Customer Alfamart 1',
    hour: '8:00',
  },
  {
    id: 2,
    name: 'JO-24-0001',
    email: 'Customer Alfamart 2',
    hour: '9:00',
  },
  {
    id: 3,
    name: 'JO-24-0001',
    email: 'Customer Alfamart 3',
    hour: '10:00',
  },
  {
    id: 4,
    name: 'JO-24-0001',
    email: 'Customer Alfamart 4',
    hour: '11:00',
  },
  {
    id: 5,
    name: 'JO-24-0002',
    email: 'Customer Indomart 5',
    hour: '12:00',
  },
  {
    id: 6,
    name: 'JO-24-0002',
    email: 'Customer Indomart 6',
    hour: '13:00',
  },
  {
    id: 7,
    name: 'JO-24-0002',
    email: 'Customer Indomart 7',
    hour: '14:00',
  },
  {
    id: 8,
    name: 'JO-24-0002',
    email: 'Customer Indomart 8',
    hour: '15:00',
  },
  {
    id: 9,
    name: 'JO-24-0002',
    email: 'Customer Indomart 9',
    hour: '16:00',
  },
  {
    id: 10,
    name: 'JO-24-0003',
    email: 'Customer Tio 10',
    hour: '17:00',
  },
  {
    id: 11,
    name: 'JO-24-0003',
    email: 'Customer Tio 11',
    hour: '18:00',
  },
  {
    id: 12,
    name: 'JO-24-0003',
    email: 'Customer Tio 12',
    hour: '19:00',
  },
];
const mesin = [
  {
    id: 1,
    name: 'R700',

  },
  {
    id: 2,
    name: 'SM',

  },
  {
    id: 3,
    name: 'HOCK',

  },
  {
    id: 4,
    name: 'MANUAL',

  },
]
const Cobain = () => {
  const [userList, setUserList] = useState<User[]>(dummyData);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function
    handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = userList.findIndex((item) => item.id === active.id);
      const newIndex = userList.findIndex((item) => item.id === over.id);

      const newUserList = arrayMove(userList, oldIndex, newIndex);


      // Update hours based on new indices
      const updatedUserList = newUserList.map((user, index) => {
        return {
          ...user,
          hour:
            index === 0 ? '8:00' :
              index === 1 ? '9:00' :
                index === 2 ? '10:00' :
                  index === 3 ? '11:00' :
                    index === 4 ? '12:00' :
                      index === 5 ? '13:00' :
                        index === 6 ? '14:00' :
                          index === 7 ? '15:00' :
                            index === 8 ? '16:00' :
                              index === 9 ? '17:00' :
                                index === 10 ? '18:00' :
                                  index === 11 ? '19:00' : ''

        };
      });
      setUserList(updatedUserList);
      console.log(updatedUserList)
    }

  }
  const [showModal1, setShowModal1] = useState<any>([]);
  const openModal1 = (i: any) => {
    const onchangeVal: any = [...showModal1];

    onchangeVal[i] = true;

    setShowModal1(onchangeVal);
  };
  const closeModal1 = (i: any) => {
    const onchangeVal: any = [...showModal1];
    onchangeVal[i] = false;

    setShowModal1(onchangeVal);
  };

  return (
    <div className="max-w-screen ">
      <h2 className="text-2xl font-bold mb-4"> List Mesin</h2>
      {mesin.map((data: any, i: number) => (
        <>
          <div className='flex w-full '>
            <button
              onClick={() => openModal1(i)}
              className='bg-blue-600 min-w-40 text-white border-2 border-stroke font-semibold text-xl'>
              {data.name}
            </button >
            {
              showModal1[i] == true && (
                <>
                  <ModalKosongan

                    isOpen={showModal1[i]}
                    onClose={() => closeModal1(i)}
                    judul={'D&D'} >
                    <>
                      <div className='flex flex-col gap-2 py-5 min-h-screen overflow-y-scroll'>
                        <div
                          className='bg-blue-200 h-full px-3 py-2 rounded shadow-md grid grid-cols-12 w-full'
                        >
                          <p className='text-md font-semibold'>JAM</p>
                          <p className='text-md font-semibold col-span-3'>NO. JO</p>
                          <p className='text-md font-semibold col-span-4'>CUSTOMER</p>
                        </div>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                          modifiers={[restrictToVerticalAxis]}
                        >
                          <SortableContext items={userList}
                            strategy={verticalListSortingStrategy}>
                            {userList.map((user) => (
                              <UserItem key={user.id} user={user} />
                            ))}
                          </SortableContext>
                        </DndContext>
                      </div>
                    </>
                  </ModalKosongan>
                </>
              )
            }
          </div >

        </>
      )
      )}

    </div >
  );
};
export default Cobain;