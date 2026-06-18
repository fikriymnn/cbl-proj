import FGBooking from '../../components/Tables/GudangFG/FGBooking';
import DefaultLayout from '../../layout/DefaultLayout';

const FGBookingJo = () => {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Gudang FG &gt; Booking JO
        </p>
        <FGBooking />
      </>
    </DefaultLayout>
  );
};

export default FGBookingJo;
