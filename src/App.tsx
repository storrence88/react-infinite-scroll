import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useAsyncList } from "react-stately";

const API_KEY = "40f8h6GzCSmMWYH3aBVw0iywf4u5P5BH5nBHySf8cHVTy4cr98GweNBB";
const BASE_API_URL = "https://api.pexels.com/v1/search";

export interface ImageSearchResponse {
  page: number;
  per_page: number;
  photos: Photo[];
  total_results: number;
  next_page: string;
}

export interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: Src;
  liked: boolean;
  alt: string;
}

export interface Src {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

function App() {
  const list = useAsyncList<Photo>({
    async load({ signal, cursor }) {
      // If no cursor is available, then we're loading the first page.
      // Otherwise, the cursor is the next URL to load, as returned from the previous page.
      const res = await fetch(cursor || `${BASE_API_URL}?query=nature&page=1`, {
        headers: {
          Authorization: API_KEY,
        },
        signal,
      });
      const json = (await res.json()) as ImageSearchResponse;
      return {
        items: json.photos,
        cursor: `${BASE_API_URL}?query=nature&page=${json.page + 1}`,
      };
    },
  });

  const { ref, inView } = useInView({
    rootMargin: "1000px",
  });
  const listRef = useRef(list);

  useEffect(() => {
    listRef.current = list;
    console.log("Setting current list");
  }, [list]);

  useEffect(() => {
    if (listRef.current.items.length && !listRef.current.isLoading && inView) {
      console.log("Loading more...", Date.now());
      listRef.current.loadMore();
    }
  }, [inView]);

  return (
    <main>
      {list.items.map((item) => (
        <div
          key={item.id}
          className="item"
          style={{
            aspectRatio: item.width / item.height,
          }}
        >
          <img src={item.src.original} alt={item.alt} />
        </div>
      ))}
      <div ref={ref} className="loading"></div>
    </main>
  );
}

export default App;
