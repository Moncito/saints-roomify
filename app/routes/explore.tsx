import type { Route } from "./+types/explore";
import Navbar from "../../components/Navbar";

export function meta(_args: Route.MetaArgs) {
  return [{ title: "Explore | Roomify" }];
}

export default function Explore() {
  return (
    <div className="home">
      <Navbar />
      <h1>Explore</h1>
    </div>
  );
}