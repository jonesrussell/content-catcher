import AnimatedHome from "@/components/AnimatedHome";

export default function HomePage() {
  console.log("Homepage server component rendering");
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <AnimatedHome />
    </main>
  );
}
