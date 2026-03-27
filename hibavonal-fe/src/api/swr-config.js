//alapértelmezett fetcher függvény
export const fetcher = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error('Hiba történt az adott lekérdezéskor.');
    error.status = response.status;
    throw error;
  }

  return response.json();
};

//globális swr beállítások
export const swrOptions = {
  fetcher,
  revalidateOnFocus: false, //ne kérdezze le újra ablak váltásnál
  dedupingInterval: 500, //5 másodpercen belüli azonos kérések összevonása
};
