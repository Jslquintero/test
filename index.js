const { useEffect, useState, useRef, useCallback, memo } = React;
const baseUrl = "https://us-central1-skillair-1.cloudfunctions.net";
const logoImage =
  "https://github.com/Jslquintero/test/blob/main/logo.png?raw=true";

function App() {
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    category: "",
    rate: "",
    minPrice: "",
    maxPrice: "",
    selectedDeliveryOption: [],
  });
  const [resultsOpen, setResultsOpen] = useState(false);
  const [isSkillSearch, setIsSkillSearch] = useState(false);
  const [isFilterSearch, setIsFilterSearch] = useState(false);

  const fetchWithTimeout = (url, options, timeout = 5000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      ),
    ]);
  };

  const handleFetchError = (error) => {
    swal.fire({
      title: "Error",
      text: "An error occurred while fetching results",
      icon: "error",
    });
  };

  const fetchAndSetData = async (url, setData) => {
    try {
      const response = await fetchWithTimeout(url, {}, 5000);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
      handleFetchError(error);
    }
  };

  const fetchAndSetCategories = async () => {
    const url = `${baseUrl}/getCategories`;
    const setData = (data) =>
      setCategoriesList(
        data.map((category) => ({
          id: category.id,
          name: category.name,
        }))
      );
    await fetchAndSetData(url, setData);
  };

  const fetchAndSetLocations = async () => {
    const url = `${baseUrl}/getLocations`;
    const setData = (data) => setLocationList(data);
    await fetchAndSetData(url, setData);
  };

  useEffect(() => {
    fetchAndSetCategories();
    fetchAndSetLocations();
  }, []);
  return (
    <div className="w-full max-w-screen-sm mx-auto">
      <h1 className="mb-4 text-3xl font-bold text-center text-materialPurple">
        Find Skills
      </h1>
      <div>
        <SearchBoxComponent
          setSelectedSkillId={setSelectedSkillId}
          locationList={locationList}
          categoriesList={categoriesList}
          filters={filters}
          setFilters={setFilters}
          resultsOpen={resultsOpen}
          setResultsOpen={setResultsOpen}
          setIsSkillSearch={setIsSkillSearch}
          isSkillSearch={isSkillSearch}
          isFilterSearch={isFilterSearch}
          setIsFilterSearch={setIsFilterSearch}
        />
      </div>

      <div className="z-0 grid grid-cols-1 my-2">
        {!selectedSkillId && (
          <div>
            <div>
              <img
                className="my-2 pointer-events-none"
                src="https://github.com/Jslquintero/test/blob/main/logo.png?raw=true"
              />
            </div>
            <span className="my-2 text-left text-fontColor">
              ALL CATEGORIES ({categoriesList.length})
            </span>
            <CategoriesComponent
              categoriesList={categoriesList}
              filters={filters}
              setFilters={setFilters}
              setResultsOpen={setResultsOpen}
              setIsSkillSearch={setIsSkillSearch}
            />
          </div>
        )}
      </div>
      <div>
        {selectedSkillId && <Details selectedSkillId={selectedSkillId} />}
      </div>
    </div>
  );
}

