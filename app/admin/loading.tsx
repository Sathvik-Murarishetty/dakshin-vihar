export default function AdminLoading() {

  return (

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

      {[1,2,3,4,5,6].map((i) => (

        <div key={i} className="h-28 animate-pulse rounded-[20px]" style={{ background: 'rgba(22,32,25,.06)' }} />

      ))}

    </div>

  );

}