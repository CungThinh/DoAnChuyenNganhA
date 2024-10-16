import { formatDuration } from "@/utils";
import { Tooltip } from "@nextui-org/tooltip";


const FlightCard = ({ flight, onSelect, leg, isSelectedFlight }) => {
    return (
        <div className="flex flex-col gap-y-3 bg-white p-4 border-small">
            {flight.flights.map((legData, index) => (
                <div key={index}>
                    <div className="grid grid-cols-[calc(100%_-_160px)_160px] justify-between sm:grid-cols-[calc(100%_-_240px)_240px]">
                        <div className="flex grow flex-col-reverse sm:flex-row">
                            {/* Logo và số hiệu chuyến bay */}
                            <div className="flex items-center space-x-2 default:shrink-0 w-full shrink-0 sm:w-1/2">
                                <img
                                    className="h-6 w-6 max-w-full object-contain object-center"
                                    src={legData.airline_logo}
                                    alt="logo"
                                />
                                <div className="flex flex-col justify-between overflow-hidden whitespace-nowrap text-start text-xs lg:text-sm max-h-[68px]">
                                    <div>{legData.airline}</div>
                                    <div className="flex flex-col gap-y-1 whitespace-nowrap shadow-md text-black">
                                        {legData.flight_number}
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin thời gian, sân bay */}
                            <div className="flex w-full shrink-0 items-center justify-between gap-2 overflow-hidden xs:justify-start xs:gap-4 sm:w-1/2 sm:px-2">
                                <div className="shrink-0 space-y-1 text-center w-[60px]">
                                    <div className="font-semibold xl:text-md">
                                        {legData.departure_airport.time.split(" ")[1]}
                                    </div>
                                    <Tooltip
                                        content={<span>{legData.departure_airport.name}</span>}
                                        placement="bottomStart"
                                        showArrow={true}
                                        radius="none"
                                    >
                                        <div className="font-semibold xl:text-md text-slate-400">
                                            {legData.departure_airport.id}
                                        </div>
                                    </Tooltip>
                                </div>

                                {/* Tuyến bay */}
                                <Tooltip
                                    content={<span>{legData.arrival_airport.name}</span>}
                                    placement="bottom"
                                    showArrow={true}
                                    radius="none"
                                >
                                    <div className="flex w-1/2 flex-col justify-between space-y-1 overflow-hidden">
                                        <div className="overflow-hidden text-center text-xs text-black">
                                            <span className="inline-block truncate whitespace-nowrap">
                                                {formatDuration(legData.duration)}
                                            </span>
                                        </div>
                                        <div className="relative flex justify-between">
                                            <div className="h-1.5 w-1.5 rounded-full bg-black"></div>
                                            <div className="h-1.5 w-1.5 rounded-full bg-black"></div>
                                            <div className="h-1.5 w-1.5 rounded-full bg-black"></div>
                                            <div className="absolute top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-black"></div>
                                        </div>
                                        <div className="text-center text-sm text-slate-400">
                                            <span>{flight.layovers ? "Layover" : "Bay thẳng"}</span>
                                        </div>
                                    </div>
                                </Tooltip>
                                <div className="shrink-0 space-y-1 text-center">
                                    <div className="font-semibold xl:text-md">
                                        {legData.arrival_airport.time.split(" ")[1]}
                                    </div>
                                    <Tooltip
                                        content={<span>{legData.arrival_airport.name}</span>}
                                        placement="bottomStart"
                                        showArrow={true}
                                        radius="none"
                                    >
                                        <div className="font-semibold xl:text-md text-slate-400">
                                            {legData.arrival_airport.id}
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin giá tiền và nút chọn */}
                        {index === 0 && (
                            <div className="flex w-full items-center justify-end space-x-3">
                                <div className="space-y-1 text-end">
                                    <div className="whitespace-nowrap text-md font-semibold">
                                        {flight.price ? flight.price.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        }) : "Không có thông tin giá"}
                                    </div>
                                    <div className="whitespace-nowrap text-xs text-black">
                                        {leg === "outbound" ? "Chiều đi" : "Chiều về"}
                                    </div>
                                </div>

                                <button
                                    onClick={onSelect}
                                    className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
                                >
                                    {isSelectedFlight ? "Chọn lại" : "Chọn"}
                                </button>
                            </div>
                        )}
                        {index < flight.flights.length - 1 && (
                            <div className="my-4 border-t border-gray-200"></div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FlightCard;