const SearchBoxComponent = ({
  setSelectedSkillId,
  locationList,
  categoriesList,
  filters,
  setFilters,
  resultsOpen,
  setResultsOpen,
  setIsSkillSearch,
  isSkillSearch,
  isFilterSearch,
  setIsFilterSearch,
}) => {
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        resultsContainerRef.current &&
        !resultsContainerRef.current.contains(event.target)
      ) {
        setResultsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const isFiltersEmpty = (filters) => {
    return Object.values(filters).every((value) => {
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === "string") return value.trim() === "";
      return false;
    });
  };

  return (
    <div className="relative ">
      <div className="grid grid-cols-3 gap-1">
        <div className="col-span-2">
          <SearchInputComponent
            searchText={searchText}
            setSearchText={setSearchText}
            setResultsOpen={setResultsOpen}
            resultsOpen={resultsOpen}
            setIsSkillSearch={setIsSkillSearch}
          />
        </div>
        <div className="col-span-1">
          <FilterComponent
            filters={filters}
            setFilters={setFilters}
            locationList={locationList}
            categoriesList={categoriesList}
            setIsFilterSearch={setIsFilterSearch}
            setResultsOpen={setResultsOpen}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 my-2">
        <div
          className={`text-center ${
            isFiltersEmpty(filters) ? "hidden" : "block"
          }`}
        >
          <span className="my-2 text-center text-fontColor">Filters</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterBadge
            label="Location"
            value={filters.location?.city}
            setFilters={setFilters}
            setResultsOpen={setResultsOpen}
            setSelectedSkillId={setSelectedSkillId}
          />
          <FilterBadge
            label="Category"
            value={filters.category ? filters.category.name : ""}
            setFilters={setFilters}
            setResultsOpen={setResultsOpen}
            setSelectedSkillId={setSelectedSkillId}
          />
          <FilterBadge
            label="Rate"
            value={
              filters.rate === null
                ? "Any rate"
                : filters.rate
                ? capitalizeFirstLetter(filters.rate.replace(/_/g, " "))
                : ""
            }
            setFilters={setFilters}
            setResultsOpen={setResultsOpen}
            setSelectedSkillId={setSelectedSkillId}
          />
          <FilterBadge
            label="Delivery"
            value={
              filters.selectedDeliveryOption.deliveryOnline == false &&
              filters.selectedDeliveryOption.deliveryInPerson == false
                ? "Any type of delivery"
                : filters.selectedDeliveryOption.deliveryOnline
                ? "Delivery online"
                : filters.selectedDeliveryOption.deliveryInPerson
                ? "Delivery in person"
                : ""
            }
            setFilters={setFilters}
            setResultsOpen={setResultsOpen}
            setSelectedSkillId={setSelectedSkillId}
          />
        </div>
        <div
          className={
            (searchText && resultsOpen) ||
            ((isSkillSearch || isFilterSearch) && resultsOpen)
              ? "block"
              : "hidden"
          }
        >
          <SearchResults
            searchText={searchText}
            filters={filters}
            setSelectedSkillId={setSelectedSkillId}
            setResultsOpen={setResultsOpen}
            isSkillSearch={isSkillSearch}
            isFilterSearch={isFilterSearch}
          />
        </div>
      </div>
    </div>
  );
};

const SearchInputComponent = ({
  searchText,
  setSearchText,
  setResultsOpen,
  resultsOpen,
  setIsSkillSearch,
}) => {
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleInputClick = () => {
    if (!resultsOpen) {
      setResultsOpen(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setResultsOpen(false);
    }, 200);
  };

  const handleClear = () => {
    setSearchText("");
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-neonPink"
        value={searchText}
        onChange={handleSearch}
        onClick={handleInputClick}
        onBlur={handleInputBlur}
        placeholder="Search skills"
      />
      <div className="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2">
        <svg
          className="w-4 h-4 text-neonPink"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-4.35-4.35m1.65-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      {searchText && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-neonPink focus:outline-none"
        >
          <svg
            className="w-4 h-4 text-neonPink"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      )}
    </div>
  );
};

