"use client";
import { LoaderCircle, TriangleAlert } from "lucide-react";
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
export function Loading() {
  return (
    <div className="state-box" role="status">
      <LoaderCircle size={24} className="spin" />
      <h2>Getting things ready</h2>
      <p>Loading your saved session.</p>
    </div>
  );
}
export function ErrorBox({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="error-box" role="alert">
      <TriangleAlert size={20} />
      <div>
        <p>{message}</p>
        {retry && (
          <button type="button" className="button secondary" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
export function PageHeading({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
