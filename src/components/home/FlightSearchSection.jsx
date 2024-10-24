import { useState, useRef, useEffect } from "react";
import {
  FaPlane,
  FaExchangeAlt,
  FaCalendarAlt,
  FaSearch,
  FaUser,
  FaCaretDown,
  FaCheck,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import airportsData from "../../../public/airports.json";
import { removeVietnameseTones } from "@/utils";
import { useRouter } from "next/navigation";

export default function FlightSearchSection() {
  const [tripOption, setTripOption] = useState("Một chiều"); // Đổi tên biến để tránh xung đột
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const [dropdownOptionOpen, setDropdownOptionOpen] = useState(false);
  const [dropdownPassengersOpen, setDropdownPassengersOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [airportSuggestions, setAirportSuggestions] = useState([]);
  const [isFromFocused, setIsFromFocused] = useState(false);
  const [isToFocused, setIsToFocused] = useState(false);

  const optionDropdownRef = useRef(null); // ref cho dropdown lựa chọn (Một chiều, Khứ hồi...)
  const passengersDropdownRef = useRef(null); // ref cho dropdown hành khách
  const fromDropdownRef = useRef(null); // ref cho dropdown "Điểm đi"
  const toDropdownRef = useRef(null); // ref cho dropdown "Điểm đến"
  const router = useRouter();

  // Hàm tính tổng số lượng hành khách
  const getTotalPassengers = () => {
    return passengers.adults + passengers.children + passengers.infants;
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  // Hàm tìm kiếm sân bay
  const handleAirportSearch = async (e, isFromField) => {
    const query = e.target.value.toLowerCase();

    // Bỏ dấu tiếng Việt khỏi từ khóa tìm kiếm để tăng độ linh hoạt
    const normalizedQuery = removeVietnameseTones(query);

    if (isFromField) {
      setFrom(e.target.value); // Cập nhật giá trị nhập vào input
      setIsFromFocused(true);
      setIsToFocused(false);
    } else {
      setTo(e.target.value); // Cập nhật giá trị nhập vào input
      setIsFromFocused(false);
      setIsToFocused(true);
    }

    // Sử dụng hàm debounce để tránh gọi nhiều lần liên tiếp
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Lọc danh sách sân bay
    const filteredAirports = airportsData
      .flatMap((region) => region.airports)
      .filter((airport) => {
        const airportNameNormalized = removeVietnameseTones(
          airport.name?.toLowerCase() || "",
        );
        const cityNormalized = removeVietnameseTones(
          airport.city?.toLowerCase() || "",
        );
        const countryNormalized = removeVietnameseTones(
          airport.country?.toLowerCase() || "",
        );
        const iataNormalized = airport.iata?.toLowerCase() || "";

        return (
          airportNameNormalized.includes(normalizedQuery) ||
          cityNormalized.includes(normalizedQuery) ||
          iataNormalized.includes(normalizedQuery) ||
          countryNormalized.includes(normalizedQuery)
        );
      });

    if (filteredAirports.length > 0) {
      setAirportSuggestions(filteredAirports);
    } else {
      setAirportSuggestions([{ iata: "", name: "Nothing found." }]);
    }
  };

  // Hàm chọn sân bay
  const selectAirport = (airport, isFromField) => {
    const selectedAirport = `${airport.iata}, ${airport.city}`;

    if (isFromField) {
      if (selectedAirport === to) {
        alert("Điểm đi và điểm đến không thể giống nhau.");
      } else {
        setFrom(selectedAirport);
        setIsFromFocused(false);
      }
    } else {
      if (selectedAirport === from) {
        alert("Điểm đi và điểm đến không thể giống nhau.");
      } else {
        setTo(selectedAirport);
        setIsToFocused(false);
      }
    }
    setAirportSuggestions([]); // Đặt lại danh sách gợi ý sau khi chọn
  };

  // Hàm tăng/giảm số lượng hành khách
  const handlePassengerChange = (type, operation) => {
    setPassengers((prev) => {
      let newValue = prev[type];

      // Kiểm tra nút tăng
      if (operation === "increase") {
        if (getTotalPassengers() < 9) {
          // Giới hạn tổng hành khách không vượt quá 9
          if (type === "adults" && newValue < 9) {
            newValue += 1;
          } else if (type === "children" && newValue < 8) {
            newValue += 1;
          } else if (type === "infants" && newValue < passengers.adults) {
            newValue += 1;
          } else if (type === "infants" && newValue >= passengers.adults) {
            setErrorMessage(
              "Số lượng trẻ sơ sinh không được nhiều hơn số lượng người lớn",
            );
            return prev;
          }
        } else {
          setErrorMessage(
            "Số lượng hành khách không vượt quá 9 người trong một lần đặt chỗ",
          );
        }
      }

      // Kiểm tra nút giảm
      if (operation === "decrease") {
        if (type === "adults" && newValue > 1) {
          if (passengers.infants > newValue - 1) {
            setErrorMessage(
              "Số lượng trẻ sơ sinh không được ít hơn số lượng người lớn",
            );
          } else {
            newValue -= 1;
            setErrorMessage("");
          }
        } else if (type !== "adults" && newValue > 0) {
          newValue -= 1;
        }
      }

      return { ...prev, [type]: newValue };
    });
  };

  // Toggle dropdown mở/đóng cho tùy chọn hành trình (Một chiều, Khứ hồi, ...)
  const toggleOptionDropdown = () => {
    setDropdownOptionOpen(!dropdownOptionOpen);
    if (dropdownPassengersOpen) setDropdownPassengersOpen(false);
  };

  // Toggle dropdown mở/đóng cho hành khách
  const togglePassengersDropdown = () => {
    setDropdownPassengersOpen(!dropdownPassengersOpen);
    if (dropdownOptionOpen) setDropdownOptionOpen(false);
  };

  // Hàm đóng dropdown khi click ra ngoài vùng dropdown
  const handleClickOutside = (e) => {
    if (
      optionDropdownRef.current &&
      !optionDropdownRef.current.contains(e.target) &&
      passengersDropdownRef.current &&
      !passengersDropdownRef.current.contains(e.target) &&
      fromDropdownRef.current &&
      !fromDropdownRef.current.contains(e.target) &&
      toDropdownRef.current &&
      !toDropdownRef.current.contains(e.target)
    ) {
      setDropdownOptionOpen(false); // Đóng dropdown lựa chọn hành trình
      setDropdownPassengersOpen(false); // Đóng dropdown hành khách
      setIsFromFocused(false); // Đóng dropdown "Điểm đi"
      setIsToFocused(false); // Đóng dropdown "Điểm đến"
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Thêm logic tự động đổi sang khứ hồi khi chọn ngày về
  const handleReturnDateChange = (date) => {
    setReturnDate(date);
    if (date && tripOption === "Một chiều") {
      setTripOption("Khứ hồi");
    } else if (!date && tripOption === "Khứ hồi") {
      setTripOption("Một chiều");
    }
  };

  const handleSearch = () => {
    if (from && to && departureDate) {
      const fromCode = from.split(",")[0].trim();
      const toCode = to.split(",")[0].trim();

      const flightType = returnDate ? "1" : "2"; // 1: Khứ hồi, 2: Một chiều

      // Lưu loại vé vào localStorage để sử dụng trên trang booking details
      localStorage.setItem("flightType", flightType);

      router.push(
        `/flight-result?engine=google_flights&departure_id=${encodeURIComponent(fromCode)}&arrival_id=${encodeURIComponent(toCode)}&outbound_date=${departureDate.toISOString().split("T")[0]}&return_date=${returnDate ? returnDate.toISOString().split("T")[0] : ""}&currency=VND&hl=vi&gl=vn&api_key=01c66bdf6c895db5475ec52d592b15c0101d368c0b772891ef6ff8ed20b9beae&type=${flightType}`,
      );
    } else {
      alert("Vui lòng điền đầy đủ thông tin điểm đi, điểm đến và ngày đi.");
    }
  };

  // Thêm state để quản lý nhiều chặng
  const [multiLegFlights, setMultiLegFlights] = useState([
    { from: "", to: "", departureDate: null },
  ]);

  // Hàm thêm chặng mới
  const addLeg = () => {
    if (multiLegFlights.length < 5) {
      setMultiLegFlights([
        ...multiLegFlights,
        { from: "", to: "", departureDate: null },
      ]);
    }
  };

  // Hàm xóa chặng
  const removeLeg = (index) => {
    const newLegs = [...multiLegFlights];
    newLegs.splice(index, 1);
    setMultiLegFlights(newLegs);
  };

  // Hàm cập nhật thông tin của mỗi chặng
  const updateLeg = (index, field, value) => {
    const newLegs = [...multiLegFlights];
    newLegs[index][field] = value;
    setMultiLegFlights(newLegs);
  };

  // Hàm tìm kiếm sân bay, tương tự như hàm "handleAirportSearch" cho mỗi chặng
  const handleMultiLegAirportSearch = (e, index, field) => {
    const value = e.target.value;
    updateLeg(index, field, value);
  };

  const videoSrc = "./videos/video-bg.mp4";

  // Add pagination logic for the flight routes section
  return (
    <div className="relative h-screen" style={{ height: "950px" }}>
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        className="absolute left-0 top-0 z-0 size-full object-cover"
        src={videoSrc} // Sử dụng video hiện tại từ state
      />
      <div className="absolute left-[310px] top-[190px] text-left">
        <h1 className="text-4xl font-bold text-white">
          Săn vé máy bay giá rẻ cùng VEMAYBAY
        </h1>
        <p className="mt-2 text-lg text-white">
          Khám phá ngay những ưu đãi tốt nhất dành cho bạn!
        </p>
      </div>
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="mx-auto w-full max-w-7xl rounded-lg bg-white bg-opacity-90 p-6 shadow-lg">
          {/* Form search */}
          <div className="mb-4 flex space-x-4">
            {/* Cột "Một chiều" */}
            <div
              className="relative flex h-[38px] cursor-pointer items-center rounded-lg bg-white p-3"
              style={{ width: "auto", minWidth: "150px", maxWidth: "100%" }}
              onClick={toggleOptionDropdown}
              ref={optionDropdownRef}
            >
              <FaPlane className="mr-2 text-gray-500" />
              <span
                className="flex items-center space-x-2 overflow-hidden text-black"
                style={{ color: "black" }}
              >
                <span>{tripOption}</span>
              </span>
              <FaCaretDown className="ml-2 text-gray-500" />

              {dropdownOptionOpen && (
                <div className="absolute left-10 top-9 z-20 mt-1 w-[170px] rounded-lg bg-white shadow-lg">
                  <div
                    className="flex cursor-pointer items-center justify-between p-2 hover:bg-white"
                    style={{ color: "black" }}
                    onClick={() => setTripOption("Một chiều")}
                  >
                    Một chiều
                    {tripOption === "Một chiều" && (
                      <FaCheck
                        className="text-orange-500"
                        style={{ strokeWidth: "1px" }}
                      />
                    )}
                  </div>
                  <div
                    className="flex cursor-pointer items-center justify-between p-2 hover:bg-white"
                    style={{ color: "black" }}
                    onClick={() => setTripOption("Khứ hồi")}
                  >
                    Khứ hồi
                    {tripOption === "Khứ hồi" && (
                      <FaCheck
                        className="text-orange-500"
                        style={{ strokeWidth: "1px" }}
                      />
                    )}
                  </div>
                  <div
                    className="flex cursor-pointer items-center justify-between p-2 hover:bg-white"
                    style={{ color: "black" }}
                    onClick={() => setTripOption("Nhiều chặng")}
                  >
                    Nhiều chặng
                    {tripOption === "Nhiều chặng" && (
                      <FaCheck
                        className="text-orange-500"
                        style={{ strokeWidth: "1px" }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cột "1 Người lớn" */}
            <div
              className="relative flex h-[38px] cursor-pointer items-center rounded-lg bg-white p-3"
              style={{ width: "auto", minWidth: "150px", maxWidth: "100%" }}
              onClick={togglePassengersDropdown}
              ref={passengersDropdownRef}
            >
              <FaUser className="mr-2 text-gray-500" />
              <span className="flex items-center space-x-2 overflow-hidden text-black">
                <span>{passengers.adults} Người lớn</span>
                {passengers.children > 0 && (
                  <span>{passengers.children} Trẻ em</span>
                )}
                {passengers.infants > 0 && (
                  <span>{passengers.infants} Em bé</span>
                )}
              </span>
              <FaCaretDown className="ml-2 text-gray-500" />

              {dropdownPassengersOpen && (
                <div
                  className="absolute left-0 top-12 z-20 mt-1 w-[300px] rounded-lg bg-white shadow-lg"
                  ref={passengersDropdownRef}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="p-3">
                    {/* Người lớn */}
                    <div className="mb-2 flex cursor-default items-center justify-between">
                      <span className="text-black">Người lớn</span>
                      <div className="flex items-center">
                        <button
                          className="cursor-pointer rounded bg-gray-300 px-4 py-1 text-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePassengerChange("adults", "decrease");
                          }}
                        >
                          -
                        </button>
                        <span className="mx-4 text-black">
                          {passengers.adults}
                        </span>
                        <button
                          className="cursor-pointer rounded bg-orange-500 px-4 py-1 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePassengerChange("adults", "increase");
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <hr className="my-2 border-gray-300" />

                    {/* Trẻ em */}
                    <div className="mb-2 flex cursor-default items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-black">Trẻ em</span>
                        <p className="text-sm text-gray-500">
                          2-11 tuổi tại thời điểm diễn ra chuyến đi
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          className="cursor-pointer rounded bg-gray-300 px-4 py-1 text-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePassengerChange("children", "decrease");
                          }}
                        >
                          -
                        </button>
                        <span className="mx-4 text-black">
                          {passengers.children}
                        </span>
                        <button
                          className="cursor-pointer rounded bg-orange-500 px-4 py-1 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePassengerChange("children", "increase");
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <hr className="my-2 border-gray-300" />

                    {/* Em bé */}
                    <div className="mb-2 flex cursor-default items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-black">Em bé</span>
                        <p className="text-sm text-gray-500">
                          Dưới 2 tuổi tại thời điểm đi
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          className="cursor-pointer rounded bg-gray-300 px-4 py-1 text-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePassengerChange("infants", "decrease");
                          }}
                        >
                          -
                        </button>
                        <span className="mx-4 text-black">
                          {passengers.infants}
                        </span>
                        <button
                          className="cursor-pointer rounded bg-orange-500 px-4 py-1 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePassengerChange("infants", "increase");
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Hiển thị thông báo lỗi nếu có */}
                    {errorMessage && (
                      <p className="mt-2 text-sm text-red-500">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {(tripOption === "Một chiều" || tripOption === "Khứ hồi") && (
            <div className="mb-4 flex items-center space-x-4">
              {/* Cột "Khởi hành từ" */}
              <div className="relative w-[22%]" ref={fromDropdownRef}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                  className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500"
                >
                  <path
                    d="M381 114.9L186.1 41.8c-16.7-6.2-35.2-5.3-51.1 2.7L89.1 67.4C78 73 77.2 88.5 87.6 95.2l146.9 94.5L136 240 77.8 214.1c-8.7-3.9-18.8-3.7-27.3 .6L18.3 230.8c-9.3 4.7-11.8 16.8-5 24.7l73.1 85.3c6.1 7.1 15 11.2 24.3 11.2l137.7 0c5 0 9.9-1.2 14.3-3.4L535.6 212.2c46.5-23.3 82.5-63.3 100.8-112C645.9 75 627.2 48 600.2 48l-57.4 0c-20.2 0-40.2 4.8-58.2 14L381 114.9zM0 480c0 17.7 14.3 32 32 32l576 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 448c-17.7 0-32 14.3-32 32z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Khởi hành từ"
                  value={from}
                  onChange={(e) => handleAirportSearch(e, true)}
                  className="w-full rounded-lg border bg-white p-3 pl-10 text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                {isFromFocused && from.length > 0 && (
                  <div className="absolute top-full z-20 mt-1 max-h-80 w-[400px] overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                    {airportSuggestions.map((airport) => (
                      <div
                        key={airport.iata}
                        className="cursor-pointer border-b border-gray-200 p-4 hover:bg-white"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectAirport(airport, true)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-black">
                            {airport.city}, {airport.country}
                          </div>
                          <div className="text-sm text-gray-500">
                            {airport.iata}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          <FaPlane className="mr-2 inline-block text-gray-400" />
                          {airport.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nút hoán đổi */}
              <button onClick={handleSwap} className="mx-2">
                <FaExchangeAlt className="text-gray-500" />
              </button>

              {/* Cột "Điểm đến" */}
              <div className="relative w-[21%]" ref={toDropdownRef}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                  className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500"
                >
                  <path
                    d="M.3 166.9L0 68C0 57.7 9.5 50.1 19.5 52.3l35.6 7.9c10.6 2.3 19.2 9.9 23 20L96 128l127.3 37.6L181.8 20.4C178.9 10.2 186.6 0 197.2 0l40.1 0c11.6 0 22.2 6.2 27.9 16.3l109 193.8 107.2 31.7c15.9 4.7 30.8 12.5 43.7 22.8l34.4 27.6c24 19.2 18.1 57.3-10.7 68.2c-41.2 15.6-86.2 18.1-128.8 7L121.7 289.8c-11.1-2.9-21.2-8.7-29.3-16.9L9.5 189.4c-5.9-6-9.3-14.1-9.3-22.5zM32 448l576 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32zm96-80a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm128-16a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Nơi đến"
                  value={to}
                  onChange={(e) => handleAirportSearch(e, false)}
                  className="w-full rounded-lg border bg-white p-3 pl-10 text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                {isToFocused && to.length > 0 && (
                  <div className="absolute top-full z-20 mt-1 max-h-80 w-[400px] overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                    {airportSuggestions.map((airport) => (
                      <div
                        key={airport.iata}
                        className="cursor-pointer border-b border-gray-200 p-4 hover:bg-white"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectAirport(airport, false)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-black">
                            {airport.city}, {airport.country}
                          </div>
                          <div className="text-sm text-gray-500">
                            {airport.iata}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          <FaPlane className="mr-2 inline-block text-gray-400" />
                          {airport.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ngày khởi hành và Ngày về */}
              <div className="flex h-[50px] w-[38%] items-center rounded-lg border bg-white p-3">
                <FaCalendarAlt className="mr-2 text-gray-500" />
                <DatePicker
                  selected={departureDate}
                  onChange={(date) => setDepartureDate(date)}
                  placeholderText="Ngày đi"
                  className="w-[50%] bg-transparent text-black focus:outline-none"
                />
                <span className="mx-4 text-gray-400">|</span>
                <DatePicker
                  selected={returnDate}
                  onChange={(date) => handleReturnDateChange(date)}
                  placeholderText="Ngày về"
                  className="w-[50%] bg-transparent text-black focus:outline-none"
                />
              </div>

              {/* Nút Tìm kiếm */}
              <button
                onClick={handleSearch}
                className="flex h-[50px] items-center justify-center rounded-lg bg-orange-500 px-6 py-3 text-white"
              >
                <FaSearch className="mr-2" /> Tìm kiếm
              </button>
            </div>
          )}

          {tripOption === "Nhiều chặng" && (
            <div className="multi-leg-container">
              {multiLegFlights.map((leg, index) => (
                <div
                  key={index}
                  className="multi-leg-row mb-4 flex items-center space-x-4"
                >
                  {/* Input Khởi hành từ */}
                  <div className="relative w-[25%]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 512"
                      className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500"
                    >
                      <path
                        d="M381 114.9L186.1 41.8c-16.7-6.2-35.2-5.3-51.1 2.7L89.1 67.4C78 73 77.2 88.5 87.6 95.2l146.9 94.5L136 240 77.8 214.1c-8.7-3.9-18.8-3.7-27.3 .6L18.3 230.8c-9.3 4.7-11.8 16.8-5 24.7l73.1 85.3c6.1 7.1 15 11.2 24.3 11.2l137.7 0c5 0 9.9-1.2 14.3-3.4L535.6 212.2c46.5-23.3 82.5-63.3 100.8-112C645.9 75 627.2 48 600.2 48l-57.4 0c-20.2 0-40.2 4.8-58.2 14L381 114.9zM0 480c0 17.7 14.3 32 32 32l576 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 448c-17.7 0-32 14.3-32 32z"
                        fill="currentColor"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Khởi hành từ"
                      value={leg.from}
                      onChange={(e) =>
                        handleMultiLegAirportSearch(e, index, "from")
                      }
                      className="w-full rounded-lg border bg-white p-3 pl-10 text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  {/* Nút hoán đổi */}
                  <button onClick={() => handleSwap()} className="mx-2">
                    <FaExchangeAlt className="text-gray-500" />
                  </button>

                  {/* Input Điểm đến */}
                  <div className="relative w-[25%]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 512"
                      className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500"
                    >
                      <path
                        d="M.3 166.9L0 68C0 57.7 9.5 50.1 19.5 52.3l35.6 7.9c10.6 2.3 19.2 9.9 23 20L96 128l127.3 37.6L181.8 20.4C178.9 10.2 186.6 0 197.2 0l40.1 0c11.6 0 22.2 6.2 27.9 16.3l109 193.8 107.2 31.7c15.9 4.7 30.8 12.5 43.7 22.8l34.4 27.6c24 19.2 18.1 57.3-10.7 68.2c-41.2 15.6-86.2 18.1-128.8 7L121.7 289.8c-11.1-2.9-21.2-8.7-29.3-16.9L9.5 189.4c-5.9-6-9.3-14.1-9.3-22.5zM32 448l576 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32zm96-80a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm128-16a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
                        fill="currentColor"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Nơi đến"
                      value={leg.to}
                      onChange={(e) =>
                        handleMultiLegAirportSearch(e, index, "to")
                      }
                      className="w-full rounded-lg border bg-white p-3 pl-10 text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  {/* Ngày khởi hành */}
                  <div className="flex h-[50px] w-[25%] items-center rounded-lg border bg-white p-3">
                    <FaCalendarAlt className="mr-2 text-gray-500" />
                    <DatePicker
                      selected={leg.departureDate}
                      onChange={(date) =>
                        updateLeg(index, "departureDate", date)
                      }
                      placeholderText="Ngày đi"
                      className="w-full bg-transparent text-black focus:outline-none"
                    />
                  </div>

                  {/* Nút xóa chặng */}
                  {multiLegFlights.length > 1 && (
                    <button
                      onClick={() => removeLeg(index)}
                      className="ml-2 text-red-500"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}

              {/* Nút thêm chặng và Nút Tìm kiếm */}
              <div className="mt-6 flex justify-between">
                {/* Nút thêm chặng */}
                {multiLegFlights.length < 5 && (
                  <button
                    onClick={addLeg}
                    className="rounded-lg bg-green-500 px-4 py-2 text-white"
                  >
                    + Thêm chặng
                  </button>
                )}

                {/* Nút Tìm kiếm */}
                <button
                  onClick={handleSearch}
                  className="flex h-[50px] items-center justify-center rounded-lg bg-orange-500 px-6 py-3 text-white"
                >
                  <FaSearch className="mr-2" /> Tìm kiếm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