const SearchResults = ({
  searchText,
  filters,
  setSelectedSkillId,
  isSkillSearch,
  setResultsOpen,
  setIsSkillSearch,
  isFilterSearch,
}) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const resultsRef = useRef(null);

  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchResults = async (searchText) => {
      setLoading(true);

      const requestBody = {
        text: searchText,
        categoryId: filters.category?.id || "",
        deliveryInPerson: filters.deliveryInPerson || false,
        deliveryOnline: filters.deliveryOnline || false,
        rate: filters.rate || "",
        location: filters.location || null,
      };

      try {
        const response = await fetch(`${baseUrl}/search`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          // signal: controller.signal,
        });
        const data = await response.json();
        if (isMounted) {
          setResults(data);
        }
      } catch (error) {
        console.error("Error:", error);
        swal.fire({
          title: "Error",
          text: "An error occurred while fetching results",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isSkillSearch || isFilterSearch) {
      fetchResults();
    } else if (debouncedSearchText.trim().length >= 3) {
      fetchResults(debouncedSearchText);
    }

    return () => {
      controller.abort();
    };
  }, [debouncedSearchText, filters, isSkillSearch, isFilterSearch]);
  const handleClick = (id) => {
    setSelectedSkillId(id);
    setResultsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setResultsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [resultsRef]);

  return (
    <div
      ref={resultsRef}
      className="absolute z-10 w-full mt-2 -mt-3 bg-white rounded-md shadow-lg max-h-96"
      style={{
        overflowY: "scroll",
        scrollbarWidth: "thin",
        scrollbarColor: "#FD3BB0 transparent",
      }}
    >
      <div className="w-full">
        {results.map(
          (item, index) =>
            (searchText || isSkillSearch || isFilterSearch) && (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 p-2 cursor-pointer hover:bg-gray-200 text-fontColor hover:text-neonPink"
                onClick={() => {
                  handleClick(item.id);
                }}
              >
                <div className="flex items-center justify-center">
                  <img
                    src={item.image}
                    alt="Result"
                    className="object-cover rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
                  />
                </div>
                <div className="flex items-center justify-between col-span-3 text-xs md:text-xl">
                  <span>{item.name}</span>
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </div>
            )
        )}
      </div>
      <div className="mt-4 text-center text-neonPink">
        {loading ? (
          <div className="animate-pulse">
            <i className="text-xl fas fa-spinner fa-spin"></i>
            <p>Loading...</p>
          </div>
        ) : results.length === 0 ? (
          <div>
            <i className="text-xl fas fa-exclamation-circle"></i>
            <p>
              No skills found based on your search. Try adjusting your filters.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
const FilterComponent = ({
  filters,
  setFilters,
  locationList,
  categoriesList,
  setIsFilterSearch,
  setResultsOpen,
}) => {
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [filterName, setFilterName] = useState();
  const [selectedFilter, setSelectedFilter] = useState(null);

  const options = [
    { label: "Location" },
    { label: "Category" },
    { label: "Price" },
    { label: "Delivery" },
  ];

  const showModal = () => {
    setIsModalOpened(!isModalOpened);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setFilterName(`${filter}(Filter)`);
  };

  const handleReset = () => {
    setSelectedFilter(null);
    setFilters({
      ...filters,
      location: "",
      category: "",
      rate: "",
      selectedDeliveryOption: [],
      minPrice: "",
      maxPrice: "",
    });
  };

  const handleBack = () => {
    setSelectedFilter(null);
    setFilterName("Filter");
  };

  const handleDone = () => {
    // const hasFilters = Object.values(filters).some(
    //   (value) => value !== "" && !(Array.isArray(value) && value.length === 0)
    // );

    setSelectedFilter(null);
    setIsModalOpened(false);
    setIsFilterSearch(true);
    setResultsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-2 text-white border border-gray-300 rounded-md bg-neonPink focus:outline-none focus:border-gray-300"
        onClick={showModal}
      >
        <span>Filter</span>
        <i className="fa-solid fa-filter text-white-400"></i>
      </button>

      {isModalOpened && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                className="cursor-pointer text-materialPurple"
                onClick={handleBack}
              >
                {selectedFilter && (
                  <i className="fa-solid fa-chevron-left text-neonPink"></i>
                )}
              </button>
              <h2 className="text-lg font-semibold text-materialPurple">
                {filterName}
              </h2>
              <div className="flex space-x-4 font-bold">
                <button
                  type="button"
                  className="text-lg text-neonPink"
                  onClick={handleReset}
                >
                  Reset
                </button>
                <button className="text-lg text-neonPink" onClick={handleDone}>
                  Done
                </button>
              </div>
            </div>
            <div>
              {selectedFilter ? (
                <div>
                  {selectedFilter === "Location" && (
                    <LocationFilter
                      filters={filters}
                      setFilters={setFilters}
                      locationList={locationList}
                    />
                  )}
                  {selectedFilter === "Category" && (
                    <CategoryFilter
                      filters={filters}
                      setFilters={setFilters}
                      categoriesList={categoriesList}
                    />
                  )}
                  {selectedFilter === "Price" && (
                    <PriceFilter filters={filters} setFilters={setFilters} />
                  )}
                  {selectedFilter === "Delivery" && (
                    <DeliveryFilter filters={filters} setFilters={setFilters} />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 text-left">
                  {options.map((option) => (
                    <>
                      <button
                        type="button"
                        className="flex justify-between block w-full max-w-lg py-3 text-lg text-left transition-colors duration-200 cursor-pointer text-materialPurple hover:bg-gray-100"
                        onClick={() => handleFilterSelect(option.label)}
                      >
                        <span className="flex-grow mx-2">{option.label}</span>
                        <i className="fa-solid fa-chevron-right text-neonPink"></i>
                      </button>
                      <hr className="bg-materialPurple" />
                    </>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const LocationFilter = ({ filters, setFilters, locationList }) => {
  const handleFilterSelect = (location) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      location,
    }));
  };

  const areLocationsEqual = (location1, location2) => {
    if (!location1 || !location2) return false;
    return (
      location1.city === location2.city &&
      location1.country === location2.country
    );
  };

  if (locationList.length <= 0) {
    return <div className=""></div>;
  }

  return (
    <div
      className="overflow-y-scroll max-h-128"
      style={{
        scrollbarWidth: "none",
        scrollbarColor: "transparent transparent",
      }}
    >
      {locationList.map((item) => {
        const isSelected = areLocationsEqual(filters.location, item);

        return (
          <a
            key={item.city}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleFilterSelect(item);
            }}
            className="flex justify-between w-full max-w-xl py-3 text-lg transition-colors duration-200 cursor-pointer text-materialPurple hover:bg-gray-100"
          >
            {item.city}
            <span className="float-right text-white">
              <i
                className={`fa fa-circle ${
                  isSelected
                    ? "border-materialPurple border-2 text-neonPink border-materialPurple bg-neonPink rounded-full"
                    : "border-neonPink border-2 text-white border-materialPurple rounded-full"
                }`}
              ></i>
            </span>
          </a>
        );
      })}
    </div>
  );
};

const CategoryFilter = ({ filters, setFilters, categoriesList }) => {
  const handleFilterSelect = (category) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      category,
    }));
  };

  const areCategoriesEqual = (category1, category2) => {
    if (!category1 || !category2) return false;
    return category1.id === category2.id && category1.name === category2.name;
  };

  if (categoriesList.length <= 0) {
    return <div className="animate-pulse"></div>;
  }

  return (
    <div
      className="overflow-y-scroll max-h-128"
      style={{
        scrollbarColor: "#FD3BB0 transparent",
        scrollbarWidth: "thin",
      }}
    >
      {categoriesList.map((item) => {
        const isSelected = areCategoriesEqual(filters.category, item);

        return (
          <div
            key={item.id}
            className="grid grid-cols-[10%,auto] gap-5 my-6 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center justify-center w-10 h-10 mx-1 my-2 mt-1 rounded-full bg-opaquePink">
              <svg
                className="w-5"
                viewBox="0 0 30 35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5 20.4026C-2.5 12.5 6.5 -3 23 5.90261M3 27.9026C15.8802 38.3608 39 27 18.5 14.4026"
                  stroke="#FE009C"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <button
              onClick={() => handleFilterSelect(item)}
              className="flex justify-between w-full max-w-xl px-2 py-3 text-lg text-materialPurple"
            >
              {item.name}
              <span className="float-right text-white">
                <i
                  className={`mt-1 fa-solid fa-chevron-right ${
                    isSelected ? "text-neonPink" : "text-materialPurple"
                  }`}
                ></i>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

const PriceFilter = ({ filters, setFilters }) => {
  const rates = [
    {
      label: "Any",
      value: null,
    },
    {
      label: "Fixed cost",
      value: "fixed_cost",
    },
    {
      label: "Hourly",
      value: "hourly",
    },
  ];

  const handleRateChange = (value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      rate: value,
    }));
  };

  const handleMinPriceChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      minPrice: e.target.value,
    }));
  };

  const handleMaxPriceChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      maxPrice: e.target.value,
    }));
  };

  const RadioButton = ({ label, value }) => {
    const isSelected = filters.rate === value;

    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleRateChange(value);
        }}
        className={`text-lg py-3 block text-materialPurple border-b-2 border-materialPurpleOpaque ${
          isSelected ? "border-neonPink text-neonPink" : ""
        }`}
      >
        {label}
        <span className="float-right text-white">
          <i
            className={`fa fa-circle ${
              isSelected
                ? "border-materialPurple border-2 text-neonPink border-materialPurple bg-neonPink rounded-full"
                : "border-neonPink border-2 text-white border-materialPurple rounded-full"
            }`}
          ></i>
        </span>
      </a>
    );
  };

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold text-materialPurple">Rate</h1>

      {rates.map((option) => (
        <RadioButton
          key={option.value}
          value={option.value}
          label={option.label}
        />
      ))}

      {/* <h1 className="text-xl font-bold text-materialPurple">Price range</h1>
      <div className="flex justify-between">
        <input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={handleMinPriceChange}
          className="w-1/2 mx-2 border-b-2 border-materialPurpleOpaque focus:border-transparent focus:outline-none focus:ring-0"
        />

        <input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={handleMaxPriceChange}
          className="w-1/2 mx-2 border-b-2 border-materialPurpleOpaque focus:border-transparent focus:outline-none focus:ring-0"
        />
      </div> */}
    </div>
  );
};

