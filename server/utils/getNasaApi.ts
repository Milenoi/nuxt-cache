const getNasaApi = () => {
  const config = useRuntimeConfig();
  return `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=4102&api_key=${config.nasaApiKey}`;
};

export default getNasaApi;
