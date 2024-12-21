import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

const BASE_URL = "http://localhost:8000";

const CityContext = createContext();

const initial_state = {
  cities: [],
  isLoading: false,
  currentCity: {},
};
function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return { ...state, cities: action.payload, isLoading: false };
    case "city/loaded":
      return { ...state, currentCity: action.payload, isLoading: false };
    case "city/created":
      return {
        ...state,
        cities: [...state.cities, action.payload],
        isLoading: false,
      };
    case "city/deleted":
      return {
        ...state,
        cities: state.cities.filter((city) => city.id !== action.payload),
        isLoading: false,
      };
    default:
      throw new Error("Wrong type");
  }
}
function CityProvider({ children }) {
  const [{ cities, isLoading, currentCity }, despatch] = useReducer(
    reducer,
    initial_state
  );

  useEffect(function () {
    async function getCities() {
      try {
        despatch({ type: "loading" });
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        despatch({ type: "cities/loaded", payload: data });
      } catch (err) {
        alert(err);
      }
    }

    getCities();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (currentCity.id === id) return;
      try {
        despatch({ type: "loading" });
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await res.json();
        despatch({ type: "city/loaded", payload: data });
      } catch (err) {
        console.error(err.name);
      }
    },
    [currentCity.id]
  );
  async function createCity(newCity) {
    try {
      despatch({ type: "loading" });
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      despatch({ type: "city/created", payload: data });
    } catch (err) {
      alert("There was an error creating city");
    }
  }
  async function deleteCity(id) {
    try {
      despatch({ type: "loading" });
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      despatch({ type: "city/deleted", payload: id });
    } catch (err) {
      alert("There was an error deleting city");
    }
  }

  return (
    <CityContext.Provider
      value={{
        cities,
        isLoading,
        getCity,
        currentCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

function useCities() {
  const context = useContext(CityContext);
  if (context === undefined)
    throw new Error("CityContext was used ouside the CityProvider");
  return context;
}

export { CityProvider, useCities };
