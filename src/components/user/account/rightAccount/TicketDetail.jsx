import { IoMdCloseCircleOutline } from "react-icons/io";
import { formatImage } from "@/utils/formatImage";
const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
import { formatCurrency, formatDate, formatTime } from "@/utils/format";

export default function TicketDetail({ order, setToggleShowTicket }) {
  return (
    <div className="border-t-8 border-[var(--accent-color)] bg-[var(--secondary-dark)] w-96 rounded-lg shadow-lg p-5 relative max-h-[90vh] overflow-y-auto">
      {/* Close button */}
      <button
        onClick={() => setToggleShowTicket(false)}
        className="absolute top-2 right-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <IoMdCloseCircleOutline className="w-6 h-6" />
      </button>

      {/* Movie image */}
      <div className="flex justify-center items-center w-full h-28">
        <img
          src={formatImage(order?.Showtime?.Movie?.poster)}
          alt={order?.Showtime?.Movie?.name}
          className="h-full object-cover rounded-lg"
        />
      </div>

      {/* Movie details */}
      <h2 className="mt-3 text-lg font-semibold text-center text-[var(--text-primary)]">
        {order?.Showtime?.Movie?.name}
      </h2>
      <div className="flex items-center justify-center mt-1">
        <p className="text-center text-[var(--text-secondary)] text-sm">2D Subtitles</p>
        <div className="flex justify-center items-center">
          <span className="text-xs font-bold text-[var(--text-primary)] bg-[var(--accent-color)] ml-2 px-2 py-0.5 rounded-md">
            T18
          </span>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-3 border-[var(--primary-dark)]" />

      {/* Cinema and session details */}
      <div className="text-[var(--text-primary)] space-y-1">
        <p className="text-center text-sm">
          <span className="font-semibold">
            {order?.Showtime?.Room?.Cinema?.name}
          </span>
        </p>
        <p className="text-center text-sm">
          Showtime:{" "}
          <span className="font-semibold">
            {formatTime(order?.Showtime?.start_time)} -{" "}
            {formatDate(order?.Showtime?.show_date)}
          </span>
        </p>
        <p className="text-center text-sm">
          <span className="font-semibold">
            {order?.Showtime?.Room?.name} - Seats:{" "}
            {order?.Tickets?.map(
              (ticket) => `${ticket.Seat?.seat_row}${ticket.Seat?.seat_number}`
            ).join(", ")}
          </span>{" "}
        </p>
        <hr className="my-3 border-[var(--primary-dark)]" />

        <div className="text-center">
          <p className="text-sm">Ticket code:</p>
          <div className="flex justify-center py-2">
            <img
              src={
                order?.qr_code.startsWith("http")
                  ? order?.qr_code
                  : `${VITE_SOCKET_URL}${order?.qr_code}`
              }
              alt="QR Code"
              className="w-32 h-32 object-contain bg-white p-2 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-3 border-[var(--primary-dark)]" />

      {/* Ticket details */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">Stars</p>
          <p className="font-semibold text-[var(--text-primary)]">3</p>
        </div>
        <div>
          <p className="text-sm text-[var(--text-secondary)]">Price</p>
          <p className="font-semibold text-[var(--accent-color)]">{formatCurrency(order?.total)}</p>
        </div>
      </div>
    </div>
  );
}
