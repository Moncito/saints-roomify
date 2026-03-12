import type { Route } from "./+types/tags";
import Navbar from "../../components/Navbar";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Tags | Roomify" }];
}

export default function Tags() {
  return (
    <div className="home">
      <Navbar />
      <h1>Tags</h1>
    </div>
  );
}