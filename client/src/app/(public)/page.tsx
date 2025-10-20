import { Suspense } from "react";
import Home from "../_pages/home/pageHome";

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  );
}
