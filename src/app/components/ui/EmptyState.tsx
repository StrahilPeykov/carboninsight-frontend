export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center text-gray-500">
      <p className="text-lg">{message}</p>
    </div>
  );
}