const DeliveryFilter = ({ filters, setFilters }) => {
  const deliveryOptions = [
    {
      label: "Any",
      value: {
        deliveryOnline: false,
        deliveryInPerson: false,
      },
    },
    {
      label: "Online",
      value: {
        deliveryOnline: true,
        deliveryInPerson: false,
      },
    },
    {
      label: "In person",
      value: {
        deliveryInPerson: true,
        deliveryOnline: false,
      },
    },
  ];

  const handleDeliveryChange = (value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      selectedDeliveryOption: value,
    }));
  };

  const RadioButton = ({ label, value }) => {
    const isSelected =
      filters.selectedDeliveryOption &&
      filters.selectedDeliveryOption.deliveryOnline === value.deliveryOnline &&
      filters.selectedDeliveryOption.deliveryInPerson ===
        value.deliveryInPerson;

    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleDeliveryChange(value);
        }}
        className={`text-lg block py-3 text-materialPurple border-b-2 border-materialPurpleOpaque ${
          isSelected ? "border-neonPink text-neonPink" : ""
        }`}
      >
        {label}
        <span className="float-right text-white">
          <i
            className={`fa fa-circle ${
              isSelected
                ? "border-materialPurple border-2 text-neonPink border-materialPurple bg-neonPink rounded-full"
                : "border-neonPink border-2 text-white border-materialPurple rounded-full"
            }`}
          ></i>
        </span>
      </a>
    );
  };

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold text-materialPurple">
        Delivery Options
      </h1>
      {deliveryOptions.map((option) => (
        <RadioButton
          key={option.value}
          value={option.value}
          label={option.label}
        />
      ))}
    </div>
  );
};

