export default function AccountLoading() {

  return (

    <div className="container-dv section-pad">

      <div className="h-10 w-48 animate-pulse rounded-[12px] mb-8" style={{ background: 'rgba(22,32,25,.08)' }} />

      <div className="grid gap-4">

        {[1,2,3].map((i) => (

          <div key={i} className="h-24 animate-pulse rounded-[20px]" style={{ background: 'rgba(22,32,25,.06)' }} />

        ))}

      </div>

    </div>

  );

}