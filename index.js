const { useEffect, useState, useRef } = React;
const baseUrl = "https://us-central1-skillair-1.cloudfunctions.net";

function App() {
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [filters, setFilters] = useState({});

  return (
    <div className="w-1/2 mx-auto">
      <div id="search" className="container mx-auto px-4 py-8 mt-10">
        <h1 className="text-3xl font-bold mb-4 text-center text-materialPurple">
          Skill Search
        </h1>
        <SearchBox
          setSelectedSkillId={setSelectedSkillId}
          filters={filters}
          setFilters={setFilters}
        />
        <div class="">
          {selectedSkillId && <Details selectedSkillId={selectedSkillId} />}
        </div>
      </div>
    </div>
  );
}

function SearchBox({
  setSelectedSkillId,
  selectedSkillId,
  filters,
  setFilters,
  updateFilters,
}) {
  const [searchText, setSearchText] = useState("");
  const [result, setResult] = useState([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  const [location, setLocation] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [selectedDeliveryOption, setSelectedDeliveryOption] = React.useState(
    []
  );

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

  const handleResultClick = (id) => {
    setSelectedSkillId(id);
    setResultsOpen(false);
  };

  const handleDoneClick = () => {
    setResultsOpen(true);
  };

  const FilterBadge = ({ label, value }) => {
    const [isVisible, setIsVisible] = useState(!!value);

    const handleRemove = () => {
      onBadgeFilterRemove();
      setIsVisible(false);
      setResultsOpen(true);
    };

    const onBadgeFilterRemove = () => {
      switch (label) {
        case "Location":
          setLocation("");
          setFilters({ ...filters, location: null });
          break;
        case "Category":
          setCategory("");
          setFilters({ ...filters, category: null });
          break;
        case "Rate":
          setRate("");
          setFilters({ ...filters, rate: "" });
          break;
        case "Delivery":
          setSelectedDeliveryOption({});
          setFilters({
            ...filters,
            deliveryOnline: false,
            deliveryInPerson: false,
          });
          break;
        default:
          break;
      }
    };

    if (isVisible) {
      return (
        <span
          id="badge-dismiss-filter"
          className="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-white bg-neonPink rounded"
        >
          <span className="text-white">
            {label}: {value}
          </span>
          <button
            type="button"
            className="inline-flex items-center p-1 ms-2 text-sm text-white bg-transparent rounded-sm"
            data-dismiss-target="#badge-dismiss-filter"
            aria-label="Remove"
            onClick={handleRemove}
          >
            <i className="fa-solid fa-xmark"></i>
            <span className="sr-only">Remove badge</span>
          </button>
        </span>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="relative grid grid-cols-1 gap-2">
      <div className="grid grid-cols-6 gap-2">
        <div className="col-span-5">
          <SearchInput
            searchText={searchText}
            setSearchText={setSearchText}
            closeResults={() => setResultsOpen(false)}
            inputRef={inputRef}
            setResultsOpen={setResultsOpen}
            resultsOpen={resultsOpen}
          />
        </div>
        <div className="col-span-1">
          <Filter
            location={location}
            setLocation={setLocation}
            category={category}
            setCategory={setCategory}
            rate={rate}
            setRate={setRate}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedDeliveryOption={selectedDeliveryOption}
            setSelectedDeliveryOption={setSelectedDeliveryOption}
            searchText={searchText}
            filters={filters}
            setFilters={setFilters}
            updateFilters={updateFilters}
            handleDoneClick={handleDoneClick}
          />
        </div>
      </div>
      <div className="grid grid-cols-1">
        <div className="flex flex-wrap gap-2">
          <FilterBadge
            label="Location"
            value={filters.location?.city ? filters.location.city : ""}
          />
          <FilterBadge
            label="Category"
            value={filters.category ? filters.category.name : ""}
          />
          <FilterBadge
            label="Rate"
            value={filters.rate ? filters.rate.replace(/_/g, " ") : ""}
          />
          <FilterBadge
            label="Delivery"
            value={
              filters.deliveryOnline && filters.deliveryInPerson
                ? "Online and In Person"
                : filters.deliveryOnline
                ? "Online"
                : filters.deliveryInPerson
                ? "In Person"
                : ""
            }
          />
        </div>
        {resultsOpen && (
          <SearchResults
            searchText={searchText}
            filters={filters}
            setFilters={setFilters}
            result={result}
            setResult={setResult}
            selectedSkillId={selectedSkillId}
            setSelectedSkillId={setSelectedSkillId}
            resultsContainerRef={resultsContainerRef}
            handleResultClick={handleResultClick}
          />
        )}
      </div>
    </div>
  );
}

function SearchInput({
  searchText,
  setSearchText,
  inputRef,
  setResultsOpen,
  resultsOpen,
}) {
  const handleChange = (e) => {
    const searchText = e.target.value;
    setSearchText(searchText);
    setResultsOpen(true);
  };

  const handleInputClick = () => {
    if (!resultsOpen && searchText.trim() !== "") {
      setResultsOpen(true);
    }
  };

  return (
    <div ref={inputRef} className="relative">
      <div className="flex justify-between items-center">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <i className="fa-solid fa-search text-neonPink"></i>
          </span>
        </div>
        <input
          id="searchBar"
          name="searchBar"
          type="text"
          className="w-full border border-gray-300 rounded-md py-2 px-10 pr-4 pl-10 focus:outline-none focus:border-neonPink"
          value={searchText}
          onChange={handleChange}
          onClick={handleInputClick}
          placeholder="Search"
        />
      </div>
    </div>
  );
}

function SearchResults({
  searchText,
  filters,
  setFilters,
  result,
  setResult,
  resultsContainerRef,
  handleResultClick,
}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchResults = async (searchText) => {
      setLoading(true);

      const requestBody = {
        text: searchText,
        categoryId:
          filters.category && filters.category.id ? filters.category.id : "",
        deliveryInPerson: filters.deliveryInPerson || false,
        deliveryOnline: filters.deliveryOnline || false,
        rate: filters.rate || "",
        location: filters.location ? filters.location : null,
        // minPrice: filters.minPrice || "",
        // maxPrice: filters.maxPrice || "",
      };

      // console.log(requestBody);

      try {
        const response = await fetch(`${baseUrl}/search`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          // signal: controller.signal,
        });

        // console.log(requestBody);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setResult(data);
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

    if (searchText.trim().length >= 3) {
      fetchResults(searchText);
    }

    // fetchResults(searchText);

    return () => controller.abort();
  }, [searchText, filters]);

  const ResultList = ({ image, name, id }) => {
    const handleClick = () => {
      handleResultClick(id);
    };

     return (
       <tr
         className="cursor-pointer hover:bg-gray-200 text-fontColor hover:text-neonPink"
         onClick={handleClick}
       >
         <td className="p-2">
           <img src={image} alt="Result" className="w-16 h-16 rounded-full" />
         </td>
         <td className="p-2">{name}</td>
         <td>
           <i className="fa-solid fa-chevron-right"></i>
         </td>
       </tr>
     );
  };

  return (
    <div
      ref={resultsContainerRef}
      id="results-container"
      className="-mt-3 w-full absolute bg-white rounded-md  shadow-lg  z-10 mt-2"
      style={{
        maxHeight: "50vh",
        overflowY: "scroll",
        scrollbarWidth: "none",
        scrollbarColor: "transparent transparent",
      }}
    >
      <table className="w-full">
        <tbody>
          {result.map((item, index) => (
            <ResultList
              key={index}
              image={item.image}
              name={item.name}
              id={item.id}
            />
          ))}
        </tbody>
      </table>
      {loading && (
        <div className="animate-pulse">
          <div className="text-center text-neonPink">
            <i className="fas fa-spinner fa-spin text-xl"></i>
          </div>
          <div className="text-center text-neonPink">
            <p>Loading...</p>
          </div>
        </div>
      )}
      {result.length > 5 && (
        <div className="animate-bounce text-center text-neonPink">
          <i className="fas fa-chevron-down text-xl"></i>
        </div>
      )}
    </div>
  );
}

function Details({ selectedSkillId }) {
  const [data, setData] = React.useState({ category: {} });
  const [imageUrls, setImageUrls] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detailsResponse, imagesResponse] = await Promise.all([
          fetch(`${baseUrl}/getOne?id=${selectedSkillId}`),
          fetch(`${baseUrl}/getSkillImages?id=${selectedSkillId}`),
        ]);

        if (!detailsResponse.ok) {
          throw new Error("Network response for details was not ok");
        }
        if (!imagesResponse.ok) {
          throw new Error("Network response for images was not ok");
        }

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
      <div className="w-full mx-auto z-10 animate-pulse">
        <div className="grid md:grid-cols-2 items-start max-w-3xl gap-6 mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-extrabold bg-gray-300 h-8 rounded"></h1>
            <div className="flex flex-col gap-2 text-sm leading-loose ">
              <div className="flex flex-col gap-2 text-sm leading-loose">
                <p className="text-materialPurple font-extrabold text-lg bg-gray-300 h-6 rounded"></p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4 sm:col-span-4">
              <div className="aspect-square ml-3 rounded-lg bg-gray-300"></div>
            </div>
            <div className="col-span-4 sm:col-span-1">
              <div className="aspect-square ml-3 rounded-lg bg-gray-300"></div>
            </div>
            <div className="col-span-4 sm:col-span-1">
              <div className="aspect-square ml-3 rounded-lg bg-gray-300"></div>
            </div>
            <div className="col-span-4 sm:col-span-1">
              <div className="aspect-square ml-3 rounded-lg bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto z-10">
      <div className="grid md:grid-cols-2 items-start max-w-3xl gap-6 mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold text-materialPurple">
            {category.name}
          </h1>
          <div className="flex flex-col gap-2 text-sm leading-loose ">
            <div className="flex flex-col gap-2 text-sm leading-loose">
              <p className="text-materialPurple font-extrabold text-lg">
                {name}
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm leading-loose mt-10">
              <span className="text-materialPurple font-extrabold text-xl">
                Pricing from
              </span>
              <p className="text-lg text-materialPurple">
                <span className="text-materialPurple font-extrabold text-xl">
                  $ {amount + " "}
                </span>
                {rate.replace(/_/g, " ")}
              </p>
            </div>
          </div>
          <hr className="border-materialPurpleOpaque" />

          <div>
            <div className="flex flex-col gap-2 text-sm leading-loose">
              <span className="text-materialPurple font-extrabold text-xl">
                Duration
              </span>
              <p className="text-lg text-materialPurple">
                {duration !== 0 ? duration : "-"}
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm leading-loose">
              <span className="text-materialPurple font-extrabold text-xl">
                Online
              </span>
              <p className="text-lg text-materialPurple">
                {delivery_method_online ? "Yes" : "No"}
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm leading-loose">
              <span className="text-materialPurple font-extrabold text-xl">
                In person
              </span>
              <p className="text-lg text-materialPurple">
                {delivery_method_in_person ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <hr className="border-materialPurpleOpaque" />

          <div className="grid gap-4">
            <h2 className="text-2xl font-extrabold text-materialPurple">
              Description
            </h2>
            <p className="text-lg text-materialPurple">{description}</p>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4">
          <div class="col-span-4 sm:col-span-4">
            <img
              alt="primaryImage"
              className="aspect-square ml-3 rounded-lg  w-full overflow-hidden shadow-lg"
              height={600}
              src={imageUrls[currentImageIndex]}
              width={600}
            />
          </div>

          {imageUrls.map((image, index) => (
            <div class="col-span-4 sm:col-span-1" key={index}>
              <img
                alt="otherImage"
                className="aspect-square ml-3 rounded-lg  w-full overflow-hidden cursor-pointer shadow-lg"
                height={100}
                src={image}
                width={100}
                onClick={() => {
                  handleSelectImage(index);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Filter({
  location,
  setLocation,
  category,
  setCategory,
  rate,
  setRate,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedDeliveryOption,
  setSelectedDeliveryOption,
  searchText,
  filters,
  setFilters,
  handleDoneClick,
}) {
  const [showOptions, setShowOptions] = React.useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const filterOptions = [
    { label: "Location" },
    { label: "Category" },
    { label: "Price" },
    { label: "Delivery" },
  ];

  return (
    <div>
      <button
        type="button"
        className="flex justify-between items-center w-full border bg-neonPink text-white border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-gray-300"
        onClick={toggleOptions}
      >
        <span>Filter</span>
        <i className="fa-solid fa-filter text-white-400"></i>
      </button>
      <FilterModal
        isOpen={showOptions}
        onClose={toggleOptions}
        options={filterOptions}
        location={location}
        setLocation={setLocation}
        category={category}
        setCategory={setCategory}
        rate={rate}
        setRate={setRate}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        selectedDeliveryOption={selectedDeliveryOption}
        setSelectedDeliveryOption={setSelectedDeliveryOption}
        searchText={searchText}
        setFilters={setFilters}
        filters={filters}
        updateFilters={setFilters}
        handleDoneClick={handleDoneClick}
      />
    </div>
  );
}

function FilterModal({
  isOpen,
  onClose,
  options,
  location,
  setLocation,
  category,
  setCategory,
  rate,
  setRate,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedDeliveryOption,
  setSelectedDeliveryOption,
  searchText,
  setFilters,
  filters,
  updateFilters,
  handleDoneClick,
}) {
  const [filterName, setFilterName] = React.useState("Filters");
  const [selectedFilter, setSelectedFilter] = React.useState(null);

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setFilterName(`${filter}(Filter)`);
  };

  const handleReset = () => {
    setSelectedFilter(null);
    setLocation("");
    setCategory("");
    setRate("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedDeliveryOption({});
    setFilters({});
  };

  const handleBack = () => {
    setSelectedFilter(null);
    setFilterName("Filters");
  };

  const handleDone = () => {
    onClose();
    updateFilters({
      location,
      category,
      rate,
      minPrice,
      maxPrice,
      ...selectedDeliveryOption,
    });
    setSelectedFilter(null);
    handleDoneClick();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <a
            type="button"
            className="text-materialPurple cursor-pointer"
            onClick={handleBack}
          >
            {selectedFilter && (
              <i className="fa-solid fa-chevron-left text-neonPink"></i>
            )}
          </a>
          <h2 className="text-lg font-semibold text-materialPurple">
            {filterName}
          </h2>
          <div className="flex space-x-4">
            <button
              type="button"
              className="text-neonPinkOpaque text-lg font-semibold"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              className="text-neonPink text-lg font-semibold"
              onClick={handleDone}
            >
              Done
            </button>
          </div>
        </div>
        <div>
          {selectedFilter ? (
            <div>
              {selectedFilter === "Location" && (
                <LocationFilter location={location} setLocation={setLocation} />
              )}
              {selectedFilter === "Category" && (
                <CategoryFilter category={category} setCategory={setCategory} />
              )}
              {selectedFilter === "Price" && (
                <PriceFilter
                  rate={rate}
                  setRate={setRate}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                />
              )}
              {selectedFilter === "Delivery" && (
                <DeliveryFilter
                  selectedDeliveryOption={selectedDeliveryOption}
                  setSelectedDeliveryOption={setSelectedDeliveryOption}
                />
              )}
            </div>
          ) : (
            <div>
              {options.map((option, index) => (
                <a
                  key={index}
                  className="flex justify-between py-3 block text-materialPurple w-full max-w-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleFilterSelect(option.label)}
                >
                  <span className="flex-grow mx-2">{option.label}</span>
                  <i className="fa-solid fa-chevron-right text-neonPink"></i>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryFilter({ category, setCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${baseUrl}/getCategories`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCategories(
          data.map((category) => ({ id: category.id, name: category.name }))
        );
      } catch (error) {
        swal.fire({
          title: "Error",
          text: "An error occurred while fetching results",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterSelect = (categories) => {
    setCategory(categories);
  };

  const CategoryList = ({ categories }) => {
    // const isSelected = categories.id === category.id;

    const areCategoriesEqual = (category1, category2) => {
      if (!category1 || !category2) return false;
      return category1.id === category2.id && category1.name === category2.name;
    };

    const isSelected = areCategoriesEqual(category, categories);

    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleFilterSelect(categories);
        }}
        className="flex justify-between py-3 block text-materialPurple w-full max-w-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        style={{ display: "block" }}
      >
        {categories.name}
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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between py-3 block text-materialPurple w-full max-w-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200">
          <span className="flex-grow mx-2 bg-gray-300 h-6 rounded"></span>
        </div>
        <div className="flex justify-between py-3 block text-materialPurple w-full max-w-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200">
          <span className="flex-grow mx-2 bg-gray-300 h-6 rounded"></span>
        </div>
        <div className="flex justify-between py-3 block text-materialPurple w-full max-w-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200">
          <span className="flex-grow mx-2 bg-gray-300 h-6 rounded"></span>
        </div>
        <div className="flex justify-between py-3 block text-materialPurple w-full max-w-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200">
          <span className="flex-grow mx-2 bg-gray-300 h-6 rounded"></span>
        </div>
      </div>
    );
  }

  return (
    <div
      class="max-h-64 overflow-y-scroll"
      style={{
        scrollbarColor: "#FD3BB0 transparent",
        scrollbarWidth: "thin",
      }}
    >
      {categories.map((item, index) => (
        <CategoryList key={index} categories={item} />
      ))}
    </div>
  );
}

function LocationFilter({ location, setLocation }) {
  const [locations, setLocations] = React.useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${baseUrl}/getLocations`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        swal.fire({
          title: "Error",
          text: "An error occurred while fetching results",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterSelect = (location) => {
    setLocation(location);
  };

  const LocationList = ({ value }) => {
    const areLocationsEqual = (location1, location2) => {
      if (!location1 || !location2) return false;
      return (
        location1.city === location2.city &&
        location1.country === location2.country
      );
    };

    const isSelected = areLocationsEqual(location, value);

    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleFilterSelect(value);
        }}
        className="flex justify-between py-3 block text-materialPurple w-full max-w-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        style={{ display: "block" }}
      >
        {value.city}
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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between py-3 block text-materialPurple w-full max-w-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200">
          <span className="flex-grow mx-2 bg-gray-300 h-6 rounded"></span>
        </div>
        <div className="flex justify-between py-3 block text-materialPurple w-full max-w-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200">
          <span className="flex-grow mx-2 bg-gray-300 h-6 rounded"></span>
        </div>
        <div className="flex justify-between py-3 block text-materialPurple w-full max-w-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200">
          <span className="flex-grow mx-2 bg-gray-300 h-6 rounded"></span>
        </div>
        <div className="flex justify-between py-3 block text-materialPurple w-full max-w-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200">
          <span className="flex-grow mx-2 bg-gray-300 h-6 rounded"></span>
        </div>
      </div>
    );
  }

  return (
    <div
      class="max-h-64 overflow-y-scroll"
      style={{
        scrollbarWidth: "none",
        scrollbarColor: "transparent transparent",
      }}
    >
      {locations.map((item) => (
        <LocationList key={item} value={item} />
      ))}
    </div>
  );
}

function PriceFilter({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  rate,
  setRate,
}) {
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
    setRate(value);
  };

  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
  };

  const RadioButton = ({ label, value }) => {
    const isSelected = rate === value;

    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleRateChange(value);
        }}
        className={`text-lg py-3 text-materialPurple border-b-2 border-materialPurpleOpaque ${
          isSelected ? "border-neonPink text-neonPink" : ""
        }`}
        style={{ display: "block" }}
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
}

function DeliveryFilter({ selectedDeliveryOption, setSelectedDeliveryOption }) {
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
    setSelectedDeliveryOption(value);
  };

  const RadioButton = ({ label, value }) => {
    const isSelected =
      selectedDeliveryOption &&
      selectedDeliveryOption.deliveryOnline === value.deliveryOnline &&
      selectedDeliveryOption.deliveryInPerson === value.deliveryInPerson;

    return (
      <a
        href="#"
        onClick={() => handleDeliveryChange(value)}
        className={`text-lg py-3 text-materialPurple border-b-2 border-materialPurpleOpaque ${
          isSelected ? "border-neonPink text-neonPink" : ""
        }`}
        style={{ display: "block" }}
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
        fontColor: "#857a98",
      },
      animation: {
        bounce: "bounce 1s infinite",
      },
    },
  },
};
