export default function Footer() {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="invisible">.</span>
      <p className="space-x-1 text-center">
        &copy; {new Date().getFullYear()} brainypal
      </p>
      <span className="text-sm">powered by daggy</span>
    </div>
  );
}