const FilterBadge = ({
  label,
  value,
  setFilters,
  setResultsOpen,
  setSelectedSkillId,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (value !== undefined && value !== "") {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [value]);

  const handleRemove = () => {
    onBadgeFilterRemove();
    setIsVisible(false);
    setResultsOpen(false);
    setSelectedSkillId(null);
  };

  const onBadgeFilterRemove = () => {
    switch (label) {
      case "Location":
        setFilters((prevFilters) => ({
          ...prevFilters,
          location: "",
        }));
        break;
      case "Category":
        setFilters((prevFilters) => ({
          ...prevFilters,
          category: "",
        }));
        break;
      case "Rate":
        setFilters((prevFilters) => ({
          ...prevFilters,
          rate: "",
        }));
        break;
      case "Delivery":
        setFilters((prevFilters) => ({
          ...prevFilters,
          selectedDeliveryOption: [],
        }));
        break;
      default:
        break;
    }
  };

  if (isVisible) {
    return (
      <>
        <div class="flex items-center space-x-2">
          <span class="text-base inline-block py-2 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-neonPink text-white rounded-full flex justify-between items-center">
            {value}
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove"
              class="ml-2 text-xs py-0.5 px-1 leading-none bg-transparent rounded-full"
            >
              <i className="text-gray-100 text-opacity-50 sm:text-opacity-75 hover:text-opacity-100 fa-solid fa-circle-xmark"></i>
            </button>
          </span>
        </div>
      </>
    );
  } else {
    return null;
  }
};

const Details = ({ selectedSkillId }) => {
  const [data, setData] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detailsResponse, imagesResponse] = await Promise.all([
          fetch(`${baseUrl}/getOne?id=${selectedSkillId}`),
          fetch(`${baseUrl}/getSkillImages?id=${selectedSkillId}`),
        ]);

        const [detailsData, imagesData] = await Promise.all([
          detailsResponse.json(),
          imagesResponse.json(),
        ]);

        setData(detailsData);
        const urls = imagesData.map((image) => image.image);
        setImageUrls(urls);
      } catch (error) {
        swal.fire({
          title: "Error",
          text: error.message,
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      setData({ category: {} });
      setImageUrls([]);
    };
  }, [selectedSkillId, baseUrl]);

  const handleSelectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const {
    name,
    category,
    amount,
    rate,
    duration,
    delivery_method_online,
    delivery_method_in_person,
    description,
  } = data;

  if (loading) {
    return (
      <div className="z-10 w-full mx-auto animate-pulse">
        <div className="grid items-start max-w-3xl gap-6 px-4 py-6 mx-auto md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h1 className="h-8 text-3xl font-extrabold bg-gray-300 rounded"></h1>
            <div className="flex flex-col gap-2 text-sm leading-loose ">
              <div className="flex flex-col gap-2 text-sm leading-loose">
                <p className="h-6 text-lg font-extrabold bg-gray-300 rounded text-materialPurple"></p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4 sm:col-span-4">
              <div className="ml-3 bg-gray-300 rounded-lg aspect-square"></div>
            </div>
            <div className="col-span-4 sm:col-span-1">
              <div className="ml-3 bg-gray-300 rounded-lg aspect-square"></div>
            </div>
            <div className="col-span-4 sm:col-span-1">
              <div className="ml-3 bg-gray-300 rounded-lg aspect-square"></div>
            </div>
            <div className="col-span-4 sm:col-span-1">
              <div className="ml-3 bg-gray-300 rounded-lg aspect-square"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="z-10 w-full mx-auto">
      <div className="grid grid-rows-2">
        <div className="grid items-start max-w-5xl gap-6 px-4 py-6 mx-auto md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-extrabold text-materialPurple">
              {category.name}
            </h1>
            <div className="flex flex-col gap-2 text-sm leading-loose ">
              <div className="flex flex-col gap-2 text-sm leading-loose">
                <p className="text-lg font-extrabold text-materialPurple">
                  {name}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-10 text-sm leading-loose">
                <span className="text-xl font-extrabold text-materialPurple">
                  Pricing from
                </span>
                <p className="text-lg text-materialPurple">
                  <span className="text-xl font-extrabold text-materialPurple">
                    $ {amount + " "}
                  </span>
                  {rate.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            <hr className="border-materialPurpleOpaque" />

            <div>
              <div className="flex flex-col gap-2 text-sm leading-loose">
                <span className="text-xl font-extrabold text-materialPurple">
                  Duration
                </span>
                <p className="text-lg text-materialPurple">
                  {duration !== 0 ? duration : "-"}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm leading-loose">
                <span className="text-xl font-extrabold text-materialPurple">
                  Online
                </span>
                <p className="text-lg text-materialPurple">
                  {delivery_method_online ? "Yes" : "No"}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm leading-loose">
                <span className="text-xl font-extrabold text-materialPurple">
                  In person
                </span>
                <p className="text-lg text-materialPurple">
                  {delivery_method_in_person ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4">
              <img
                alt="primaryImage"
                className="w-full ml-3 overflow-hidden rounded-lg shadow-lg aspect-square"
                height="600"
                src={imageUrls[currentImageIndex]}
                width="600"
              />
            </div>

            {imageUrls.map((image, index) => (
              <div className="col-span-1 sm:col-span-1" key={index}>
                <img
                  alt="otherImage"
                  className="w-full ml-3 overflow-hidden rounded-lg shadow-lg cursor-pointer aspect-square"
                  height="100"
                  src={image}
                  width="100"
                  onClick={() => {
                    handleSelectImage(index);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <hr className="border-materialPurpleOpaque" />
          <div className="grid gap-4 grid-cols-auto">
            <h2 className="text-lg font-extrabold text-materialPurple">
              Description
            </h2>
            <p className="text-lg text-materialPurple">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoriesComponent = ({
  categoriesList,
  filters,
  setFilters,
  setResultsOpen,
  setIsSkillSearch,
}) => {
  const handleFilterSelect = (category) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      category,
    }));
    setIsSkillSearch(true);
    setResultsOpen(true);
  };

  const areCategoriesEqual = (category1, category2) => {
    if (!category1 || !category2) return false;
    return category1.id === category2.id && category1.name === category2.name;
  };

  if (categoriesList.length <= 0) {
    return <div className="animate-pulse"></div>;
  }

  return (
    <div
      className="overflow-y-scroll max-h-128"
      style={{
        scrollbarColor: "#FD3BB0 transparent",
        scrollbarWidth: "thin",
      }}
    >
      {categoriesList.map((item) => {
        const isSelected = areCategoriesEqual(filters.category, item);

        return (
          <div
            key={item.id}
            className="grid grid-cols-[10%,auto] gap-5 my-6 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center justify-center w-10 h-10 mx-1 my-2 mt-1 rounded-full bg-opaquePink">
              <svg
                className="w-5"
                viewBox="0 0 30 35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5 20.4026C-2.5 12.5 6.5 -3 23 5.90261M3 27.9026C15.8802 38.3608 39 27 18.5 14.4026"
                  stroke="#FE009C"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <button
              onClick={() => handleFilterSelect(item)}
              className="flex justify-between w-full max-w-xl px-2 py-3 text-lg text-materialPurple"
            >
              {item.name}
              <span className="float-right text-white">
                <i
                  className={`mt-1 fa-solid fa-chevron-right ${
                    isSelected ? "text-neonPink" : "text-materialPurple"
                  }`}
                ></i>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

ReactDOM.render(<App />, document.getElementById("search"));
tailwind.config = {
  theme: {
    fontFamily: {
      sans: ["Montserrat", "sans-serif"],
    },
    extend: {
      colors: {
        neonPink: "#fe0198",
        neonPinkOpaque: "#FD3BB0",
        materialPurple: "#47277b",
        materialPurpleOpaque: "#B2A6C7",
        opaquePink: "#FFECF2",
        fontColor: "#857a98",
      },
      animation: {
        bounce: "bounce 1s infinite",
      },
      maxHeight: {
        128: "32rem",
        130: "35rem",
      },
    },
  },
};
