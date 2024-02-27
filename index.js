const baseUrl = "https://us-central1-skillair-1.cloudfunctions.net";

function App() {
  const [showSkillDetails, setShowSkillDetails] = React.useState(false);
  const [selectedSkillId, setSelectedSkillId] = React.useState(null);
  const [showSearchResults, setShowSearchResults] = React.useState(true);

  const handleSelectSkill = (id) => {
    setSelectedSkillId(id);
    setShowSkillDetails(true);
    setShowSearchResults(false);
  };

  const handleSearchBoxClick = () => {
    setShowSearchResults(true);
  };

  const appContainerRef = React.useRef(null);

  return (
    <div ref={appContainerRef} className="w-1/2 mx-auto">
      <div id="search" className="container mx-auto px-4 py-8 mt-10">
        <h1 className="text-3xl font-bold mb-4 text-center text-materialPurple">
          Skill Search
        </h1>
        <SearchBox
          handleSelectSkill={handleSelectSkill}
          showSearchResults={showSearchResults}
          onSearchBoxClick={handleSearchBoxClick}
        />
        {showSkillDetails && (
          <Details selectedSkillId={selectedSkillId} baseUrl={baseUrl} />
        )}
      </div>
    </div>
  );
}

function SearchResult({ image, name, id, handleSelectSkill }) {
  const handleClick = () => {
    handleSelectSkill(id);
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
}

function Filter() {
  const [showOptions, setShowOptions] = React.useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const filterOptions = [
    { label: "Option 1", onClick: () => console.log("Option 1 clicked") },
    { label: "Option 2", onClick: () => console.log("Option 2 clicked") },
    { label: "Option 3", onClick: () => console.log("Option 3 clicked") },
  ];

  return (
    <div className="relative">
      <button
        className="flex justify-between items-center w-full border bg-neonPink text-white border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-gray-300"
        onClick={toggleOptions}
      >
        <span>Filter</span>
        <i className="fa-solid fa-filter text-white-400"></i>
      </button>
      {showOptions && <Modal onClose={toggleOptions} options={filterOptions} />}
    </div>
  );
}

function SearchBox({ handleSelectSkill, showSearchResults, onSearchBoxClick }) {
  const [searchText, setSearchText] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [displayCount, setDisplayCount] = React.useState(10);

  const handleChange = (e) => {
    const searchText = e.target.value;
    setSearchText(searchText);
    setResults([]);
    setDisplayCount(10);

    if (searchText.trim().length >= 3) {
      fetchResults(searchText);
    }
  };

  const handleFocus = () => {
    onSearchBoxClick(); // Show results when focused
  };

  const handleBlur = () => {
    // Hide results when blurred and no text is entered
    if (!searchText.trim()) {
      onSearchBoxClick();
    }
  };

  function loadMoreResults() {
    setTimeout(() => {
      setDisplayCount((prevDisplayCount) => prevDisplayCount + 10);
    }, 800);
  }

  const fetchResults = (searchText) => {
    setLoading(true);

    const requestBody = {
      text: searchText,
    };

    fetch(`${baseUrl}/search`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        swal.fire({
          title: "Error",
          text: "An error occurred while fetching results",
          icon: "error",
        });
      });
  };

  const handleScroll = () => {
    const scrollTop =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;
    const scrollHeight =
      (document.documentElement && document.documentElement.scrollHeight) ||
      document.body.scrollHeight;
    const clientHeight =
      document.documentElement.clientHeight || window.innerHeight;
    const scrolledToBottom =
      Math.ceil(scrollTop + clientHeight) >= scrollHeight;

    if (scrolledToBottom && !loading) {
      loadMoreResults();
    }
  };

  return (
    <div className="relative">
      <div
        className="flex justify-between items-center mb-4"
        onClick={onSearchBoxClick}
      >
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <i className="fa-solid fa-search text-neonPink"></i>
          </span>
        </div>
        <input
          name="searchBar"
          type="text"
          className="w-full border border-gray-300 rounded-md py-2 px-10 pr-4 pl-10 focus:outline-none focus:border-neonPink"
          value={searchText}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search"
        />
        {/* <Filter /> */}
      </div>

      {showSearchResults && (
        <div
          id="results-container"
          className="-mt-3 w-full absolute bg-white rounded-md  shadow-lg overflow-hidden z-10"
          style={{
            maxHeight: "44vh",
            overflowY: "scroll",
            scrollbarWidth: "none",
          }}
          onScroll={handleScroll}
        >
          <table className="w-full">
            <tbody>
              {results.slice(0, displayCount).map((item, index) => (
                <SearchResult
                  key={index}
                  image={item.image}
                  name={item.name}
                  id={item.id}
                  handleSelectSkill={handleSelectSkill}
                />
              ))}
            </tbody>
          </table>
          {loading && (
            <div>
              <div className="text-center text-neonPink">
                <i className="fas fa-spinner fa-spin text-xl"></i>
              </div>
              <div className="text-center text-neonPink">
                <p>Loading...</p>
              </div>
            </div>
          )}
          {results.length > displayCount && (
            <div className="animate-bounce text-center text-neonPink">
              <i className="fas fa-chevron-down text-xl"></i>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Modal({ isOpen, onClose, options }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="flex space-x-4">
            <button type="button" className="text-red-500" onClick={onClose}>
              Reset
            </button>
            <button onClick={onClose}>Done</button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {options.map((option, index) => (
            <button
              type="button"
              key={index}
              className="flex justify-between items-center py-3 block text-gray-700"
              onClick={() => {
                option.onClick();
                onClose();
              }}
            >
              <span className="flex-grow">{option.label}</span>
              <i className="fa-solid fa-chevron-right text-gray-400"></i>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Details({ selectedSkillId, baseUrl }) {
  const [data, setData] = React.useState({ category: {} });
  const [imageUrls, setImageUrls] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/getOne?id=${selectedSkillId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        swal.fire({
          title: "Error",
          text: "An error occurred while fetching details",
          icon: "error",
        });
      });

    fetch(`${baseUrl}/getSkillImages?id=${selectedSkillId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const urls = data.map((image) => image.image);
        setImageUrls(urls);
        setLoading(false);
      })
      .catch((error) => {
        swal.fire({
          title: "Error",
          text: "An error occurred while fetching images",
          icon: "error",
        });
      });

    return () => {
      setData({ category: {} });
      setImageUrls([]);
    };
  }, [selectedSkillId, baseUrl]);

  const handleSelectImage = (index) => {
    setCurrentImageIndex(index);
    console.log("currentImageIndex", imageUrls[currentImageIndex]);
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
              <div className="flex flex-col gap-2 text-sm leading-loose mt-10">
                <span className="text-materialPurple font-extrabold text-xl bg-gray-300 h-6 rounded"></span>
                <p className="text-lg text-materialPurple bg-gray-300 h-6 rounded"></p>
              </div>
            </div>
            <hr className="border-neonPink" />
            <div>
              <div className="flex flex-col gap-2 text-sm leading-loose">
                <span className="text-materialPurple font-extrabold text-xl bg-gray-300 h-6 rounded"></span>
                <p className="text-lg text-materialPurple bg-gray-300 h-6 rounded"></p>
              </div>
              <div className="flex flex-col gap-2 text-sm leading-loose">
                <span className="text-materialPurple font-extrabold text-xl bg-gray-300 h-6 rounded"></span>
                <p className="text-lg text-materialPurple bg-gray-300 h-6 rounded"></p>
              </div>
              <div className="flex flex-col gap-2 text-sm leading-loose">
                <span className="text-materialPurple font-extrabold text-xl bg-gray-300 h-6 rounded"></span>
                <p className="text-lg text-materialPurple bg-gray-300 h-6 rounded"></p>
              </div>
            </div>
            <hr className="border-neonPink" />
            <div className="grid gap-4">
              <h2 className="text-2xl font-extrabold text-materialPurple"></h2>
              <p className="text-lg text-materialPurple"></p>
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
          <hr className="border-neonPink" />

          <div>
            <div className="flex flex-col gap-2 text-sm leading-loose">
              <span className="text-materialPurple font-extrabold text-xl">
                Duration
              </span>
              <p className="text-lg text-materialPurple">{duration}</p>
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

          <hr className="border-neonPink" />

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

ReactDOM.render(<App />, document.getElementById("search"));

tailwind.config = {
  theme: {
    fontFamily: {
      sans: ["Montserrat", "sans-serif"],
    },
    extend: {
      colors: {
        neonPink: "#fe0198",
        materialPurple: "#47277b",
        fontColor: "#857a98",
      },
      animation: {
        bounce: "bounce 1s infinite",
      },
    },
  },
};
