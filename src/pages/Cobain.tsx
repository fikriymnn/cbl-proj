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

  return (
    <div className="max-w-2xl mx-auto grid gap-2 my-10">
      <h2 className="text-2xl font-bold mb-4">User List</h2>
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
  );
};
export default Cobain;