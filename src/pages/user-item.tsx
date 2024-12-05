import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FC } from 'react';

interface UserItemProps {
    user: {
        id: number;
        name: string;
        email: string;
        hour: string;
    };
}
const UserItem: FC<UserItemProps> = (props) => {
    const { id, name, email, hour } = props.user;
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,

    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className='bg-blue-100 h-full px-3 py-2 rounded shadow-md grid grid-cols-12 w-full'
        >
            <p className='text-sm text-stone-4  00 font-semibold'>{hour}</p>
            <p className='text-sm text-stone-4  00 font-semibold col-span-3'>{name}</p>
            <p className='text-sm text-stone-4  00 font-semibold col-span-4'>{email}</p>
            {/* <button {...attributes} {...listeners} className='cursor-move'>
        Drag
      </button> */}
        </div>
    );
};

export default UserItem;