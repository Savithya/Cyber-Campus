import Link from "next/link";
export default function Page() {
  return (
    <div className="narrow page-space">
      <h1>This campus path doesn’t exist.</h1>
      <Link className="button primary" href="/">
        Return home
      </Link>
    </div>
  );
}
