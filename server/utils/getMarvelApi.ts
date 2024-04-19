import crypto from "crypto";

const getMarvelApi = (id: string): string => {
  const config = useRuntimeConfig();

  const publicApiKey = config.marvelPublicApiKey;
  const secretApiKey = config.marvelSecretApiKey;
  const timestamp = Math.floor(Date.now() / 1000).toString(); // Get current timestamp in seconds

  const generateMD5 = (
    timestamp: string,
    secretApiKey: string,
    publicApiKey: string,
  ): string => {
    const stringToHash: string = timestamp + secretApiKey + publicApiKey;
    return crypto.createHash("md5").update(stringToHash).digest("hex");
  };

  const md5Hash = generateMD5(timestamp, secretApiKey, publicApiKey);

  return `http://gateway.marvel.com/v1/public/characters/${id}?ts=${timestamp}&apikey=${config.marvelPublicApiKey}&hash=${md5Hash}&limit=100`;
};

export default getMarvelApi;
