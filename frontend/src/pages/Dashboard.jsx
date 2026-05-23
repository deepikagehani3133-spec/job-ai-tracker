import MainLayout from "../layouts/MainLayout";

function Dashboard() {
  return (
    <MainLayout>
      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-zinc-400 mb-2">Applied Jobs</h2>
          <p className="text-3xl font-bold">24</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-zinc-400 mb-2">Interviews</h2>
          <p className="text-3xl font-bold">8</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-zinc-400 mb-2">Offers</h2>
          <p className="text-3xl font-bold">2</p>
        </div>

      </div>
    </MainLayout>
  );
}

export default Dashboard;